import { chromium, Browser } from 'playwright';
import { MarketItem } from '../../types';
import { Scraper } from './ScraperInterface';
import * as fs from 'fs';

export class VDABScraper implements Scraper {
    name = "VDAB";
    private location = "Gent";
    private distance = 30; // km

    async scrape(query: string, _location?: string): Promise<MarketItem[]> {
        // CORRECT VDAB URL format (from browser inspection)
        const searchUrl = `https://www.vdab.be/vindeenjob/vacatures?trefwoord=${encodeURIComponent(query)}&locatie=9000%20Gent&afstand=20&sort=standaard`;
        console.log(`[VDAB] Fetching via Playwright: ${searchUrl}`);

        let browser: Browser | undefined;
        try {
            browser = await chromium.launch({ headless: false });
            const page = await browser.newPage();

            await page.setExtraHTTPHeaders({
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'nl-BE,nl;q=0.9,en;q=0.8'
            });

            await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

            // Wait for REAL job listings to load (from browser inspection)
            try {
                await page.waitForSelector('li.c-vacature', { timeout: 10000 });
                console.log("[VDAB] Job cards loaded successfully!");
            } catch {
                console.log("[VDAB] Timeout waiting for li.c-vacature. Checking if results exist...");
            }

            // Small delay to ensure content is loaded
            await page.waitForTimeout(2000);

            const { items, logBuffer } = await page.evaluate(() => {
                const results: any[] = [];
                const logs: string[] = [];

                // CORRECT selector from browser inspection: li.c-vacature
                const listings = document.querySelectorAll('li.c-vacature');

                logs.push(`Found ${listings.length} job listings using li.c-vacature selector.`);

                if (listings.length === 0) {
                    logs.push("ERROR: No job listings found with selector li.c-vacature");
                    logs.push("Page might have changed structure or search returned no results.");
                    return { items: results, logBuffer: logs.join('\n') };
                }

                listings.forEach((el, index) => {
                    try {
                        // CORRECT selectors from browser inspection
                        const titleEl = el.querySelector('.c-vacature__content-title a');
                        const companyEl = el.querySelector('.c-vacature-meta.-location strong:nth-of-type(1)');
                        const locationEl = el.querySelector('.c-vacature-meta.-location strong:nth-of-type(2)');

                        // Get the job URL
                        let href = "";
                        if (titleEl) {
                            href = titleEl.getAttribute('href') || "";
                        }

                        // Make URL absolute
                        if (href && !href.startsWith('http')) {
                            href = `https://www.vdab.be${href}`;
                        }

                        if (titleEl && href) {
                            results.push({
                                id: href,
                                title: titleEl.textContent?.trim() || "Unknown Job",
                                price: "N/A",
                                location: locationEl?.textContent?.trim() || "Gent area",
                                url: href,
                                seller: companyEl?.textContent?.trim() || "See listing",
                                source: "VDAB",
                                description: "" // Will be filled by fetchFullDescriptions
                            });
                        } else {
                            if (index < 3) {
                                logs.push(`Skipped ${index}: Title=${!!titleEl}, Href=${!!href}`);
                            }
                        }
                    } catch (err) {
                        logs.push(`Error processing listing ${index}: ${err}`);
                    }
                });

                return { items: results, logBuffer: logs.join('\n') };
            });

            console.log(`[VDAB] Evaluation logs:\n${logBuffer}`);

            if (items.length === 0) {
                console.log("[VDAB] No items found. Capturing debug snapshot.");
                await page.screenshot({ path: 'debug_vdab.png', fullPage: true });
                const html = await page.content();
                fs.writeFileSync('debug_vdab.html', html);
            } else {
                console.log(`[VDAB] Successfully scraped ${items.length} jobs.`);
            }

            // Fetch full descriptions for each job
            const itemsWithFullDesc = await this.fetchFullDescriptions(browser, items);

            return itemsWithFullDesc;

        } catch (error) {
            console.error(`[VDAB] Playwright Error: ${error}`);
            if (browser) {
                try {
                    await browser.contexts()[0]?.pages()[0]?.screenshot({ path: 'debug_vdab_error.png' });
                } catch {
                    // Ignore screenshot error
                }
            }
            return [];
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }

    /**
     * Fetches full job descriptions by navigating to detail pages
     */
    private async fetchFullDescriptions(browser: Browser, items: MarketItem[]): Promise<MarketItem[]> {
        console.log(`[VDAB] Fetching full descriptions for ${items.length} jobs...`);

        const enrichedItems: MarketItem[] = [];

        for (const item of items.slice(0, 10)) { // Limit to first 10 to avoid excessive scraping
            try {
                const page = await browser.newPage();
                await page.goto(item.url, { waitUntil: 'domcontentloaded', timeout: 30000 });

                // Wait for job description content
                await page.waitForTimeout(1500);

                const fullDescription = await page.evaluate(() => {
                    // Try to find the full job description
                    const descSelectors = [
                        '[data-testid="job-description"]',
                        '.job-description',
                        '.vacancy-description',
                        'article',
                        'main'
                    ];

                    for (const selector of descSelectors) {
                        const el = document.querySelector(selector);
                        if (el && el.textContent && el.textContent.length > 100) {
                            return el.textContent.trim();
                        }
                    }

                    return document.body.textContent?.trim() || "";
                });

                enrichedItems.push({
                    ...item,
                    description: fullDescription.substring(0, 5000) // Limit to 5000 chars
                });

                await page.close();
                console.log(`[VDAB] ✓ Fetched description for: ${item.title}`);

            } catch (error) {
                console.error(`[VDAB] Failed to fetch description for ${item.title}:`, error);
                enrichedItems.push(item); // Keep original item
            }
        }

        return enrichedItems;
    }
}

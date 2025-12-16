import { chromium } from 'playwright';
import { MarketItem } from '../marketplaceAgent';
import { Scraper } from './ScraperInterface';


export class WeWorkRemotelyScraper implements Scraper {
    name = "WeWorkRemotely (WWR)";

    async scrape(query: string, location?: string): Promise<MarketItem[]> {
        const searchUrl = `https://weworkremotely.com/remote-jobs/search?term=${encodeURIComponent(query)}`;
        console.log(`[WeWorkRemotely] Fetching via Playwright: ${searchUrl}`);

        let browser;
        try {
            browser = await chromium.launch({ headless: false });
            const page = await browser.newPage();

            await page.setExtraHTTPHeaders({
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            });

            await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });

            const title = await page.title();
            const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
            console.log(`[WeWorkRemotely] Page Title: ${title}`);

            // Check if we are blocked
            if (title.includes("Just a moment") || bodyText.includes("Cloudflare")) {
                console.error("[WeWorkRemotely] Cloudflare challenge detected.");
                return [];
            }

            // Wait for items
            try {
                await page.waitForSelector('li.feature, .jobs article', { timeout: 10000 });
            } catch (e) {
                console.log("[WeWorkRemotely] Timeout waiting for list selector. Proceeding...");
            }

            const { items, logBuffer } = await page.evaluate(() => {
                const logs: string[] = [];
                const results: any[] = [];
                try {
                    const listings = document.querySelectorAll('li.feature, li article, .jobs article, .new-listing');
                    logs.push(`Found ${listings.length} potential listing elements.`);

                    listings.forEach((el, index) => {
                        try {
                            const titleEl = el.querySelector('.title, h1, h2, h3');
                            const companyEl = el.querySelector('.company, .company-name');
                            const regionEl = el.querySelector('.region, .location');

                            const allLinks = el.querySelectorAll('a');
                            let href = "";
                            // Look for link inside first
                            for (const link of Array.from(allLinks)) {
                                const h = link.getAttribute('href');
                                if (h && (h.includes('/remote-jobs/') || h.includes('weworkremotely.com'))) {
                                    href = h;
                                    break;
                                }
                            }

                            if (href && !href.startsWith('http')) {
                                href = `https://weworkremotely.com${href}`;
                            }

                            if (titleEl && href) {
                                results.push({
                                    id: href,
                                    title: titleEl.textContent?.trim() || "Unknown Role",
                                    price: "N/A",
                                    location: regionEl?.textContent?.trim() || "Remote",
                                    url: href,
                                    seller: companyEl?.textContent?.trim(),
                                    source: "WeWorkRemotely"
                                });
                            } else {
                                if (index < 5) logs.push(`Skipped Item ${index}: Title=${!!titleEl}, Href=${!!href}`);
                            }
                        } catch (err) {
                            logs.push(`Error processing item ${index}: ${err}`);
                        }
                    });
                } catch (mainErr) {
                    logs.push(`CRITICAL ERROR in evaluate: ${mainErr}`);
                }
                return { items: results, logBuffer: logs.join('\n') };
            });

            console.log(`[WeWorkRemotely] Scraped ${items.length} items.`);

            if (items.length === 0) {
                console.log("[WeWorkRemotely] No items found. Taking debug screenshot...");
                const fs = await import('fs');
                fs.writeFileSync('debug_scraper_log.txt', logBuffer);
                console.log("[WWR Debug Log]:\n", logBuffer);
                try {
                    await page.screenshot({ path: 'debug_wwr.png', fullPage: true });
                } catch (e) {
                    console.error("Screenshot failed:", e);
                }
            }

            return items;

        } catch (error) {
            console.error(`[WeWorkRemotely] Playwright Error: ${error} `);
            return [];
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }
}

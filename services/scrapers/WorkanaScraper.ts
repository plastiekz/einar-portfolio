import { chromium, Browser } from 'playwright';
import { MarketItem } from '../../types';
import { Scraper } from './ScraperInterface';
import * as fs from 'fs';

export class WorkanaScraper implements Scraper {
    name = "Workana";

    async scrape(query: string, _location?: string): Promise<MarketItem[]> {
        // Workana Search URL
        const searchUrl = `https://www.workana.com/jobs?query=${encodeURIComponent(query)}`;
        console.log(`[Workana] Fetching via Playwright: ${searchUrl}`);

        let browser: Browser | undefined;
        try {
            browser = await chromium.launch({ headless: false });
            const page = await browser.newPage();

            await page.setExtraHTTPHeaders({
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9'
            });

            await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

            // Check if blocked by Cloudflare or similar
            const title = await page.title();
            if (title.includes("Just a moment") || title.includes("Access denied")) {
                console.error("[Workana] Access Denied/Challenge detected.");
                return [];
            }

            // Wait for project list
            try {
                await page.waitForSelector('.project-item, .projects', { timeout: 5000 });
            } catch {
                console.log("[Workana] Timeout waiting for .project-item.");
            }

            const { items } = await page.evaluate(() => {
                const results: any[] = [];
                const logs: string[] = [];

                // Workana uses .project-item usually
                const listings = document.querySelectorAll('.project-item');
                logs.push(`Found ${listings.length} .project-item elements.`);

                listings.forEach((el, index) => {
                    const titleEl = el.querySelector('.project-title a') || el.querySelector('h2 a');
                    const budgetEl = el.querySelector('.budget .values') || el.querySelector('.values');
                    const descEl = el.querySelector('.details') || el.querySelector('.expander');

                    let href = titleEl?.getAttribute('href') || "";
                    if (href && !href.startsWith('http')) {
                        href = `https://www.workana.com${href}`;
                    }

                    if (titleEl && href) {
                        results.push({
                            id: href,
                            title: titleEl.textContent?.trim() || "Unknown Project",
                            price: budgetEl?.textContent?.trim() || "N/A",
                            location: "Remote", // Workana is mostly remote/freelance
                            url: href,
                            seller: "Check Link", // Workana doesn't always show client name plainly on search
                            source: "Workana",
                            description: descEl?.textContent?.trim().substring(0, 100)
                        });
                    } else {
                        if (index < 3) logs.push(`Skipped ${index}: Title=${!!titleEl}, Href=${!!href}`);
                    }
                });
                return { items: results, logBuffer: logs.join('\n') };
            });

            if (items.length === 0) {
                console.log("[Workana] No items found. Capturing debug snapshot.");
                await page.screenshot({ path: 'debug_workana.png', fullPage: true });
                const html = await page.content();
                fs.writeFileSync('debug_workana.html', html);
            }

            return items;

        } catch (error) {
            console.error(`[Workana] Playwright Error: ${error}`);
            if (browser) {
                try {
                    await browser.contexts()[0]?.pages()[0]?.screenshot({ path: 'debug_workana_error.png' });
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
}

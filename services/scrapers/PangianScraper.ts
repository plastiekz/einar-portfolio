import { chromium } from 'playwright';
import { MarketItem } from '../../types';
import { Scraper } from './ScraperInterface';
import * as fs from 'fs';

export class PangianScraper implements Scraper {
    name = "Pangian";

    async scrape(query: string, location?: string): Promise<MarketItem[]> {
        // Pangian search structure - usually just the main board + search?
        // Trying generic search URL pattern or fallback to main list with filter
        const searchUrl = `https://pangian.com/?s=${encodeURIComponent(query)}`;
        console.log(`[Pangian] Fetching via Playwright: ${searchUrl}`);

        let browser;
        try {
            browser = await chromium.launch({ headless: false });
            const page = await browser.newPage();

            await page.setExtraHTTPHeaders({
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            });

            await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

            // Handle Splash Screen: Wait for it to disappear
            try {
                // The splash screen has ID #pangian-splash-screen and likely gets 'fade-out' class or 'splash-hidden'
                await page.waitForSelector('#pangian-splash-screen', { state: 'hidden', timeout: 15000 });
                console.log("[Pangian] Splash screen cleared.");
            } catch (e) {
                console.log("[Pangian] Splash screen wait timeout (might not exist or already gone).");
            }

            // Wait for Angular app to be ready (look for class .app-ready on body or just content)
            try {
                await page.waitForSelector('app-root div', { timeout: 10000 });
            } catch (e) { console.log("[Pangian] Waiting for app-root children timed out."); }

            // Wait for potential results
            try {
                // Try searching for common job list containers - updated selectors based on Angular structure often used
                // 'app-job-list', 'app-job-card', '.job-card'
                await page.waitForSelector('.job-list, app-job-card, .card, .jobs-list, article', { timeout: 10000 });
            } catch (e) {
                console.log("[Pangian] Timeout waiting for explicit job selectors. Proceeding to evaluate...");
            }

            const { items, logBuffer } = await page.evaluate(() => {
                const results: any[] = [];
                const logs: string[] = [];

                let listings = document.querySelectorAll('.job-list, app-job-card, .card, .jobs-list, article, .job-item, .job_listing');

                if (listings.length === 0) {
                    logs.push("No explicit job containers found. Trying generic fallback...");
                    // Fallback: finding all 'a' tags that look like job posts
                    const allLinks = Array.from(document.querySelectorAll('a'));
                    const likelyJobLinks = allLinks.filter(a => {
                        const href = a.getAttribute('href') || "";
                        return (href.includes('/job/') || href.includes('/remote-jobs/')) && a.innerText.length > 10;
                    });

                    // Use the parents of these links as listings
                    listings = likelyJobLinks.map(a => a.closest('div') || a) as any;
                    logs.push(`Found ${listings.length} items via generic link search.`);
                }

                logs.push(`Final processing count: ${listings.length}`);

                listings.forEach((el, index) => {
                    const titleEl = el.querySelector('h3, h2, .job-title, .entry-title') || el.querySelector('a'); // Fallback to link text
                    const companyEl = el.querySelector('.company, .employer, .meta-company');
                    const locationEl = el.querySelector('.location, .meta-location');

                    const linkEl = el.querySelector('a');
                    let href = linkEl?.getAttribute('href') || "";
                    if (!href && (el as any).href) href = (el as any).href; // If el is the anchor itself

                    // If links are on the title specifically
                    if (!href && titleEl && titleEl.tagName === 'A') {
                        href = titleEl.getAttribute('href') || "";
                    } else if (!href && titleEl) {
                        const tLink = titleEl.querySelector('a');
                        if (tLink) href = tLink.getAttribute('href') || "";
                    }

                    if (href && !href.startsWith('http')) {
                        href = `https://pangian.com${href}`; // Assumptions
                    }

                    if (titleEl && href) {
                        results.push({
                            id: href,
                            title: titleEl.textContent?.trim() || "Unknown Role",
                            price: "N/A",
                            location: locationEl?.textContent?.trim() || "Remote",
                            url: href,
                            seller: companyEl?.textContent?.trim(),
                            source: "Pangian"
                        });
                    } else {
                        if (index < 3) logs.push(`Skipped ${index}: Title=${!!titleEl}, Href=${!!href}`);
                    }
                });
                return { items: results, logBuffer: logs.join('\n') };
            });

            // Debugging
            if (logBuffer) {
                // fs isn't available in browser context, but we return the string to Node
                // We'll write it here if needed, but console log is fine for CLI info
                // console.log("[Pangian Debug]", logBuffer);
            }

            if (items.length === 0) {
                console.log("[Pangian] No items found. Capturing debug snapshot.");
                await page.screenshot({ path: 'debug_pangian.png', fullPage: true });
                const html = await page.content();
                fs.writeFileSync('debug_pangian.html', html);
            }

            return items;

        } catch (error) {
            console.error(`[Pangian] Playwright Error: ${error}`);
            // Attempt screenshot on error if browser is open
            if (browser) {
                // catch screenshot errors separately
                try {
                    // @ts-ignore
                    await browser.contexts()[0]?.pages()[0]?.screenshot({ path: 'debug_pangian_error.png' });
                } catch (e) { }
            }
            return [];
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }
}

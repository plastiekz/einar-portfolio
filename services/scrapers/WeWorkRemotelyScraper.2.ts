import { chromium } from 'playwright';
import { MarketItem } from '../marketplaceAgent';
import { Scraper } from './ScraperInterface';


export class WeWorkRemotelyScraper implements Scraper {
    name = "WeWorkRemotely";

    async scrape(query: string, location?: string): Promise<MarketItem[]> {
        const searchUrl = `https://weworkremotely.com/remote-jobs/search?term=${encodeURIComponent(query)}`;
        console.log(`[WeWorkRemotely] Fetching via Playwright: ${searchUrl}`);

        let browser;
        try {
            browser = await chromium.launch({ headless: true });
            const page = await browser.newPage();

            await page.setExtraHTTPHeaders({
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            });

            await page.goto(searchUrl, { waitUntil: 'networkidle' });

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
                await page.waitForSelector('.new-listing', { timeout: 5000 });
            } catch (e) {
                console.log("[WeWorkRemotely] Timeout waiting for .new-listing selector.");
            }

            const items = await page.evaluate(() => {
                const results: any[] = [];

                const listings = document.querySelectorAll('.new-listing');

                listings.forEach((el, index) => {
                    const titleEl = el.querySelector('.new-listing__header__title') || el.querySelector('.title');
                    const companyEl = el.querySelector('.new-listing__company') || el.querySelector('.company');
                    const regionEl = el.querySelector('.new-listing__region') || el.querySelector('.region');

                    const allLinks = el.querySelectorAll('a');
                    let href = "";

                    // Look for link inside first
                    for (const link of allLinks) {
                        const h = link.getAttribute('href');
                        if (h && (h.includes('/remote-jobs/') || h.includes('weworkremotely.com'))) {
                            href = h;
                            break;
                        }
                    }

                    // If not found inside, check if the element itself or its parent is an anchor
                    if (!href) {
                        const parentLink = el.closest('a');
                        if (parentLink) {
                            href = parentLink.getAttribute('href') || "";
                        }
                    }

                    // Fallback: check children for ANY link if still empty
                    if (!href && allLinks.length > 0) {
                        href = allLinks[0].getAttribute('href') || "";
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
                            seller: companyEl?.textContent?.trim() || "Unknown Company",
                            source: "WeWorkRemotely"
                        });
                    }
                });
                return results;
            });

            console.log(`[WeWorkRemotely] Scraped ${items.length} items.`);

            return items;

        } catch (error) {
            console.error(`[WeWorkRemotely] Playwright Error: ${error}`);
            return [];
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }
}

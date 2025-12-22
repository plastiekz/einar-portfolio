
import { chromium } from 'playwright';
import { Lead } from '../../types';

export class RealEstateScraper {
    async scrape(location: string): Promise<Lead[]> {
        // Fallback to Springfield IL URL as in the original code, but dynamic would be better.
        // For this task, we assume the location maps to a Craigslist URL or we construct one.
        // Simple mapping for demo:
        let url = 'https://springfield.craigslist.org/search/rea';
        if (location.toLowerCase().includes('chicago')) {
            url = 'https://chicago.craigslist.org/search/rea';
        }

        console.log(`[RealEstateScraper] Scraper starting for ${location} -> ${url}`);

        const browser = await chromium.launch({ headless: true });
        const results: Lead[] = [];

        try {
            const page = await browser.newPage();
            // Set User-Agent to avoid immediate blocks
            await page.setExtraHTTPHeaders({
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            });

            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

            // Wait a bit for potential hydration
            await page.waitForTimeout(2000);

            // Attempt to find items.
            // Craigslist structure varies, we look for typical list items.
            // Strategy: Look for 'li' that contains price and title.

            const items = await page.evaluate(() => {
                const leads: any[] = [];
                // Selector for recent Craigslist layout
                const elements = document.querySelectorAll('li.cl-static-search-result, li.result-row, div.gallery-card');

                elements.forEach((el, index) => {
                    const titleEl = el.querySelector('.title') || el.querySelector('.posting-title');
                    const priceEl = el.querySelector('.price') || el.querySelector('.amount');
                    const locationEl = el.querySelector('.location') || el.querySelector('.supertitle'); // sometimes area is here
                    const linkEl = el.querySelector('a');

                    const title = titleEl?.textContent?.trim() || "";
                    const priceRaw = priceEl?.textContent?.trim() || "0";
                    const price = parseInt(priceRaw.replace(/[^0-9]/g, '')) || 0;

                    let href = linkEl?.getAttribute('href') || "";
                    if (href && !href.startsWith('http')) {
                         href = window.location.origin + href;
                    }

                    if (title && price > 0) {
                        leads.push({
                            id: href || `cl-${index}`,
                            address: title + (locationEl ? ` (${locationEl.textContent?.trim()})` : ""),
                            price: price,
                            description: title, // Description is often on detail page, using title for list view
                            source: "Craigslist",
                            // url: href // Lead interface doesn't have url, map to id or description?
                            // The Lead interface has 'address', 'price', 'description', 'source'.
                        });
                    }
                });
                return leads;
            });

            console.log(`[RealEstateScraper] Found ${items.length} raw items.`);

            // Map to strict Lead interface
            items.forEach(item => {
                results.push({
                    id: item.id,
                    address: item.address, // mapping title to address as CL titles are like "3br - House for sale"
                    price: item.price,
                    description: item.description,
                    source: item.source
                });
            });

        } catch (error) {
            console.error("[RealEstateScraper] Error during scraping:", error);
        } finally {
            await browser.close();
        }

        return results;
    }
}

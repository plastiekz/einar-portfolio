import { Scraper } from './ScraperInterface';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { MarketItem } from '../../types';

export class TwoDeHandsScraper implements Scraper {
    name = "2dehands";

    async scrape(query: string, location?: string): Promise<MarketItem[]> {
        const searchUrl = `https://www.2dehands.be/q/${encodeURIComponent(query)}/`;
        // Normalize headers to look like a browser
        const headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8"
        };

        console.log(`[2dehands] Fetching: ${searchUrl}`);

        try {
            const response = await fetch(searchUrl, { headers });
            if (!response.ok) throw new Error(`HTTP ${response.status} - ${response.statusText}`);

            const html = await response.text();
            const dom = new JSDOM(html);
            const doc = dom.window.document;

            const listings = Array.from(doc.querySelectorAll('li.hz-Listing') || doc.querySelectorAll('article'));
            const items: MarketItem[] = [];

            listings.forEach((el) => {
                const element = el as Element;
                const titleEl = element.querySelector('.hz-Listing-title') || element.querySelector('h3');
                const priceEl = element.querySelector('.hz-Listing-price') || element.querySelector('.hz-text-price-label');
                const linkEl = element.querySelector('a');

                if (titleEl && linkEl) {
                    const title = titleEl.textContent?.trim() || "Unknown";
                    const url = linkEl.href.startsWith('http') ? linkEl.href : `https://www.2dehands.be${linkEl.href}`;

                    let priceString = priceEl?.textContent?.trim() || "0";
                    // Clean price: "€ 150,00" -> 150
                    priceString = priceString.replace('€', '').replace(/\./g, '').replace(',', '.').trim();
                    const price = parseFloat(priceString) || 0;

                    items.push({
                        id: url, // Use URL as ID
                        title,
                        price,
                        location: "Belgium",
                        url,
                        source: "2dehands"
                    });
                }
            });

            return items;

        } catch (error) {
            console.error("Error scraping 2dehands:", error);
            return [];
        }
    }
}

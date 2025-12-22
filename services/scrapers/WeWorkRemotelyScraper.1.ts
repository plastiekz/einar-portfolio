import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';
import { MarketItem } from '../../types';
import { Scraper } from './ScraperInterface';


export class WeWorkRemotelyScraper implements Scraper {
    name = "WeWorkRemotely";

    async scrape(query: string, location?: string): Promise<MarketItem[]> {
        // WWR Search URL format: https://weworkremotely.com/remote-jobs/search?term=typescript
        const searchUrl = `https://weworkremotely.com/remote-jobs/search?term=${encodeURIComponent(query)}`;
        console.log(`[WeWorkRemotely] Fetching: ${searchUrl}`);

        try {
            const response = await fetch(searchUrl, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                    "Accept-Language": "en-US,en;q=0.9",
                    "Accept-Encoding": "gzip, deflate, br",
                    "Connection": "keep-alive",
                    "Upgrade-Insecure-Requests": "1",
                    "Sec-Fetch-Dest": "document",
                    "Sec-Fetch-Mode": "navigate",
                    "Sec-Fetch-Site": "none",
                    "Sec-Fetch-User": "?1"
                }
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const html = await response.text();
            const dom = new JSDOM(html);
            const doc = dom.window.document;

            // WWR usually has <section class="jobs"><article>... or <ul><li>
            // On search results, it's often a list of <li> inside <ul>
            const jobItems = Array.from(doc.querySelectorAll('section.jobs ul li'));
            const items: MarketItem[] = [];

            jobItems.forEach((el) => {
                const element = el as Element;
                // Skip "view all" buttons or dividers
                if (element.classList.contains('view-all')) return;

                const linkEl = element.querySelector('a');
                if (!linkEl) return;

                // Title is usually within a span with class "title"
                const titleEl = element.querySelector('.title');
                const companyEl = element.querySelector('.company');
                const regionEl = element.querySelector('.region');

                // Get URL
                let href = linkEl.getAttribute('href') || "";
                if (href && !href.startsWith('http')) {
                    href = `https://weworkremotely.com${href}`;
                }

                if (titleEl && href) {
                    items.push({
                        id: href,
                        title: titleEl.textContent?.trim() || "Unknown Role",
                        price: "N/A", // Jobs usually don't show salary on listing
                        location: regionEl?.textContent?.trim() || "Remote",
                        url: href,
                        seller: companyEl?.textContent?.trim(),
                        source: "WeWorkRemotely"
                    });
                }
            });

            return items;

        } catch (error) {
            console.error(`[WeWorkRemotely] Error: ${error}`);
            return [];
        }
    }
}

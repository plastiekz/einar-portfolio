
import { chromium } from 'playwright';

async function main() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const url = 'https://www.zillow.com/homes/Springfield-IL_rb/';

    console.log(`Navigating to ${url}...`);
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        const content = await page.content();
        console.log("Page Content Length:", content.length);
        console.log("Title:", await page.title());

        // Try to identify listings
        const listings = await page.$$('article'); // Zillow often uses article tags for cards
        console.log(`Found ${listings.length} articles.`);

        // Also dump some classes to help identify
        const classes = await page.evaluate(() => {
            const els = document.querySelectorAll('*[class*="property-card"], *[class*="list-card"]');
            return Array.from(els).map(e => e.className).slice(0, 10);
        });
        console.log("Sample Classes:", classes);

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await browser.close();
    }
}

main();

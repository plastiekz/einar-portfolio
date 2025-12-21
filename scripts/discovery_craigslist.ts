
import { chromium } from 'playwright';

async function main() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const url = 'https://springfield.craigslist.org/search/rea';

    console.log(`Navigating to ${url}...`);
    try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        console.log("Title:", await page.title());

        const html = await page.content();
        console.log("HTML Sample:", html.substring(0, 500));

        // Check for specific CL classes
        const classes = await page.evaluate(() => {
             const els = document.querySelectorAll('*');
             const classList = new Set();
             els.forEach(e => e.classList.forEach(c => classList.add(c)));
             return Array.from(classList).filter(c => c.toString().startsWith('cl-') || c.toString().includes('result')).slice(0, 20);
        });
        console.log("Classes found:", classes);

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await browser.close();
    }
}

main();

import { marketplaceAgent } from '../services/marketplaceAgent';
import { SheetExporter } from '../services/exporters/SheetExporter';
import dotenv from 'dotenv';
dotenv.config();

async function testScrapers() {
    const query = "developer";
    const platform = "weworkremotely"; // or 'all', or '2dehands'

    console.log(`[TEST] Running Scraper Test for '${query}' on '${platform}'...`);

    try {
        // 1. Find Deals
        // MarketplaceAgent.findDeals(query, location)
        const deals = await marketplaceAgent.findDeals(query, "Remote");
        console.log(`[TEST] Found ${deals.length} items.`);

        if (deals.length > 0) {
            console.log("Sample Item:", deals[0]);

            // 2. Mock Analysis (to save tokens/time for this test)
            const analyzedDeals = deals.map(d => ({
                ...d,
                aiScore: 85,
                aiReasoning: "Good match based on keyword.",
                matchType: "FAIR" as const
            }));

            // 3. Export
            const filename = `test_export_${platform}.csv`;
            const path = await SheetExporter.toCSV(analyzedDeals, filename);
            console.log(`[TEST] Exported to: ${path}`);
        } else {
            console.warn("[TEST] No deals found. Check scraper logic.");
        }

    } catch (error) {
        console.error("[TEST] Failed:", error);
    }
}

testScrapers();

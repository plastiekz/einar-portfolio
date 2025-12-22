

import { config } from 'dotenv';
import path from 'path';

// Load env before anything else
config({ path: path.resolve(process.cwd(), '.env.local') });

async function test() {
    console.log("🚀 Testing Marketplace Agent...");
    // Dynamic import to ensure process.env is populated
    const { marketplaceAgent } = await import('../services/marketplaceAgent.ts');

    try {
        console.log("1. Testing findDeals('iphone')...");
        // findDeals args: query, location (mocked in browser, scrapers in node)
        // Check signature: async findDeals(query: string, location: string): Promise<MarketItem[]>
        const deals = await marketplaceAgent.findDeals("iphone", "Belgium");
        console.log(`✅ Found ${deals.length} deals.`);

        if (deals.length > 0) {
            const sample = deals[0];
            console.log("Sample Deal:", sample);

            console.log("2. Testing analyzeDeal(sample)...");
            const analysis = await marketplaceAgent.analyzeDeal(sample);
            console.log("✅ Analysis Result:", analysis);
        } else {
            console.log("❌ No deals found to analyze. Check selectors or network.");
        }

    } catch (error) {
        console.error("❌ Test Failed:", error);
    }
}

test();

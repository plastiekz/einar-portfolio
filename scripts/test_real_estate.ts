
import { realEstateAgent } from '../services/realEstateAgent';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testRealEstate() {
    const location = "Springfield";
    console.log(`[TEST] Testing Real Estate Agent for '${location}'...`);

    try {
        const leads = await realEstateAgent.findLeads(location);
        console.log(`[TEST] Leads found: ${leads.length}`);

        if (leads.length > 0) {
            console.log("[TEST] First lead sample:", leads[0]);

            // Check if it's mock data or real data
            const isMock = leads.some(l => l.source === 'Zillow' || l.id === '1');
            console.log(`[TEST] Data Source: ${isMock ? 'MOCK (Fallback/Simulation)' : 'REAL (Scraped)'}`);
        }

    } catch (error) {
        console.error("[TEST] Error:", error);
    }
}

testRealEstate();

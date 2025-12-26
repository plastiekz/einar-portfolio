import { config } from 'dotenv';
import path from 'path';

// Force test environment if not set, to allow dummy keys
if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'test';
}

// Load env before anything else
config({ path: path.resolve(process.cwd(), '.env.local') });

async function testVDAB() {
    console.log("🚀 Testing VDAB Job Hunt System...\n");

    try {
        // Test 1: VDAB Scraper
        console.log("1. Testing VDABScraper...");
        const { VDABScraper } = await import('../services/scrapers/VDABScraper');
        const scraper = new VDABScraper();

        const jobs = await scraper.scrape("Contextbegeleider", "Gent");
        console.log(`✅ Scraped ${jobs.length} jobs from VDAB.\n`);

        if (jobs.length > 0) {
            const sample = jobs[0];
            console.log("Sample Job:");
            console.log(`  Title: ${sample.title}`);
            console.log(`  Company: ${sample.seller}`);
            console.log(`  Location: ${sample.location}`);
            console.log(`  Description length: ${sample.description?.length || 0} chars`);
            console.log(`  URL: ${sample.url}\n`);

            // Test 2: Job Storage
            console.log("2. Testing Job Storage...");
            const { jobStorage } = await import('../services/jobStorage');
            const savedPath = await jobStorage.saveJob(sample);
            console.log(`✅ Saved job to: ${savedPath}\n`);

            // Test 3: Load Jobs
            console.log("3. Testing Load Jobs...");
            const allJobs = await jobStorage.loadAllJobs();
            console.log(`✅ Loaded ${allJobs.length} saved jobs.\n`);

            // Test 4: Marketplace Agent Integration
            console.log("4. Testing MarketplaceAgent Integration...");
            const { marketplaceAgent } = await import('../services/marketplaceAgent');

            const analysis = await marketplaceAgent.analyzeDeal(sample);
            console.log(`✅ Analysis Result:`);
            console.log(`  Score: ${analysis.aiScore}/100`);
            console.log(`  Match Type: ${analysis.matchType}`);
            console.log(`  Reasoning: ${analysis.aiReasoning}\n`);

            // Test 4b: Project Basta Analysis
            console.log("4b. Testing Project Basta Analysis...");
            const bastaReport = await marketplaceAgent.analyzeJobWithBasta(sample);
            console.log("✅ Basta Report Generated:");
            console.log(bastaReport.substring(0, 300) + "...\n");

            // Test 5: Cover Letter Generation (with restored OTB/WMN)
            console.log("5. Testing Cover Letter Generation...");
            // Use actual file content if available, or dummies
            const otb = "[OTB CONTEXT] Systeemtheorie, Buber, Levinas...";
            const wmn = "[WMN CONTEXT] CANO-visie, integrale jeugdhulp...";

            const letter = await marketplaceAgent.generateCoverLetter(
                analysis,
                "Ervaren jeugdhulpverlener met systeemvisie...",
                otb,
                wmn
            );

            console.log(`✅ Generated cover letter (${letter.length} chars):`);
            console.log("--- PREVIEW ---");
            console.log(letter.substring(0, 300) + "...\n");

            // Test 6: Save Letter
            console.log("6. Testing Letter Storage...");
            const letterPath = await jobStorage.saveLetter(sample.id, letter);
            console.log(`✅ Saved letter to: ${letterPath}\n`);

            // Test 6b: Save Basta Report
            console.log("6b. Testing Report Storage...");
            const reportPath = await jobStorage.saveLetter(sample.id + "_ANALYSIS", bastaReport);
            console.log(`✅ Saved report to: ${reportPath}\n`);

        } else {
            console.warn("⚠️  No jobs found. VDAB scraper may need selector adjustments.");
        }

        console.log("🎉 All tests completed!\n");

    } catch (error) {
        console.error("❌ Test Failed:", error);
        process.exit(1);
    }
}

testVDAB();

#!/usr/bin/env node

import { marketplaceAgent } from '../services/marketplaceAgent';
import { jobStorage } from '../services/jobStorage';
import * as fs from 'fs';
import * as path from 'path';

// Load context files - check both current directory and parent directory
const loadContextFile = (filename: string): string => {
    // Try current directory first
    let filePath = path.join(process.cwd(), filename);
    if (fs.existsSync(filePath)) {
        console.log(`[Jules] ✓ Loaded ${filename} from current directory`);
        return fs.readFileSync(filePath, 'utf-8');
    }

    // Try parent directory
    filePath = path.join(process.cwd(), '..', filename);
    if (fs.existsSync(filePath)) {
        console.log(`[Jules] ✓ Loaded ${filename} from parent directory`);
        return fs.readFileSync(filePath, 'utf-8');
    }

    console.warn(`[Jules] ⚠️  Warning: ${filename} not found. Using empty context.`);
    return '';
};

// Load CV - check for both CVFINAL.txt and "CV EINAR OWCZAREK FINAL-1.pdf"
const loadCV = (): string => {
    const possibleNames = [
        'CVFINAL.txt',
        'CV EINAR OWCZAREK FINAL-1.txt',
        'resume.txt',
        'cv.txt'
    ];

    // Check for txt versions first
    for (const name of possibleNames) {
        // Try current directory
        let filePath = path.join(process.cwd(), name);
        if (fs.existsSync(filePath)) {
            console.log(`[Jules] ✓ Loaded CV from: ${name}`);
            return fs.readFileSync(filePath, 'utf-8');
        }

        // Try parent directory
        filePath = path.join(process.cwd(), '..', name);
        if (fs.existsSync(filePath)) {
            console.log(`[Jules] ✓ Loaded CV from parent: ${name}`);
            return fs.readFileSync(filePath, 'utf-8');
        }
    }

    // Check for PDF version to give better warning
    const pdfName = "CV EINAR OWCZAREK FINAL-1.pdf";
    if (fs.existsSync(path.join(process.cwd(), '..', pdfName)) || fs.existsSync(path.join(process.cwd(), pdfName))) {
        console.warn(`[Jules] ⚠️  Found "${pdfName}" but cannot read PDF directly.`);
        console.warn(`[Jules] 👉 Please convert your CV to a text file named "CVFINAL.txt" or "resume.txt" in the project folder.`);
        return "CV Placeholder - Please provide text resume.";
    }

    console.warn(`[Jules] ⚠️  Warning: CV file not found. Checked: ${possibleNames.join(', ')}`);
    return "CV Placeholder - Please provide text resume.";
};

const main = async () => {
    const args = process.argv.slice(2);
    const command = args[0];

    console.log('🤖 Jules - Job Hunt Assistant');
    console.log('================================\n');

    if (command === 'hunt') {
        // Search for jobs
        const query = args[1] || 'Contextbegeleider';
        console.log(`🔍 Searching VDAB for: "${query}" (30 km around Gent)\n`);

        const jobs = await marketplaceAgent.findDeals(query, 'Gent');
        console.log(`\n✅ Found and saved ${jobs.length} jobs!\n`);

        // Analyze jobs
        console.log('📊 Analyzing jobs...\n');
        for (const job of jobs) {
            const analysis = await marketplaceAgent.analyzeDeal(job);
            console.log(`  - ${analysis.title}`);
            console.log(`    Score: ${analysis.aiScore}/100 | ${analysis.matchType}`);
            console.log(`    ${analysis.aiReasoning}\n`);
        }

    } else if (command === 'generate') {
        // Generate letter for a specific job
        const jobId = args[1];
        if (!jobId) {
            console.error('❌ Please provide a job ID: jules generate <job-id>');
            process.exit(1);
        }

        console.log(`📝 Generating motivation letter for job: ${jobId}\n`);

        // Load context files
        const resume = loadCV();
        const otb = loadContextFile('OTB.txt');
        const wmn = loadContextFile('WMN.txt');

        // Load all jobs and find the one
        const allJobs = await jobStorage.loadAllJobs();
        const jobRecord = allJobs.find(j => j.item.id.includes(jobId));

        if (!jobRecord) {
            console.error(`❌ Job not found: ${jobId}`);
            process.exit(1);
        }

        // Analyze first
        const analysis = await marketplaceAgent.analyzeDeal(jobRecord.item);

        // Generate letter
        const letter = await marketplaceAgent.generateCoverLetter(analysis, resume, otb, wmn);

        // Save letter
        const letterPath = await jobStorage.saveLetter(jobRecord.item.id, letter);

        console.log(`✅ Letter generated and saved to: ${letterPath}\n`);
        console.log('--- LETTER PREVIEW ---');
        console.log(letter.substring(0, 500) + '...\n');

    } else if (command === 'analyze') {
        // Project Basta Analysis
        const jobId = args[1];
        if (!jobId) {
            console.error('❌ Please provide a job ID: jules analyze <job-id>');
            process.exit(1);
        }

        console.log(`🧐 Performing Clinical Analysis (Project Basta) for: ${jobId}\n`);

        const allJobs = await jobStorage.loadAllJobs();
        const jobRecord = allJobs.find(j => j.item.id.includes(jobId));

        if (!jobRecord) {
            console.error(`❌ Job not found: ${jobId}`);
            process.exit(1);
        }

        const report = await marketplaceAgent.analyzeJobWithBasta(jobRecord.item);

        console.log(report);

        // Save report
        const reportPath = await jobStorage.saveLetter(jobRecord.item.id + "_ANALYSIS", report);
        console.log(`\n✅ Rapport opgeslagen: ${reportPath}\n`);

    } else if (command === 'batch') {
        // Generate letters for all jobs without letters
        console.log('📝 Generating letters for all saved jobs...\n');

        // Load context files
        const resume = loadContextFile('resume.txt');
        const otb = loadContextFile('OTB.txt');
        const wmn = loadContextFile('WMN.txt');

        const allJobs = await jobStorage.loadAllJobs();
        console.log(`Found ${allJobs.length} saved jobs.\n`);

        for (const jobRecord of allJobs) {
            if (jobRecord.hasLetter) {
                console.log(`⏭️  Skipping ${jobRecord.item.title} (already has letter)`);
                continue;
            }

            console.log(`📝 Generating letter for: ${jobRecord.item.title}`);

            // Analyze
            const analysis = await marketplaceAgent.analyzeDeal(jobRecord.item);

            // Generate letter
            const letter = await marketplaceAgent.generateCoverLetter(analysis, resume, otb, wmn);

            // Save
            await jobStorage.saveLetter(jobRecord.item.id, letter);
            console.log(`   ✅ Saved\n`);
        }

        console.log('🎉 All letters generated!\n');

    } else {
        // Show help
        console.log('Usage:');
        console.log('  jules hunt [query]           - Search VDAB for jobs (default: "Contextbegeleider")');
        console.log('  jules analyze <job-id>       - Clinical Systeem Analysis (Project Basta)');
        console.log('  jules generate <job-id>      - Generate Motivatiebrief (Buber/Levinas/Nagy)');
        console.log('  jules batch                  - Generate letters for all saved jobs');
        console.log('\nContext Files (place in project root):');
        console.log('  - resume.txt   : Your resume/CV');
        console.log('  - OTB.txt      : On The Basis context');
        console.log('  - WMN.txt      : WMN context\n');
    }
};

main().catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
});

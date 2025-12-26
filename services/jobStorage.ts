import * as fs from 'fs';
import * as path from 'path';
import { MarketItem } from '../types';

export interface JobRecord {
    item: MarketItem;
    savedAt: string;
    hasLetter: boolean;
    letterPath?: string;
}

export class JobStorage {
    private baseDir = './jobs';

    /**
     * Saves a job posting to disk as a txt file
     */
    async saveJob(item: MarketItem): Promise<string> {
        const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const platform = item.source.toLowerCase().replace(/\s+/g, '_');
        const jobId = this.sanitizeFilename(item.id);

        const dirPath = path.join(this.baseDir, date, platform);

        // Create directory if it doesn't exist
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        const filePath = path.join(dirPath, `${jobId}.txt`);

        // Format job content
        const content = this.formatJobContent(item);

        // Write to file
        fs.writeFileSync(filePath, content, 'utf-8');

        console.log(`[JobStorage] Saved job to: ${filePath}`);
        return filePath;
    }

    /**
     * Formats job data as readable text with metadata header
     */
    private formatJobContent(item: MarketItem): string {
        return `=== JOB POSTING ===
Title: ${item.title}
Company: ${item.seller || 'N/A'}
Location: ${item.location}
Source: ${item.source}
URL: ${item.url}
Saved: ${new Date().toISOString()}

=== DESCRIPTION ===
${item.description || 'No description available'}

=== METADATA (JSON) ===
${JSON.stringify(item, null, 2)}
`;
    }

    /**
     * Loads all saved jobs
     */
    async loadAllJobs(): Promise<JobRecord[]> {
        const jobs: JobRecord[] = [];

        if (!fs.existsSync(this.baseDir)) {
            return jobs;
        }

        // Recursively find all .txt files
        const files = this.findJobFiles(this.baseDir);

        for (const filePath of files) {
            try {
                const content = fs.readFileSync(filePath, 'utf-8');
                const item = this.parseJobContent(content);

                jobs.push({
                    item,
                    savedAt: fs.statSync(filePath).mtime.toISOString(),
                    hasLetter: false // TODO: Check if letter exists
                });
            } catch (error) {
                console.error(`[JobStorage] Failed to load ${filePath}:`, error);
            }
        }

        return jobs;
    }

    /**
     * Finds all job files recursively
     */
    private findJobFiles(dir: string): string[] {
        const files: string[] = [];

        if (!fs.existsSync(dir)) return files;

        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                files.push(...this.findJobFiles(fullPath));
            } else if (entry.isFile() && entry.name.endsWith('.txt')) {
                files.push(fullPath);
            }
        }

        return files;
    }

    /**
     * Parses job content back to MarketItem
     */
    private parseJobContent(content: string): MarketItem {
        // Extract JSON metadata
        const jsonMatch = content.match(/=== METADATA \(JSON\) ===\s*\n([\s\S]+)$/);

        if (jsonMatch) {
            return JSON.parse(jsonMatch[1]);
        }

        // Fallback: parse from text format
        const lines = content.split('\n');
        const item: any = {};

        for (const line of lines) {
            if (line.startsWith('Title: ')) item.title = line.substring(7);
            if (line.startsWith('Company: ')) item.seller = line.substring(9);
            if (line.startsWith('Location: ')) item.location = line.substring(10);
            if (line.startsWith('Source: ')) item.source = line.substring(8);
            if (line.startsWith('URL: ')) item.url = line.substring(5);
        }

        // Extract description
        const descMatch = content.match(/=== DESCRIPTION ===\s*\n([\s\S]+?)\n\n===/);
        if (descMatch) {
            item.description = descMatch[1].trim();
        }

        return item as MarketItem;
    }

    /**
     * Sanitizes filename
     */
    private sanitizeFilename(filename: string): string {
        return filename
            .replace(/[^a-z0-9_-]/gi, '_')
            .substring(0, 100);
    }

    /**
     * Saves a motivation letter for a job
     */
    async saveLetter(jobId: string, letterContent: string): Promise<string> {
        const date = new Date().toISOString().split('T')[0];
        const dirPath = path.join(this.baseDir, date, 'letters');

        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        const sanitizedId = this.sanitizeFilename(jobId);
        const filePath = path.join(dirPath, `${sanitizedId}_letter.txt`);

        fs.writeFileSync(filePath, letterContent, 'utf-8');

        console.log(`[JobStorage] Saved letter to: ${filePath}`);
        return filePath;
    }
}

export const jobStorage = new JobStorage();

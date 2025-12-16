import { DealAnalysis } from '../marketplaceAgent';
import * as fs from 'fs';
import * as path from 'path';

export class SheetExporter {

    /**
     * Converts analysis results to CSV format and saves to file.
     */
    static async toCSV(deals: DealAnalysis[], filename: string = "jobs_export.csv"): Promise<string> {
        if (!deals || deals.length === 0) return "";

        const headers = [
            "Title",
            "Company/Seller",
            "Price/Salary",
            "Location",
            "Source",
            "Match Type",
            "AI Score",
            "AI Reasoning",
            "URL"
        ];

        const rows = deals.map(d => {
            return [
                this.escapeCSV(d.title),
                this.escapeCSV(d.seller || ""),
                this.escapeCSV(String(d.price)),
                this.escapeCSV(d.location),
                this.escapeCSV(d.source),
                this.escapeCSV(d.matchType),
                this.escapeCSV(String(d.aiScore)),
                this.escapeCSV(d.aiReasoning),
                this.escapeCSV(d.url)
            ].join(",");
        });

        const csvContent = [headers.join(","), ...rows].join("\n");
        const outputPath = path.resolve(process.cwd(), filename);

        fs.writeFileSync(outputPath, csvContent);
        console.log(`[SheetExporter] Saved ${deals.length} jobs to ${outputPath}`);

        return outputPath;
    }

    private static escapeCSV(field: string): string {
        if (!field) return "";
        // If field contains comma, quote, or newline, wrap in quotes and escape internal quotes
        if (field.includes(",") || field.includes('"') || field.includes("\n")) {
            return `"${field.replace(/"/g, '""')}"`;
        }
        return field;
    }
}

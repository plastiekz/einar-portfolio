import { GoogleGenAI } from "@google/genai";
import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(process.cwd(), '.env.local') });

async function testSimple() {
    console.log("Testing API Connectivity...");
    const key = process.env.API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!key) {
        console.error("❌ No API Key found in env!");
        process.exit(1);
    }
    console.log(`Key found (length: ${key.length})`);

    const ai = new GoogleGenAI({ apiKey: key });

    try {
        console.log("Sending 'Hello' to gemini-2.0-flash-exp...");
        const result = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: "Hello, are you working?",
        });
        console.log("✅ Response:", result.text);
    } catch (e) {
        console.error("❌ Request Failed:", e);
    }
}

testSimple();

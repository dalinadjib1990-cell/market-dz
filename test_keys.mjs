import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

const keys = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "").split(',').map(k => k.trim());
console.log("Keys available:", keys.length);

const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-pro", "gemini-1.5-pro", "gemini-1.5-flash", "gemini-2.0-flash-lite-preview-02-05"];

async function test() {
  for (const key of keys) {
    console.log("Testing key...");
    const ai = new GoogleGenAI({ apiKey: key });
    for (const m of models) {
      try {
        const res = await ai.models.generateContent({
          model: m,
          contents: "hi"
        });
        console.log(`Success with ${m}`);
      } catch (e) {
        console.log(`Failed with ${m}:`, e.message.split('\n')[0]);
      }
    }
  }
}
test();

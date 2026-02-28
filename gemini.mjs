// gemini.mjs
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("YOUR_GEMINI_API_KEY_HERE");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const prompt = process.argv.slice(2).join(" ");
if (!prompt) {
  console.log("Usage: node gemini.mjs <your question>");
  process.exit(1);
}

const result = await model.generateContent(prompt);
console.log("\n🤖 Gemini says:\n", result.response.text());

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { description } = await req.json();

    if (!description) {
      return NextResponse.json({ error: "Description required" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY is missing from environment");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const prompt = `You are an AI assistant for a city maintenance app. 
A citizen reported this issue: "${description}".

Analyze the issue and provide a simple, clear response in JSON format.
Use everyday language that a citizen can understand.

Required JSON Structure:
{
  "cat": "Simple Category (e.g. Roads, Water, Electricity, Trash, Safety)",
  "prio": 1 to 10 (1 = low, 10 = urgent life threat),
  "msg": "A short, friendly summary of the problem and the risk it poses.",
  "time": "Expected fix time (e.g. 24 Hours, 3 Days, Immediate)",
  "dept": "DOT, Public Works, Utilities, or Emergency Services",
  "score": 1 to 100 (Severity score: 1 = minor, 100 = critical danger)
}

CRITICAL: You MUST include the "score" field as a number between 1 and 100.
ONLY return the raw JSON object. No explanations or markdown.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    console.log("RAW AI RESPONSE:", text);

    // Cleanup AI output
    if (text.startsWith("```json")) {
      text = text.replace(/```json|```/g, "").trim();
    } else if (text.startsWith("```")) {
      text = text.replace(/```/g, "").trim();
    }

    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      console.error("JSON PARSE FAILED. Raw text:", text);
      throw new Error("Invalid AI response format");
    }

    // Ensure numeric types and handle potential missing fields
    json.prio = parseInt(json.prio) || 1;
    json.score = parseInt(json.score) || 20; // Default to 20 if missing

    return NextResponse.json(json);
  } catch (error) {
    console.error("AI Analysis error:", error);
    return NextResponse.json({
      cat: "Maintenance",
      prio: 3,
      msg: "We've received your report. A team will review it shortly.",
      time: "24-48 Hours",
      dept: "Public Works",
      score: 30 // Higher default for fallback
    });
  }
}

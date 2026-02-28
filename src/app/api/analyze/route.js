import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { description } = await req.json();

    if (!description) {
      return NextResponse.json({ error: "Description required" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = `Analyze this civic issue report: "${description}".
Provide a JSON response with the following keys:
- "cat": A short, specific category (e.g., "Road Infrastructure", "Sanitation", "Electrical Hazard").
- "prio": An integer from 1 to 3 (1 = low, 2 = medium, 3 = critical).
- "msg": A brief risk assessment or summary of the danger/issue.
- "time": Estimated response time string (e.g., "24-48 Hours", "Immediate Dispatch").
Do not include any other text besides the JSON.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const json = JSON.parse(text);

    return NextResponse.json(json);
  } catch (error) {
    console.error("Analysis error:", error);
    // Fallback logic
    return NextResponse.json({
      cat: "General Inquiry",
      prio: 1,
      msg: "System fallback classification.",
      time: "3-5 Business Days"
    });
  }
}

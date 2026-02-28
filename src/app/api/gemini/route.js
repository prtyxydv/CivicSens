import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt) {
      return Response.json({ error: "Prompt required" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return Response.json({ reply: text });

  } catch (error) {
    console.error("Gemini error:", error);
    return Response.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
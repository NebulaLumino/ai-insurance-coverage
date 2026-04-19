import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.deepseek.com/v1",
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json({ error: "Request body required" }, { status: 400 });
    }

    const fieldValues = Object.entries(body)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");

    const completion = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "You are an insurance coverage attorney. Given the policy type, claim description, policy limits/deductibles, and known exclusions, generate a comprehensive coverage analysis including: initial coverage determination, applicable policy provisions and language, relevant exclusions and exceptions, reservation of rights considerations, recommended steps for the insured to preserve coverage, bad faith exposure analysis, and estimated defense cost allocation." },
        { role: "user", content: `Please analyze the following information:\n\n${fieldValues}\n\nProvide a comprehensive analysis based on all the information provided.` },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const result = completion.choices[0]?.message?.content || "No result generated.";
    return NextResponse.json({ result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

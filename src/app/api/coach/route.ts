import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { roundupCount, totalSaved, latestRoundup } = await req.json();

    const message = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: `You are a friendly DeFi savings coach inside a consumer app called Roundup.
The user just made a roundup deposit.
Their stats:
- Total roundups so far: ${roundupCount}
- Total saved: ${Number(totalSaved).toFixed(4)} FLOW
- Latest roundup amount: $${latestRoundup}

Give ONE short, encouraging, specific insight (not more than 70 characters).
Sound human, not corporate. No emojis. No generic advice.
Reference their actual numbers.`,
        },
      ],
    });

    const text = message.choices[0]?.message?.content || "";
    return NextResponse.json({ insight: text });
  } catch (error) {
    console.error("Coach API error:", error);
    return NextResponse.json({ insight: null }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { generateMotivationMessage } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { mood, streak, task } = await req.json();
    const result = await generateMotivationMessage(mood, streak, task);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Coach API error:", error);
    return NextResponse.json(
      { error: "Failed to get coaching response" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { generateMotivationMessage } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { mood, streak, task } = await req.json();

    console.log("[API /coach] Request:", { mood, streak, task });

    const result = await generateMotivationMessage(mood, streak, task);

    console.log("[API /coach] Response:", { source: result.source });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API /coach] Error:", error);
    return NextResponse.json(
      { error: "Failed to get coaching response" },
      { status: 500 }
    );
  }
}

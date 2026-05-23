import { NextRequest, NextResponse } from "next/server";
import { generateReflectionResponse } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { taskTitle, difficulty, confidence, notes } = await req.json();

    console.log("[API /reflection] Request:", { taskTitle, difficulty, confidence });

    const result = await generateReflectionResponse(taskTitle, difficulty, confidence, notes);

    console.log("[API /reflection] Response:", { source: result.source });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API /reflection] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate reflection" },
      { status: 500 }
    );
  }
}

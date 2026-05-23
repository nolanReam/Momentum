import { NextRequest, NextResponse } from "next/server";
import { generateReflectionResponse } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { taskTitle, difficulty, confidence, notes } = await req.json();
    const result = await generateReflectionResponse(taskTitle, difficulty, confidence, notes);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Reflection API error:", error);
    return NextResponse.json(
      { error: "Failed to generate reflection" },
      { status: 500 }
    );
  }
}

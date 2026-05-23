import { NextRequest, NextResponse } from "next/server";
import { generateTaskBreakdown } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { task, mood, energyLevel } = await req.json();

    if (!task) {
      return NextResponse.json({ error: "Task is required" }, { status: 400 });
    }

    console.log("[API /breakdown] Request:", { task, mood, energyLevel });

    const breakdown = await generateTaskBreakdown(task, mood, energyLevel);

    console.log("[API /breakdown] Response:", {
      source: breakdown.source,
      stepCount: breakdown.steps.length,
    });

    return NextResponse.json(breakdown);
  } catch (error) {
    console.error("[API /breakdown] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate breakdown" },
      { status: 500 }
    );
  }
}

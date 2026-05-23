import { NextRequest, NextResponse } from "next/server";
import { generateTaskBreakdown } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const { task, mood, energyLevel, preferences } = await req.json();

    if (!task) {
      return NextResponse.json({ error: "Task is required" }, { status: 400 });
    }

    console.log("[API /breakdown] Request:", { task, mood, energyLevel, hasPreferences: !!preferences });

    const breakdown = await generateTaskBreakdown(task, mood, energyLevel, preferences);

    const duration = Date.now() - startTime;
    console.log("[API /breakdown] Response:", {
      source: breakdown.source,
      stepCount: breakdown.steps.length,
      duration: `${duration}ms`,
    });

    return NextResponse.json({ ...breakdown, duration });
  } catch (error) {
    console.error("[API /breakdown] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate breakdown" },
      { status: 500 }
    );
  }
}

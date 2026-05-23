import { NextRequest, NextResponse } from "next/server";
import { generateTaskBreakdown } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { task, mood, energyLevel } = await req.json();

    if (!task) {
      return NextResponse.json({ error: "Task is required" }, { status: 400 });
    }

    const breakdown = await generateTaskBreakdown(task, mood, energyLevel);
    return NextResponse.json(breakdown);
  } catch (error) {
    console.error("Breakdown API error:", error);
    return NextResponse.json(
      { error: "Failed to generate breakdown" },
      { status: 500 }
    );
  }
}

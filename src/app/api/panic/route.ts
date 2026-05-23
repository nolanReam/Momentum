import { NextRequest, NextResponse } from "next/server";
import { generatePanicPlan } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { assignment, deadline, currentProgress } = await req.json();

    if (!assignment || !deadline) {
      return NextResponse.json({ error: "Assignment and deadline are required" }, { status: 400 });
    }

    const plan = await generatePanicPlan(assignment, deadline, currentProgress || "Haven't started");
    return NextResponse.json(plan);
  } catch (error) {
    console.error("Panic API error:", error);
    return NextResponse.json(
      { error: "Failed to generate panic plan" },
      { status: 500 }
    );
  }
}

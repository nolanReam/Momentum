import { NextRequest, NextResponse } from "next/server";
import { generatePanicPlan } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { assignment, deadline, currentProgress } = await req.json();

    if (!assignment || !deadline) {
      return NextResponse.json({ error: "Assignment and deadline are required" }, { status: 400 });
    }

    console.log("[API /panic] Request:", { assignment, deadline, currentProgress });

    const plan = await generatePanicPlan(assignment, deadline, currentProgress || "Haven't started");

    console.log("[API /panic] Response:", {
      source: plan.source,
      stepCount: plan.plan.length,
    });

    return NextResponse.json(plan);
  } catch (error) {
    console.error("[API /panic] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate panic plan" },
      { status: 500 }
    );
  }
}

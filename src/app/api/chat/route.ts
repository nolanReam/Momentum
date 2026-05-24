import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const GROQ_KEY = process.env.GROQ_API_KEY;
const groq = GROQ_KEY ? new Groq({ apiKey: GROQ_KEY }) : null;
const MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are Momentum's AI study coach — a calm, emotionally intelligent companion for students who struggle with procrastination.

YOUR PERSONALITY:
- Warm, grounded, concise
- Like a supportive older student mentor
- Calm tutor energy — never corporate or robotic
- Encouraging without toxic positivity
- Realistic about what's achievable
- You acknowledge feelings before giving advice

YOU NEVER:
- Sound like a generic chatbot
- Use cheesy productivity language ("crush it!", "hustle!")
- Overuse emojis
- Give long-winded responses (keep it 2-4 sentences usually)
- Do the student's homework for them
- Shame them for procrastinating

YOU HELP WITH:
- Breaking tasks into smaller steps
- Getting started when stuck
- Motivation that feels genuine
- Study strategies tailored to them
- Scheduling and time management
- Simplifying overwhelming work
- Accountability without pressure
- Emotional support during stress

RESPONSE STYLE:
- Short and warm (2-4 sentences for most replies)
- Use line breaks for readability
- Only go longer if they ask for detailed help
- Match their energy — if they're exhausted, be gentle
- If they're motivated, match that energy

IMPORTANT CONTEXT ABOUT THIS STUDENT:
`;

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const { messages, context } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages required" }, { status: 400 });
    }

    console.log("[API /chat] Request:", { messageCount: messages.length, hasContext: !!context });

    // Build the full system prompt with student context
    const fullSystemPrompt = SYSTEM_PROMPT + (context || "No additional context available.");

    // Format messages for Groq
    const groqMessages = [
      { role: "system" as const, content: fullSystemPrompt },
      ...messages.slice(-10).map((m: any) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    if (!groq) {
      // Fallback response
      const fallbacks = [
        "I hear you. Let's take this one step at a time. What feels like the smallest thing you could do right now?",
        "That's completely valid. When everything feels like too much, the trick is to shrink the task until it feels almost too easy. What would a 3-minute version of this look like?",
        "You're here, and that already counts for something. What's the one thing that would make you feel like you made progress today?",
        "Let's not worry about finishing right now. What would it look like to just start? Even opening the document counts.",
        "I get it. Some days are harder than others. What if we just focused on the next 5 minutes? Nothing beyond that.",
      ];
      const response = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      return NextResponse.json({ content: response, source: "fallback", duration: Date.now() - startTime });
    }

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: groqMessages,
      temperature: 0.8,
      max_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content || "I'm here. What would help right now?";
    const duration = Date.now() - startTime;

    console.log("[API /chat] Response:", { source: "groq", duration: `${duration}ms`, tokens: completion.usage?.total_tokens });

    return NextResponse.json({ content, source: "groq", duration });
  } catch (error: any) {
    console.error("[API /chat] Error:", error?.message);

    // Graceful fallback
    return NextResponse.json({
      content: "I'm here with you. What's on your mind right now?",
      source: "fallback",
      duration: Date.now() - startTime,
    });
  }
}

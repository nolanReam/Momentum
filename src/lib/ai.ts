import Groq from "groq-sdk";

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

const MODEL = "llama-3.3-70b-versatile";

// ============================================
// CORE AI FUNCTION
// ============================================
async function callAI(systemPrompt: string, userMessage: string): Promise<string | null> {
  if (!groq) return null;

  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    return response.choices[0]?.message?.content || null;
  } catch (error) {
    console.error("Groq AI error:", error);
    return null;
  }
}

// ============================================
// TASK BREAKDOWN
// ============================================
export interface BreakdownStep {
  title: string;
  description: string;
  estimated_minutes: number;
  priority: "low" | "medium" | "high";
  tip: string;
}

export interface BreakdownResponse {
  steps: BreakdownStep[];
  encouragement: string;
}

const BREAKDOWN_SYSTEM_PROMPT = `You are a calm, emotionally intelligent study coach. A student needs help breaking down a task that feels overwhelming.

Your approach:
- Break it into 5-7 small, specific, actionable steps
- Each step should be 5-20 minutes max
- Start with the EASIEST "quick win" to build momentum
- Include a supportive tip for each step
- Be warm and genuine, not fake-positive
- Never do the work for them — help them plan and start
- Adapt based on their emotional state if provided

Respond in JSON:
{
  "steps": [
    {
      "title": "Short action title",
      "description": "1-2 sentence description",
      "estimated_minutes": number,
      "priority": "low" | "medium" | "high",
      "tip": "Supportive strategy tip"
    }
  ],
  "encouragement": "Brief genuine encouragement about starting"
}`;

export async function generateTaskBreakdown(
  task: string,
  mood?: string,
  energyLevel?: number
): Promise<BreakdownResponse> {
  const moodContext = mood
    ? `\n\nStudent's current state: ${mood}, energy ${energyLevel}/5. Adapt step difficulty accordingly.`
    : "";

  const moodAdaptation = getMoodAdaptation(mood, energyLevel);

  const result = await callAI(
    BREAKDOWN_SYSTEM_PROMPT + moodAdaptation,
    `Break down this task: "${task}"${moodContext}`
  );

  if (result) {
    try {
      return JSON.parse(result) as BreakdownResponse;
    } catch {}
  }

  return getMockBreakdown(task);
}

// ============================================
// MOTIVATION MESSAGE
// ============================================
export interface MotivationResponse {
  message: string;
  suggestion: string;
}

const MOTIVATION_SYSTEM_PROMPT = `You are a supportive study coach. Generate a brief, genuine motivational message for a student.

Be:
- Warm and calming, not hype-y
- Specific and actionable, not generic
- Emotionally intelligent
- Brief (1-2 sentences per field)

Respond in JSON:
{
  "message": "Supportive message acknowledging their effort",
  "suggestion": "One concrete tiny action they could take right now"
}`;

export async function generateMotivationMessage(
  mood?: string,
  streak?: number,
  task?: string
): Promise<MotivationResponse> {
  const context = [
    mood && `Feeling: ${mood}`,
    streak && `Current streak: ${streak} days`,
    task && `Working on: ${task}`,
  ]
    .filter(Boolean)
    .join(". ");

  const result = await callAI(MOTIVATION_SYSTEM_PROMPT, context || "Student just opened the app.");

  if (result) {
    try {
      return JSON.parse(result) as MotivationResponse;
    } catch {}
  }

  return {
    message: "You don't need to do everything. Just start with one small step.",
    suggestion: "Open your materials and read just the first paragraph.",
  };
}

// ============================================
// PANIC MODE
// ============================================
export interface PanicStep {
  title: string;
  duration: string;
  description: string;
  priority: "critical" | "important" | "if_time";
}

export interface PanicPlanResponse {
  plan: PanicStep[];
  reassurance: string;
  realistic_assessment: string;
}

const PANIC_SYSTEM_PROMPT = `You are a calm, supportive study coach. A student is panicking about a deadline. Help them with a realistic emergency plan.

Your approach:
- Stay calm and reassuring
- Create a prioritized plan that maximizes what they can realistically achieve
- Be honest about what's possible in the time remaining
- Focus on "good enough" not "perfect"
- Include quick wins first to calm anxiety
- Never shame them for being behind

Respond in JSON:
{
  "plan": [
    {
      "title": "Action step",
      "duration": "e.g. 20 min",
      "description": "Brief clear description",
      "priority": "critical" | "important" | "if_time"
    }
  ],
  "reassurance": "Calm reassuring message (2 sentences max)",
  "realistic_assessment": "Honest but kind assessment of what's achievable"
}`;

export async function generatePanicPlan(
  assignment: string,
  deadline: string,
  currentProgress: string
): Promise<PanicPlanResponse> {
  const result = await callAI(
    PANIC_SYSTEM_PROMPT,
    `Assignment: ${assignment}\nDeadline: ${deadline}\nCurrent progress: ${currentProgress}`
  );

  if (result) {
    try {
      return JSON.parse(result) as PanicPlanResponse;
    } catch {}
  }

  return getMockPanicPlan();
}

// ============================================
// REFLECTION RESPONSE
// ============================================
export interface ReflectionAIResponse {
  feedback: string;
  next_session_tip: string;
  encouragement: string;
}

const REFLECTION_SYSTEM_PROMPT = `You are a supportive study coach responding to a student's post-task reflection.

Be:
- Genuinely encouraging based on their answers
- Adaptive — if they found it hard, acknowledge that
- Brief and warm
- Forward-looking with a specific tip for next time

Respond in JSON:
{
  "feedback": "Acknowledge their experience (1-2 sentences)",
  "next_session_tip": "Specific adaptation for next time",
  "encouragement": "Brief genuine encouragement"
}`;

export async function generateReflectionResponse(
  taskTitle: string,
  difficulty: number,
  confidence: number,
  notes?: string
): Promise<ReflectionAIResponse> {
  const result = await callAI(
    REFLECTION_SYSTEM_PROMPT,
    `Task completed: "${taskTitle}"\nDifficulty felt: ${difficulty}/5\nConfidence: ${confidence}/5\nNotes: ${notes || "None"}`
  );

  if (result) {
    try {
      return JSON.parse(result) as ReflectionAIResponse;
    } catch {}
  }

  return {
    feedback: difficulty > 3
      ? "That was a tough one, and you pushed through it. That takes real effort."
      : "Nice — you found your flow. That's the momentum building.",
    next_session_tip: "Try starting with the part you feel most confident about next time.",
    encouragement: "Every session you complete makes the next one easier.",
  };
}

// ============================================
// FOCUS MODE COACHING
// ============================================
export interface FocusCoachingResponse {
  message: string;
  micro_tip: string;
}

const FOCUS_COACHING_SYSTEM_PROMPT = `You are a calm focus coach. The student is in the middle of a work session. Provide a brief, grounding message.

Be:
- Very brief (1 sentence each)
- Calming, not distracting
- Focused on the present moment

Respond in JSON:
{
  "message": "Brief grounding message",
  "micro_tip": "One tiny focus tip"
}`;

export async function generateFocusModeCoaching(
  currentStep: string,
  timeElapsed: number
): Promise<FocusCoachingResponse> {
  const result = await callAI(
    FOCUS_COACHING_SYSTEM_PROMPT,
    `Currently working on: "${currentStep}". Time elapsed: ${timeElapsed} minutes.`
  );

  if (result) {
    try {
      return JSON.parse(result) as FocusCoachingResponse;
    } catch {}
  }

  const tips = [
    { message: "You're in it. Stay with this moment.", micro_tip: "Take one deep breath and continue." },
    { message: "One step at a time. You're doing it.", micro_tip: "Focus on just the next 5 minutes." },
    { message: "Progress isn't always visible, but it's happening.", micro_tip: "If you're stuck, try writing one sentence about what you know." },
  ];
  return tips[Math.floor(Math.random() * tips.length)];
}

// ============================================
// MOOD ADAPTATION HELPERS
// ============================================
function getMoodAdaptation(mood?: string, energyLevel?: number): string {
  if (!mood) return "";

  const adaptations: Record<string, string> = {
    anxious: "\n\nADAPTATION: Student is anxious. Make steps EXTRA small (5-10 min max). Start with something that requires almost no cognitive load. Be extra reassuring. Emphasize they can stop after any step.",
    overwhelmed: "\n\nADAPTATION: Student feels overwhelmed. Limit to 4-5 steps. Make each step hyper-specific. Remove ambiguity. Emphasize doing just ONE step is a win.",
    tired: "\n\nADAPTATION: Student is tired. Keep all steps under 10 min. Suggest passive activities (reviewing, watching, organizing). Include a break. Don't push deep work.",
    neutral: "\n\nADAPTATION: Standard mix of easy and moderate tasks.",
    motivated: "\n\nADAPTATION: Student is motivated. Include deeper work sessions. Still start easy to build flow, then ramp up.",
    energized: "\n\nADAPTATION: Student has high energy. Include 20-25 min deep work blocks. Challenge them more while keeping structure.",
  };

  let result = adaptations[mood] || "";
  if (energyLevel && energyLevel <= 2) {
    result += "\nEnergy is very low — keep ALL steps under 10 minutes. Prioritize review over creation.";
  }
  return result;
}

// ============================================
// MOCK FALLBACKS (work without API key)
// ============================================
function getMockBreakdown(task: string): BreakdownResponse {
  return {
    steps: [
      {
        title: "Gather your materials",
        description: "Find your textbook, notes, and a pen. Just get everything in one place — no thinking required yet.",
        estimated_minutes: 3,
        priority: "low",
        tip: "This is your warm-up. Zero pressure.",
      },
      {
        title: "Read through your notes for 5 minutes",
        description: "Just scan what you already have. You're activating existing knowledge, not learning anything new yet.",
        estimated_minutes: 5,
        priority: "low",
        tip: "You already know more than you think.",
      },
      {
        title: "Write down 3 things you already understand",
        description: "Start with what you know. This builds confidence and shows you're not starting from zero.",
        estimated_minutes: 7,
        priority: "medium",
        tip: "Even partial understanding counts.",
      },
      {
        title: "Identify the 2 trickiest concepts",
        description: "Just name them — you don't need to solve them yet. Knowing what's hard helps you focus.",
        estimated_minutes: 5,
        priority: "medium",
        tip: "Naming the hard parts makes them less scary.",
      },
      {
        title: "Work through one practice problem",
        description: "Pick the easiest one available. One problem, start to finish. Show yourself you can do this.",
        estimated_minutes: 15,
        priority: "medium",
        tip: "If you get stuck past 3 minutes, mark it and move on.",
      },
      {
        title: "Take a real break",
        description: "Stand up, stretch, get water. You've made real progress. Let your brain process.",
        estimated_minutes: 5,
        priority: "low",
        tip: "Breaks are part of learning, not cheating.",
      },
    ],
    encouragement: "You don't need to finish everything today. Starting is the hardest part, and you just did it.",
  };
}

function getMockPanicPlan(): PanicPlanResponse {
  return {
    plan: [
      {
        title: "Take 3 deep breaths",
        duration: "1 min",
        description: "Before anything else. Panic makes everything feel worse than it is.",
        priority: "critical",
      },
      {
        title: "Write down exactly what's due",
        duration: "5 min",
        description: "Get it out of your head and onto paper. List the specific deliverables.",
        priority: "critical",
      },
      {
        title: "Identify the minimum viable submission",
        duration: "5 min",
        description: "What's the bare minimum you need to turn in? Focus there first.",
        priority: "critical",
      },
      {
        title: "Do the easiest part first",
        duration: "20 min",
        description: "Start with whatever requires the least thinking. Build momentum before tackling hard parts.",
        priority: "important",
      },
      {
        title: "Tackle the core content",
        duration: "45 min",
        description: "Focus on the most important section. Good enough is good enough right now.",
        priority: "important",
      },
      {
        title: "Quick review and submit",
        duration: "10 min",
        description: "Don't perfectionist-loop. Review once, fix obvious issues, submit.",
        priority: "if_time",
      },
    ],
    reassurance: "You're not the first student to be here, and you won't be the last. Let's focus on what's possible, not what's perfect.",
    realistic_assessment: "You can still submit something meaningful. Focus on the core requirements and let go of perfection.",
  };
}

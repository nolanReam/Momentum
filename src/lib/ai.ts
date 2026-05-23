import Groq from "groq-sdk";

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

const MODEL = "llama-3.3-70b-versatile";
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

// ============================================
// CORE AI FUNCTION (with retry + logging)
// ============================================
async function callAI(systemPrompt: string, userMessage: string): Promise<{ content: string | null; source: "groq" | "fallback" }> {
  if (!groq) {
    console.log("[Momentum AI] No GROQ_API_KEY configured — using fallback responses");
    return { content: null, source: "fallback" };
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[Momentum AI] Groq request (attempt ${attempt}/${MAX_RETRIES}):`, {
        model: MODEL,
        messagePreview: userMessage.slice(0, 80),
        timestamp: new Date().toISOString(),
      });

      const response = await groq.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.8 + Math.random() * 0.15, // Adds natural variability (0.8-0.95)
        max_tokens: 2000,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || null;

      console.log(`[Momentum AI] Groq response received:`, {
        status: "success",
        model: response.model,
        tokens: response.usage?.total_tokens,
        hasContent: !!content,
      });

      if (content) {
        return { content, source: "groq" };
      }
    } catch (error: any) {
      console.error(`[Momentum AI] Groq error (attempt ${attempt}/${MAX_RETRIES}):`, {
        message: error?.message || "Unknown error",
        status: error?.status,
        code: error?.code,
      });

      if (attempt < MAX_RETRIES) {
        console.log(`[Momentum AI] Retrying in ${RETRY_DELAY_MS}ms...`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * attempt));
      }
    }
  }

  console.log("[Momentum AI] All retries exhausted — falling back to mock response");
  return { content: null, source: "fallback" };
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
  source: "groq" | "fallback";
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
- Vary your language and suggestions — don't repeat the same phrases
- Make each response unique and tailored to the specific task

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
  energyLevel?: number,
  preferences?: { studyStyle?: string; stressLevel?: string; academicStruggle?: string; currentGoal?: string }
): Promise<BreakdownResponse> {
  const moodContext = mood
    ? `\n\nStudent's current state: ${mood}, energy ${energyLevel}/5. Adapt step difficulty accordingly.`
    : "";

  const moodAdaptation = getMoodAdaptation(mood, energyLevel);
  const timeOfDay = new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening";

  // Inject personalization from user preferences
  let personalization = "";
  if (preferences) {
    const parts: string[] = [];
    if (preferences.studyStyle === "short-bursts") parts.push("This student prefers short 10-15 min bursts. Keep steps very short.");
    if (preferences.studyStyle === "deep-work") parts.push("This student can handle longer focus blocks (30-45 min). Include some deeper steps.");
    if (preferences.stressLevel === "high" || preferences.stressLevel === "crisis") parts.push("Student is highly stressed. Be extra gentle and start with the absolute smallest step possible.");
    if (preferences.academicStruggle === "starting") parts.push("This student specifically struggles with starting. Make the first step require almost zero effort.");
    if (preferences.academicStruggle === "overwhelm") parts.push("This student gets overwhelmed easily. Limit to 4-5 steps max and be very specific.");
    if (preferences.academicStruggle === "perfectionism") parts.push("This student struggles with perfectionism. Emphasize 'good enough' and 'done is better than perfect'.");
    if (preferences.currentGoal) parts.push(`Student's current goal: "${preferences.currentGoal}". Connect encouragement to this.`);
    if (parts.length > 0) {
      personalization = "\n\nPERSONALIZATION (adapt based on what you know about this student):\n" + parts.join("\n");
    }
  }

  const { content, source } = await callAI(
    BREAKDOWN_SYSTEM_PROMPT + moodAdaptation + personalization,
    `Break down this task: "${task}"${moodContext}\n\nTime of day: ${timeOfDay}. Make your response specific to this exact task — no generic advice.`
  );

  if (content) {
    try {
      const parsed = JSON.parse(content);
      return { ...parsed, source };
    } catch (e) {
      console.error("[Momentum AI] Failed to parse breakdown JSON:", content?.slice(0, 200));
    }
  }

  return { ...getMockBreakdown(task), source: "fallback" };
}

// ============================================
// MOTIVATION MESSAGE
// ============================================
export interface MotivationResponse {
  message: string;
  suggestion: string;
  source: "groq" | "fallback";
}

const MOTIVATION_SYSTEM_PROMPT = `You are a supportive study coach. Generate a brief, genuine motivational message for a student.

Be:
- Warm and calming, not hype-y
- Specific and actionable, not generic
- Emotionally intelligent
- Brief (1-2 sentences per field)
- UNIQUE every time — never repeat the same message

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
    `Current time: ${new Date().toLocaleTimeString()}`,
    `Random seed: ${Math.random().toString(36).slice(2, 8)}`, // Forces unique responses
  ]
    .filter(Boolean)
    .join(". ");

  const { content, source } = await callAI(MOTIVATION_SYSTEM_PROMPT, context);

  if (content) {
    try {
      const parsed = JSON.parse(content);
      return { ...parsed, source };
    } catch {}
  }

  // Varied fallback messages
  const fallbacks = [
    { message: "You don't need to do everything. Just start with one small step.", suggestion: "Open your materials and read just the first paragraph." },
    { message: "Progress isn't always visible, but every minute spent counts.", suggestion: "Set a timer for 5 minutes and just begin. You can stop after." },
    { message: "The best time to start was yesterday. The second best time is now.", suggestion: "Write down the single easiest thing you could do in the next 3 minutes." },
    { message: "Your brain needs momentum, not motivation. Action creates energy.", suggestion: "Just open the file or notebook. Don't think — just open it." },
    { message: "It's okay if today is a low-energy day. Small still counts.", suggestion: "Review one page of notes. That's enough to keep the streak alive." },
    { message: "You've done hard things before. This is just another one of those.", suggestion: "Name the very first physical action: open app, grab pen, read title." },
  ];
  const pick = fallbacks[Math.floor(Math.random() * fallbacks.length)];
  return { ...pick, source: "fallback" };
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
  source: "groq" | "fallback";
}

const PANIC_SYSTEM_PROMPT = `You are a calm, supportive study coach. A student is panicking about a deadline. Help them with a realistic emergency plan.

Your approach:
- Stay calm and reassuring
- Create a prioritized plan (4-7 steps) that maximizes what they can realistically achieve
- Be honest about what's possible in the time remaining
- Focus on "good enough" not "perfect"
- Include quick wins first to calm anxiety
- Never shame them for being behind
- Be specific to their actual assignment — no generic advice
- Vary time estimates based on the actual work described

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
  const { content, source } = await callAI(
    PANIC_SYSTEM_PROMPT,
    `Assignment: ${assignment}\nDeadline: ${deadline}\nCurrent progress: ${currentProgress}\nCurrent time: ${new Date().toLocaleString()}`
  );

  if (content) {
    try {
      const parsed = JSON.parse(content);
      return { ...parsed, source };
    } catch (e) {
      console.error("[Momentum AI] Failed to parse panic plan JSON:", content?.slice(0, 200));
    }
  }

  return { ...getMockPanicPlan(), source: "fallback" };
}

// ============================================
// REFLECTION RESPONSE
// ============================================
export interface ReflectionAIResponse {
  feedback: string;
  next_session_tip: string;
  encouragement: string;
  source: "groq" | "fallback";
}

const REFLECTION_SYSTEM_PROMPT = `You are a supportive study coach responding to a student's post-task reflection.

Be:
- Genuinely encouraging based on their answers
- Adaptive — if they found it hard, acknowledge that
- Brief and warm
- Forward-looking with a specific tip for next time
- Unique every time — vary your phrasing

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
  const { content, source } = await callAI(
    REFLECTION_SYSTEM_PROMPT,
    `Task completed: "${taskTitle}"\nDifficulty felt: ${difficulty}/5\nConfidence: ${confidence}/5\nNotes: ${notes || "None"}\nTime: ${new Date().toLocaleTimeString()}`
  );

  if (content) {
    try {
      const parsed = JSON.parse(content);
      return { ...parsed, source };
    } catch {}
  }

  // Varied fallback based on difficulty
  const feedbacks = difficulty > 3
    ? [
        "That was a tough one, and you pushed through it. That takes real effort.",
        "Hard doesn't mean impossible — you just proved that.",
        "The fact that it felt difficult means you were actually challenging yourself.",
      ]
    : [
        "Nice — you found your flow. That's the momentum building.",
        "Smooth session. Your preparation is paying off.",
        "When it clicks like that, it means you're building real understanding.",
      ];

  return {
    feedback: feedbacks[Math.floor(Math.random() * feedbacks.length)],
    next_session_tip: "Try starting with the part you feel most confident about next time.",
    encouragement: "Every session you complete makes the next one easier.",
    source: "fallback",
  };
}

// ============================================
// FOCUS MODE COACHING
// ============================================
export interface FocusCoachingResponse {
  message: string;
  micro_tip: string;
  source: "groq" | "fallback";
}

const FOCUS_COACHING_SYSTEM_PROMPT = `You are a calm focus coach. The student is in the middle of a work session. Provide a brief, grounding message.

Be:
- Very brief (1 sentence each)
- Calming, not distracting
- Focused on the present moment
- Different every time

Respond in JSON:
{
  "message": "Brief grounding message",
  "micro_tip": "One tiny focus tip"
}`;

export async function generateFocusModeCoaching(
  currentStep: string,
  timeElapsed: number
): Promise<FocusCoachingResponse> {
  const { content, source } = await callAI(
    FOCUS_COACHING_SYSTEM_PROMPT,
    `Currently working on: "${currentStep}". Time elapsed: ${timeElapsed} minutes. Seed: ${Math.random().toString(36).slice(2, 6)}`
  );

  if (content) {
    try {
      const parsed = JSON.parse(content);
      return { ...parsed, source };
    } catch {}
  }

  const tips = [
    { message: "You're in it. Stay with this moment.", micro_tip: "Take one deep breath and continue." },
    { message: "One step at a time. You're doing it.", micro_tip: "Focus on just the next 5 minutes." },
    { message: "Progress isn't always visible, but it's happening.", micro_tip: "If stuck, write one sentence about what you know." },
    { message: "You chose to be here. That's already a win.", micro_tip: "Relax your shoulders and keep going." },
    { message: "The hard part was starting. You already did that.", micro_tip: "If your mind wanders, gently bring it back. No judgment." },
  ];
  return { ...tips[Math.floor(Math.random() * tips.length)], source: "fallback" };
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
// MOCK FALLBACKS (varied, not static)
// ============================================
function getMockBreakdown(task: string): Omit<BreakdownResponse, "source"> {
  // Add variability based on task content
  const isWriting = /write|essay|paper|draft/i.test(task);
  const isStudying = /study|exam|final|test|review/i.test(task);
  const isMath = /math|calc|problem|equation/i.test(task);

  if (isWriting) {
    return {
      steps: [
        { title: "Open a blank document", description: "Just open it. You don't need to write yet.", estimated_minutes: 2, priority: "low", tip: "The blank page is less scary once it's actually open." },
        { title: "Write your thesis in one ugly sentence", description: "It doesn't need to be good. Just get your main argument down in any words.", estimated_minutes: 5, priority: "low", tip: "First drafts are supposed to be messy." },
        { title: "List 3-4 main points", description: "Bullet points only. What are the big ideas you want to cover?", estimated_minutes: 8, priority: "medium", tip: "You're building a skeleton, not writing prose." },
        { title: "Write the easiest paragraph first", description: "Skip the intro. Write whichever section you know best.", estimated_minutes: 15, priority: "medium", tip: "You don't have to write in order." },
        { title: "Add one piece of evidence per point", description: "Find one quote, stat, or example for each main idea.", estimated_minutes: 12, priority: "medium", tip: "Imperfect evidence now beats perfect evidence never." },
        { title: "Take a break — you've earned it", description: "Step away for 5 minutes. You've made real progress.", estimated_minutes: 5, priority: "low", tip: "Your brain needs processing time." },
      ],
      encouragement: "You don't need to finish the whole thing. You just need to get words on the page. That's already happening.",
    };
  }

  if (isMath) {
    return {
      steps: [
        { title: "Open to the problem set", description: "Just find the right page or document. That's step one done.", estimated_minutes: 2, priority: "low", tip: "Starting is literally just opening the thing." },
        { title: "Read problem #1 without solving", description: "Just read it. Understand what it's asking. Don't pick up your pencil yet.", estimated_minutes: 3, priority: "low", tip: "Understanding the question is half the work." },
        { title: "Solve the easiest problem you see", description: "Scan all problems and pick the one that feels most doable. Do that one first.", estimated_minutes: 10, priority: "medium", tip: "Quick wins build confidence for harder ones." },
        { title: "Attempt one medium problem", description: "Try it for 8 minutes. If stuck, write what you DO know and move on.", estimated_minutes: 8, priority: "medium", tip: "Partial work often gets partial credit." },
        { title: "Review your formulas/notes for 5 min", description: "Look at the key formulas. Sometimes seeing them sparks the approach.", estimated_minutes: 5, priority: "medium", tip: "You don't need to memorize — just refresh." },
        { title: "Do one more problem", description: "You're warmed up now. Pick another one and go.", estimated_minutes: 12, priority: "high", tip: "Momentum is real. Use it." },
      ],
      encouragement: "Math builds on itself. Every problem you attempt — even partially — is making the next one easier.",
    };
  }

  // Default study breakdown (with variability)
  const variants = [
    {
      steps: [
        { title: "Set up your space", description: "Clear your desk. Get your materials out. Put your phone face-down.", estimated_minutes: 3, priority: "low" as const, tip: "Environment shapes behavior." },
        { title: "Review what you already know", description: "Flip through notes for 5 minutes. Just remind yourself what's familiar.", estimated_minutes: 5, priority: "low" as const, tip: "You know more than you think." },
        { title: "Identify 3 key concepts", description: "What are the 3 most important things to understand? Write them down.", estimated_minutes: 7, priority: "medium" as const, tip: "Focus beats coverage every time." },
        { title: "Explain one concept out loud", description: "Pick the easiest one and explain it like you're teaching a friend.", estimated_minutes: 8, priority: "medium" as const, tip: "If you can explain it, you understand it." },
        { title: "Do one practice problem or question", description: "Find one question and answer it. Just one.", estimated_minutes: 12, priority: "medium" as const, tip: "Active recall > passive reading." },
        { title: "Note what's still fuzzy", description: "Write down what you're unsure about. That's your focus for next session.", estimated_minutes: 5, priority: "low" as const, tip: "Knowing what you don't know is progress." },
      ],
      encouragement: "You don't need to master everything today. You just need to move the needle forward.",
    },
    {
      steps: [
        { title: "Just open your materials", description: "Textbook, slides, whatever. Open it. That's the first win.", estimated_minutes: 2, priority: "low" as const, tip: "The hardest part is literally starting." },
        { title: "Scan the headings/outline", description: "Get a birds-eye view. What topics are covered? Don't read deeply yet.", estimated_minutes: 4, priority: "low" as const, tip: "Overview before detail." },
        { title: "Highlight or mark 5 key terms", description: "Find 5 important concepts. Just mark them — you'll come back later.", estimated_minutes: 6, priority: "medium" as const, tip: "You're building a map of the territory." },
        { title: "Summarize one section in 2 sentences", description: "Pick the section that makes most sense to you. Summarize it simply.", estimated_minutes: 10, priority: "medium" as const, tip: "Your words > textbook words for memory." },
        { title: "Create 3 flashcard-style questions", description: "Write 3 questions you think might appear on the test.", estimated_minutes: 8, priority: "medium" as const, tip: "Predicting questions is a power study move." },
        { title: "Review and close", description: "Look at what you did. You made real progress. Close your materials guilt-free.", estimated_minutes: 3, priority: "low" as const, tip: "Ending intentionally prevents guilt." },
      ],
      encouragement: "Starting was the hard part. You did it. Everything else is momentum.",
    },
  ];

  return variants[Math.floor(Math.random() * variants.length)];
}

function getMockPanicPlan(): Omit<PanicPlanResponse, "source"> {
  return {
    plan: [
      { title: "Take 3 deep breaths", duration: "1 min", description: "Before anything else. Panic makes everything feel worse than it is.", priority: "critical" },
      { title: "Write down exactly what's due", duration: "5 min", description: "Get it out of your head and onto paper. List the specific deliverables.", priority: "critical" },
      { title: "Identify the minimum viable submission", duration: "5 min", description: "What's the bare minimum you need to turn in? Focus there first.", priority: "critical" },
      { title: "Do the easiest part first", duration: "20 min", description: "Start with whatever requires the least thinking. Build momentum.", priority: "important" },
      { title: "Tackle the core content", duration: "45 min", description: "Focus on the most important section. Good enough is good enough.", priority: "important" },
      { title: "Quick review and submit", duration: "10 min", description: "Don't perfectionist-loop. Review once, fix obvious issues, submit.", priority: "if_time" },
    ],
    reassurance: "You're not the first student to be here. Let's focus on what's possible right now, not what should have happened earlier.",
    realistic_assessment: "You can still submit something meaningful. Focus on the core requirements and let go of perfection.",
  };
}

# Momentum ✨

**Start before you're ready.**

AI-powered emotional support for students who procrastinate. Momentum helps students overcome the emotional barrier to starting — not by pushing harder, but by making the first step feel manageable.

## Demo Flow

1. **Landing Page** → Animated hero, feature showcase, social proof
2. **Onboarding** → Name, biggest struggle, study style, goals, stress level
3. **Dashboard** → Streaks, XP, motivation card, task list
4. **AI Task Breakdown** → "Study for chemistry final" → manageable steps
5. **Focus Mode** → Immersive timer, one step at a time
6. **Task Complete** → Confetti, XP reward
7. **Panic Mode** → Deadline emergency recovery plan
8. **Reflection** → Difficulty, confidence, AI-adapted feedback

## Philosophy

The AI acts as a **calm, emotionally intelligent coach**:
- Reduces overwhelm by starting with quick wins
- Adapts to student mood and energy
- Uses supportive language (never fake-positive)
- Never does homework — helps students plan and start
- Celebrates small wins genuinely

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + glassmorphism |
| Components | shadcn/ui (Radix primitives) |
| Animations | Framer Motion |
| AI | Groq API (llama-3.3-70b-versatile) |
| Persistence | localStorage (no database required) |
| Deployment | Vercel-optimized |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

Create `.env.local`:
```
GROQ_API_KEY=your_groq_api_key_here
```

**The app works perfectly without an API key** — all AI features fall back to realistic mock responses.

## Logo

Place your `momentum.png` (or `.svg`) in `/public/`. The current build uses `momentum.svg`.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── breakdown/route.ts    # AI task breakdown
│   │   ├── coach/route.ts        # Motivation messages
│   │   ├── panic/route.ts        # Panic mode recovery plan
│   │   └── reflection/route.ts   # Post-task AI feedback
│   ├── globals.css               # Theme + utilities
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # App entry + routing
├── components/
│   ├── dashboard/
│   │   ├── dashboard.tsx         # Main dashboard
│   │   ├── motivation-card.tsx   # AI-powered daily nudge
│   │   ├── streak-card.tsx       # Streak display
│   │   ├── task-list.tsx         # Task list with actions
│   │   └── xp-card.tsx           # XP/level progress
│   ├── ui/
│   │   ├── button.tsx            # Button component
│   │   └── progress.tsx          # Progress bar
│   ├── app-shell.tsx             # Main app orchestrator
│   ├── emotional-checkin.tsx     # Pre-session mood check
│   ├── focus-mode.tsx            # Immersive focus timer
│   ├── landing-page.tsx          # Marketing landing page
│   ├── onboarding.tsx            # Multi-step onboarding
│   ├── panic-mode.tsx            # Emergency deadline recovery
│   └── reflection.tsx            # Post-task reflection
├── lib/
│   ├── ai.ts                     # Centralized Groq AI + fallbacks
│   ├── store.ts                  # localStorage persistence
│   ├── types.ts                  # TypeScript types
│   └── utils.ts                  # Utility functions
└── public/
    └── momentum.svg              # Logo
```

## Key Features

### Works Without Backend
Everything persists in localStorage. No Supabase, no database setup, no authentication required. Perfect for demos.

### Graceful AI Fallback
If `GROQ_API_KEY` is missing, all AI features return realistic mock responses. The demo flow works identically.

### Panic Mode
Students enter their assignment, deadline, and current progress. The AI generates a prioritized emergency recovery plan with realistic time estimates.

### Emotional Adaptation
The AI adapts its approach based on the student's emotional check-in:
- **Anxious** → Extra small steps, more reassurance
- **Overwhelmed** → Fewer steps, hyper-specific actions
- **Tired** → Short passive tasks, includes breaks
- **Motivated** → Deeper work blocks
- **Energized** → Longer focused sessions

## Deployment

```bash
npm run build
```

Deploy to Vercel with zero configuration. Set `GROQ_API_KEY` as an environment variable.

---

*Built for Stanford AI Hackathon. Momentum helps students start.*

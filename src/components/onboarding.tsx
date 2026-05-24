"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Sparkles, Rocket, Mail, Chrome, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createUser, signInWithGoogle, signInWithMagicLink } from "@/lib/store";
import { isSupabaseConfigured } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface OnboardingProps {
  onComplete: () => void;
}

interface StepData {
  name: string;
  struggle: string;
  studyStyle: string;
  goal: string;
  stressLevel: string;
}

const struggles = [
  { value: "starting", label: "Getting started", emoji: "🧊" },
  { value: "focusing", label: "Staying focused", emoji: "🌀" },
  { value: "overwhelm", label: "Feeling overwhelmed", emoji: "🌊" },
  { value: "planning", label: "Knowing where to begin", emoji: "🗺️" },
  { value: "motivation", label: "Finding motivation", emoji: "💤" },
  { value: "perfectionism", label: "Perfectionism paralysis", emoji: "✨" },
];

const studyStyles = [
  { value: "short-bursts", label: "Short bursts (10-15 min)", emoji: "⚡" },
  { value: "pomodoro", label: "Pomodoro (25 min blocks)", emoji: "🍅" },
  { value: "deep-work", label: "Deep work (45+ min)", emoji: "🧘" },
  { value: "not-sure", label: "Not sure yet", emoji: "🤷" },
];

const stressLevels = [
  { value: "low", label: "Pretty chill", color: "bg-green-100 border-green-300 text-green-700" },
  { value: "moderate", label: "Somewhat stressed", color: "bg-yellow-100 border-yellow-300 text-yellow-700" },
  { value: "high", label: "Very stressed", color: "bg-orange-100 border-orange-300 text-orange-700" },
  { value: "crisis", label: "In crisis mode", color: "bg-red-100 border-red-300 text-red-700" },
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<StepData>({
    name: "",
    struggle: "",
    studyStyle: "",
    goal: "",
    stressLevel: "",
  });
  const [email, setEmail] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const hasAuth = isSupabaseConfigured();
  const totalSteps = hasAuth ? 6 : 5;
  const contentStep = hasAuth ? step - 1 : step;
  const progress = ((step + 1) / totalSteps) * 100;

  const canProceed = () => {
    if (hasAuth && step === 0) return true; // Auth step can always be skipped
    switch (contentStep) {
      case 0: return data.name.trim().length > 0;
      case 1: return data.struggle.length > 0;
      case 2: return data.studyStyle.length > 0;
      case 3: return data.goal.trim().length > 0;
      case 4: return data.stressLevel.length > 0;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      createUser(data.name, {
        academicStruggle: data.struggle,
        studyStyle: data.studyStyle,
        currentGoal: data.goal,
        stressLevel: data.stressLevel,
      });
      onComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    await signInWithGoogle();
    // Redirects away — loading state stays
  };

  const handleMagicLink = async () => {
    if (!email.trim()) return;
    setAuthLoading(true);
    const { error } = await signInWithMagicLink(email);
    setAuthLoading(false);
    if (!error) {
      setMagicLinkSent(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-background"
    >
      {/* Soft ambient */}
      <div className="absolute top-[20%] left-[10%] w-[350px] h-[350px] rounded-full bg-purple-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] rounded-full bg-teal-500/5 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo + Progress */}
        <motion.div
          className="flex flex-col items-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <img src="/momentum.png" alt="Momentum" className="w-12 h-12 mb-4 rounded-xl" />
          <div className="w-full max-w-xs h-1.5 rounded-full bg-secondary overflow-hidden">
            <motion.div
              className="h-full rounded-full gradient-primary"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Step {step + 1} of {totalSteps}
          </p>
        </motion.div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          {/* Auth Step (only if Supabase is configured) */}
          {hasAuth && step === 0 && (
            <StepContainer key="auth">
              <h2 className="text-2xl font-bold mb-2">Welcome to Momentum ✨</h2>
              <p className="text-muted-foreground mb-6 text-sm">
                Sign in to save your progress across devices, or continue without an account.
              </p>

              {magicLinkSent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center p-6 rounded-xl bg-emerald-50 border border-emerald-200"
                >
                  <Mail className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
                  <p className="text-sm font-medium text-emerald-700">Check your email!</p>
                  <p className="text-xs text-emerald-600 mt-1">
                    We sent a magic link to {email}
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  <Button
                    onClick={handleGoogleSignIn}
                    disabled={authLoading}
                    variant="outline"
                    className="w-full gap-2 py-5"
                  >
                    {authLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Chrome className="h-4 w-4" />
                    )}
                    Continue with Google
                  </Button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-background px-2 text-muted-foreground">or</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleMagicLink()}
                      placeholder="your@email.edu"
                      className="flex-1 px-4 py-2.5 rounded-xl border bg-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <Button
                      onClick={handleMagicLink}
                      disabled={authLoading || !email.trim()}
                      size="sm"
                      className="px-4"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-[10px] text-center text-muted-foreground">
                    We&apos;ll send a magic link — no password needed
                  </p>
                </div>
              )}

              <div className="mt-6 text-center">
                <button
                  onClick={handleNext}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                >
                  Skip — continue without an account
                </button>
              </div>
            </StepContainer>
          )}

          {/* Name step */}
          {contentStep === 0 && (!hasAuth || step > 0) && (
            <StepContainer key="name">
              <h2 className="text-2xl font-bold mb-2">Hey there 👋</h2>
              <p className="text-muted-foreground mb-6">
                What should I call you?
              </p>
              <input
                type="text"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && canProceed() && handleNext()}
                placeholder="Your first name"
                className="w-full px-4 py-3 rounded-xl border bg-white/50 dark:bg-white/5 text-center text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 backdrop-blur-sm"
                autoFocus
              />
            </StepContainer>
          )}

          {contentStep === 1 && (
            <StepContainer key="struggle">
              <h2 className="text-2xl font-bold mb-2">
                What&apos;s your biggest struggle?
              </h2>
              <p className="text-muted-foreground mb-6">
                No judgment — this helps me adapt to you.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {struggles.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setData({ ...data, struggle: item.value })}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all duration-200 text-sm",
                      data.struggle === item.value
                        ? "border-primary bg-primary/5 shadow-glow"
                        : "border-transparent bg-white/50 dark:bg-white/5 hover:border-primary/30"
                    )}
                  >
                    <span className="text-xl">{item.emoji}</span>
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </StepContainer>
          )}

          {contentStep === 2 && (
            <StepContainer key="style">
              <h2 className="text-2xl font-bold mb-2">
                How do you like to study?
              </h2>
              <p className="text-muted-foreground mb-6">
                I&apos;ll match your pace.
              </p>
              <div className="space-y-3">
                {studyStyles.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setData({ ...data, studyStyle: item.value })}
                    className={cn(
                      "w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left",
                      data.studyStyle === item.value
                        ? "border-primary bg-primary/5 shadow-glow"
                        : "border-transparent bg-white/50 dark:bg-white/5 hover:border-primary/30"
                    )}
                  >
                    <span className="text-xl">{item.emoji}</span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </StepContainer>
          )}

          {contentStep === 3 && (
            <StepContainer key="goal">
              <h2 className="text-2xl font-bold mb-2">
                What&apos;s your current goal?
              </h2>
              <p className="text-muted-foreground mb-6">
                What are you working toward right now?
              </p>
              <input
                type="text"
                value={data.goal}
                onChange={(e) => setData({ ...data, goal: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && canProceed() && handleNext()}
                placeholder='e.g., "Pass my finals" or "Finish my thesis"'
                className="w-full px-4 py-3 rounded-xl border bg-white/50 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 backdrop-blur-sm"
                autoFocus
              />
            </StepContainer>
          )}

          {contentStep === 4 && (
            <StepContainer key="stress">
              <h2 className="text-2xl font-bold mb-2">
                How stressed are you right now?
              </h2>
              <p className="text-muted-foreground mb-6">
                Be honest. This helps me calibrate.
              </p>
              <div className="space-y-3">
                {stressLevels.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setData({ ...data, stressLevel: item.value })}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 transition-all duration-200 text-sm font-medium",
                      data.stressLevel === item.value
                        ? item.color + " border-2"
                        : "border-transparent bg-white/50 dark:bg-white/5 hover:bg-white/80"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </StepContainer>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <motion.div
          className="flex items-center justify-between mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 0}
            className="gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {!(hasAuth && step === 0) && (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className={cn(
                "gap-2 px-6",
                step === totalSteps - 1 && "gradient-primary text-white shadow-glow"
              )}
            >
              {step === totalSteps - 1 ? (
                <>
                  Let&apos;s go <Rocket className="h-4 w-4" />
                </>
              ) : (
                <>
                  Next <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

function StepContainer({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="bg-card rounded-2xl p-8 border border-border shadow-glow"
    >
      {children}
    </motion.div>
  );
}

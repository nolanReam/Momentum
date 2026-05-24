"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

const stories = [
  {
    text: "I kept opening my laptop and just... staring. I knew I had to study but couldn\u2019t make myself start. Momentum broke it into tiny pieces and suddenly I was 20 minutes in.",
    name: "Maya",
    detail: "Sophomore, Biology",
  },
  {
    text: "I had a paper due in 8 hours and I hadn\u2019t started. Panic Mode gave me a real plan instead of just more anxiety. I actually submitted something I\u2019m proud of.",
    name: "Jordan",
    detail: "Junior, English",
  },
  {
    text: "It doesn\u2019t yell at me to be productive. It just quietly asks how I\u2019m feeling and then gives me something I can actually do. That\u2019s what I needed.",
    name: "Sam",
    detail: "Freshman, CS",
  },
];

const capabilities = [
  "Breaks overwhelming tasks into 5-minute starting points",
  "Adapts to your energy \u2014 tired days get gentler steps",
  "Panic Mode for deadline emergencies",
  "Never does your work \u2014 helps you start it yourself",
];

export function LandingPage({ onGetStarted, onSignIn }: LandingPageProps) {
  return (
    <div className="min-h-screen overflow-hidden bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-card/70 backdrop-blur-xl border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-2.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <img
              src="/momentum.png"
              alt="Momentum"
              className="w-8 h-8 rounded-lg hover:scale-105 transition-transform duration-300"
            />
            <span className="font-semibold text-[15px] text-foreground">Momentum</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Button variant="ghost" onClick={onSignIn} className="text-sm text-muted-foreground">
              Sign in
            </Button>
          </motion.div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center justify-center px-6 pt-28">
        {/* Soft ambient light */}
        <div className="absolute top-[20%] left-[15%] w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[15%] w-[350px] h-[350px] rounded-full bg-teal-500/5 blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Emotional headline */}
            <h1 className="text-[2.75rem] sm:text-[3.5rem] md:text-[4rem] font-bold tracking-tight leading-[1.08] mb-6">
              You know you should start.
              <br />
              <span className="text-gradient">Let&apos;s make that easier.</span>
            </h1>

            {/* Real emotional subtext */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed font-light">
              Momentum is for students who stare at assignments and feel paralyzed.
              It breaks the starting barrier with AI that understands <em>how you feel</em>, not just what&apos;s due.
            </p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-col items-center gap-3"
            >
              <Button
                size="lg"
                onClick={onGetStarted}
                className="text-[15px] px-8 py-6 rounded-2xl gradient-primary text-white shadow-glow-lg hover:shadow-glow transition-shadow duration-300 gap-2.5 font-medium"
              >
                Start — it takes 30 seconds
                <ArrowRight className="h-4 w-4" />
              </Button>
              <p className="text-xs text-muted-foreground/70">
                No account required. No credit card. Just start.
              </p>
            </motion.div>
          </motion.div>

          {/* Demo card */}
          <motion.div
            className="mt-20"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-glow-lg max-w-md mx-auto text-left">
              <div className="flex items-center gap-2.5 mb-5">
                <img src="/momentum.png" alt="" className="w-6 h-6 rounded-md" />
                <span className="text-xs font-medium text-muted-foreground">Momentum AI</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">I need to study for my chemistry final but I can&apos;t start...</p>
              <div className="bg-secondary rounded-xl p-4 space-y-3">
                <p className="text-xs font-medium text-foreground mb-2">
                  Let&apos;s make this manageable. Start here:
                </p>
                {[
                  { step: "Open your notes and read just one page", time: "3 min" },
                  { step: "Write 3 things you already know", time: "5 min" },
                  { step: "Try one easy practice problem", time: "8 min" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 + i * 0.25 }}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                      </div>
                      <span className="text-[13px] text-foreground">{item.step}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground flex-shrink-0">{item.time}</span>
                  </motion.div>
                ))}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.2 }}
                  className="text-[11px] text-primary/60 pt-1 italic"
                >
                  You don&apos;t need to finish. Just start step 1.
                </motion.p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What it does — not a feature grid, a feeling */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Not productivity. <span className="text-gradient">Permission to start small.</span>
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto text-[15px]">
              Momentum doesn&apos;t push you to do more. It helps you do the first thing.
            </p>
          </motion.div>

          <div className="space-y-4 max-w-lg mx-auto">
            {capabilities.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border shadow-sm"
              >
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                <span className="text-[14px] text-foreground leading-relaxed">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Student stories — real, emotional */}
      <section className="py-24 px-6 bg-card/50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              From stuck to started
            </h2>
            <p className="text-muted-foreground text-[15px]">
              Students who know the feeling.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {stories.map((story, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-warm transition-shadow duration-300"
              >
                <p className="text-[13.5px] leading-relaxed text-foreground mb-5">
                  &ldquo;{story.text}&rdquo;
                </p>
                <div>
                  <p className="text-sm font-medium">{story.name}</p>
                  <p className="text-xs text-muted-foreground">{story.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA — warm, not aggressive */}
      <section className="py-28 px-6">
        <motion.div
          className="max-w-lg mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <img src="/momentum.png" alt="" className="w-12 h-12 mx-auto mb-6 rounded-xl shadow-warm" />
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            The first step is the hardest.
          </h2>
          <p className="text-muted-foreground mb-8 text-[15px] leading-relaxed">
            You don&apos;t need to feel ready. You just need to begin.
            <br />
            Momentum is here when you are.
          </p>
          <Button
            size="lg"
            onClick={onGetStarted}
            className="text-[15px] px-8 py-6 rounded-2xl gradient-primary text-white shadow-glow hover:shadow-glow-lg transition-shadow duration-300 gap-2 font-medium"
          >
            Try Momentum
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 bg-card/30">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <img src="/momentum.png" alt="Momentum" className="w-5 h-5 rounded" />
            <span className="text-xs font-medium">Momentum</span>
          </div>
          <p className="text-xs">For students who start</p>
        </div>
      </footer>
    </div>
  );
}

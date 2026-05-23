"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Brain, Heart, Zap, Target, Timer, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

const features = [
  {
    icon: Brain,
    title: "AI Task Breakdown",
    description: "Turn overwhelming assignments into small, actionable steps you can actually start.",
  },
  {
    icon: Heart,
    title: "Emotional Intelligence",
    description: "Adapts to your mood. Anxious? Smaller steps. Energized? Deeper work.",
  },
  {
    icon: Timer,
    title: "Focus Mode",
    description: "Immersive, distraction-free sessions. One step at a time.",
  },
  {
    icon: Shield,
    title: "Panic Mode",
    description: "Deadline tomorrow? Get a realistic emergency recovery plan.",
  },
  {
    icon: Zap,
    title: "Build Momentum",
    description: "XP, streaks, and levels. Celebrate every small win.",
  },
  {
    icon: Target,
    title: "You Stay in Control",
    description: "We help you plan and start. We never do the work for you.",
  },
];

const testimonials = [
  {
    quote: "I went from staring at my laptop for 3 hours to actually finishing my essay outline in 20 minutes.",
    name: "Maya, Sophomore",
  },
  {
    quote: "The panic mode saved my grade. It helped me figure out what was actually possible before my deadline.",
    name: "Jordan, Junior",
  },
  {
    quote: "It doesn't feel like a productivity app. It feels like having a supportive friend who gets it.",
    name: "Alex, Freshman",
  },
];

export function LandingPage({ onGetStarted, onSignIn }: LandingPageProps) {
  return (
    <div className="min-h-screen overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-strong">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-2.5"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src="/momentum.svg"
              alt="Momentum"
              className="w-8 h-8 hover:scale-110 transition-transform duration-300"
            />
            <span className="font-bold text-lg text-gradient">Momentum</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button variant="ghost" onClick={onSignIn} className="text-sm">
              Sign In
            </Button>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        {/* Animated gradient background */}
        <div className="absolute inset-0 animated-gradient opacity-[0.03]" />
        <div className="absolute inset-0 gradient-calm" />

        {/* Floating decorative elements */}
        <motion.div
          className="absolute top-1/4 left-[10%] w-64 h-64 rounded-full bg-purple-400/10 blur-3xl"
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-[10%] w-80 h-80 rounded-full bg-cyan-400/10 blur-3xl"
          animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 right-[25%] w-40 h-40 rounded-full bg-amber-400/5 blur-3xl"
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-8 text-sm text-muted-foreground"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-500" />
              AI-powered study companion
            </motion.div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="text-gradient">Start</span> before{" "}
              <br className="hidden sm:block" />
              you&apos;re ready.
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Momentum helps students overcome the emotional barrier to starting.
              Not by pushing harder — by making the first step feel{" "}
              <span className="text-foreground font-medium">manageable</span>.
            </p>

            {/* CTA */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                size="lg"
                onClick={onGetStarted}
                className="text-base px-8 py-6 rounded-xl shadow-glow gradient-primary hover:opacity-90 transition-opacity gap-2"
              >
                Get Started — it&apos;s free
                <ArrowRight className="h-4 w-4" />
              </Button>
              <p className="text-xs text-muted-foreground">
                No account needed. Start in 30 seconds.
              </p>
            </motion.div>
          </motion.div>

          {/* Interactive demo preview */}
          <motion.div
            className="mt-16 relative"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <div className="glass rounded-2xl p-6 shadow-glow-lg max-w-lg mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="text-left space-y-3">
                <p className="text-sm text-muted-foreground">What do you need to do?</p>
                <div className="glass rounded-lg px-4 py-3 text-sm font-medium">
                  Study for chemistry final
                </div>
                <motion.div
                  className="space-y-2 pt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                >
                  <p className="text-xs text-purple-600 font-medium flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Here&apos;s your game plan:
                  </p>
                  {["Review Chapter 5 flashcards (5 min)", "Summarize one section in your words (10 min)", "Practice 3 easy problems (15 min)"].map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.8 + i * 0.2 }}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                        {i + 1}
                      </div>
                      {step}
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Built for how students <span className="text-gradient">actually</span> work
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Not another productivity app. Momentum understands the psychology of procrastination.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 hover:shadow-glow transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-24 px-6 gradient-calm">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Students who started
            </h2>
            <p className="text-muted-foreground">
              Real stories from students who broke through procrastination.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass rounded-2xl p-6"
              >
                <p className="text-sm leading-relaxed mb-4 italic text-muted-foreground">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <p className="text-sm font-medium">{testimonial.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 px-6">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to build momentum?
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            The hardest part is starting. Let us make that easier.
          </p>
          <Button
            size="lg"
            onClick={onGetStarted}
            className="text-base px-8 py-6 rounded-xl shadow-glow gradient-primary hover:opacity-90 transition-opacity gap-2"
          >
            Start Now
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <img src="/momentum.svg" alt="Momentum" className="w-5 h-5" />
            <span>Momentum</span>
          </div>
          <p>Built with ❤️ for students who start</p>
        </div>
      </footer>
    </div>
  );
}

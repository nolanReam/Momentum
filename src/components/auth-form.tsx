"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, Loader2, Chrome, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/lib/store";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

interface AuthFormProps {
  onSuccess: () => void;
  onSkip: () => void;
}

type AuthMode = "login" | "signup";

export function AuthForm({ onSuccess, onSkip }: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    setError(null);

    const supabase = getSupabase();
    if (!supabase) {
      setError("Authentication not configured");
      setIsLoading(false);
      return;
    }

    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name, full_name: name },
          },
        });
        if (signUpError) {
          setError(signUpError.message);
        } else {
          setSuccess("Account created! Check your email to confirm, or continue below.");
          // Auto sign-in after signup (Supabase allows this if email confirmation is disabled)
          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (!signInError) {
            console.log("[Momentum Auth] Sign up + auto sign-in successful");
            onSuccess();
            return;
          }
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          setError(signInError.message);
        } else {
          console.log("[Momentum Auth] Sign in successful");
          onSuccess();
          return;
        }
      }
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    }

    setIsLoading(false);
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error);
      setIsLoading(false);
    }
    // If successful, redirects away
  };

  if (!isSupabaseConfigured()) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-8 border border-border shadow-glow w-full max-w-sm mx-auto text-center"
      >
        <img src="/momentum.png" alt="" className="w-12 h-12 mx-auto mb-4 rounded-xl" />
        <h2 className="text-xl font-bold mb-2">Welcome to Momentum</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Cloud sync is not configured. You can still use the app locally.
        </p>
        <Button onClick={onSkip} className="w-full gradient-primary text-white gap-2">
          Continue without account
          <ArrowRight className="h-4 w-4" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-8 border border-border shadow-glow w-full max-w-sm mx-auto"
    >
      <div className="text-center mb-6">
        <img src="/momentum.png" alt="" className="w-12 h-12 mx-auto mb-4 rounded-xl" />
        <h2 className="text-xl font-bold">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {mode === "signup"
            ? "Your progress will sync across devices"
            : "Pick up where you left off"}
        </p>
      </div>

      {/* Google Auth */}
      <Button
        variant="outline"
        onClick={handleGoogleAuth}
        disabled={isLoading}
        className="w-full gap-2 mb-4 py-5"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Chrome className="h-4 w-4" />}
        Continue with Google
      </Button>

      {/* Divider */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-card px-3 text-muted-foreground">or use email</span>
        </div>
      </div>

      {/* Email/Password Form */}
      <div className="space-y-3">
        {mode === "signup" && (
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        )}

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
            placeholder="Password (min 6 characters)"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg"
          >
            {error}
          </motion.p>
        )}

        {success && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-emerald-400 bg-emerald-400/10 px-3 py-2 rounded-lg"
          >
            {success}
          </motion.p>
        )}

        <Button
          onClick={handleEmailAuth}
          disabled={isLoading}
          className="w-full gradient-primary text-white gap-2 py-5"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : mode === "signup" ? (
            "Create Account"
          ) : (
            "Sign In"
          )}
        </Button>
      </div>

      {/* Toggle mode */}
      <p className="text-center text-xs text-muted-foreground mt-4">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <button onClick={() => { setMode("login"); setError(null); }} className="text-primary hover:underline">
              Sign in
            </button>
          </>
        ) : (
          <>
            Need an account?{" "}
            <button onClick={() => { setMode("signup"); setError(null); }} className="text-primary hover:underline">
              Sign up
            </button>
          </>
        )}
      </p>

      {/* Skip */}
      <div className="mt-4 text-center">
        <button
          onClick={onSkip}
          className="text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
        >
          Skip — continue without an account
        </button>
      </div>
    </motion.div>
  );
}

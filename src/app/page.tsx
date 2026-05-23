"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { LandingPage } from "@/components/landing-page";
import { Onboarding } from "@/components/onboarding";
import { AppShell } from "@/components/app-shell";
import { getUser, getSession, fullSync } from "@/lib/store";
import { isSupabaseConfigured } from "@/lib/supabase";

type AppView = "landing" | "onboarding" | "app";

export default function Home() {
  const [view, setView] = useState<AppView>("landing");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function init() {
      // Check if user is already set up locally
      const localUser = getUser();
      if (localUser?.onboardingComplete) {
        setView("app");
        // Background sync if Supabase configured
        if (isSupabaseConfigured()) {
          fullSync();
        }
        setIsLoading(false);
        return;
      }

      // Check if authenticated via Supabase (returning from OAuth)
      if (isSupabaseConfigured()) {
        const session = await getSession();
        if (session) {
          // User authenticated but hasn't onboarded yet
          // Or sync profile from cloud
          const { syncProfileFromCloud } = await import("@/lib/store");
          const cloudProfile = await syncProfileFromCloud();
          if (cloudProfile?.onboardingComplete) {
            setView("app");
            setIsLoading(false);
            return;
          }
          // Authenticated but needs onboarding
          setView("onboarding");
          setIsLoading(false);
          return;
        }
      }

      setIsLoading(false);
    }

    init();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-calm">
        <div className="flex flex-col items-center gap-5">
          <img
            src="/momentum.png"
            alt="Momentum"
            className="w-14 h-14 rounded-2xl shadow-warm animate-pulse"
          />
          <div className="h-1 w-20 rounded-full bg-primary/20 overflow-hidden">
            <div className="h-full w-1/2 rounded-full bg-primary/60 animate-[shimmer_1.5s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {view === "landing" && (
        <LandingPage
          key="landing"
          onGetStarted={() => setView("onboarding")}
          onSignIn={() => {
            const user = getUser();
            if (user?.onboardingComplete) setView("app");
            else setView("onboarding");
          }}
        />
      )}
      {view === "onboarding" && (
        <Onboarding
          key="onboarding"
          onComplete={() => setView("app")}
        />
      )}
      {view === "app" && (
        <AppShell
          key="app"
          onLogout={() => setView("landing")}
        />
      )}
    </AnimatePresence>
  );
}

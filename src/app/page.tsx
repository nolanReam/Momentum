"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { LandingPage } from "@/components/landing-page";
import { Onboarding } from "@/components/onboarding";
import { AppShell } from "@/components/app-shell";
import { getUser, getSession, fullSync, syncProfileFromCloud } from "@/lib/store";
import { isSupabaseConfigured } from "@/lib/supabase";

type AppView = "landing" | "onboarding" | "app";

export default function Home() {
  const [view, setView] = useState<AppView>("landing");
  const [isLoading, setIsLoading] = useState(true);
  const [skipAuthStep, setSkipAuthStep] = useState(false);

  useEffect(() => {
    async function init() {
      console.log("[Momentum Init] Starting...");

      // Check if user is already set up locally with completed onboarding
      const localUser = getUser();
      console.log("[Momentum Init] Local user:", localUser ? { name: localUser.name, onboarded: localUser.onboardingComplete } : "none");

      if (localUser?.onboardingComplete) {
        setView("app");
        if (isSupabaseConfigured()) fullSync();
        setIsLoading(false);
        return;
      }

      // Check if authenticated via Supabase (returning from OAuth redirect)
      if (isSupabaseConfigured()) {
        const session = await getSession();
        console.log("[Momentum Init] Session:", session ? session.user.email : "none");

        if (session) {
          // Check local first — user may have onboarded on this device before
          const localAfterAuth = getUser();
          if (localAfterAuth?.onboardingComplete) {
            console.log("[Momentum Init] Local profile found after auth — going to app");
            setView("app");
            fullSync();
            setIsLoading(false);
            return;
          }

          // Try to get profile from cloud
          const cloudProfile = await syncProfileFromCloud();
          console.log("[Momentum Init] Cloud profile:", cloudProfile ? { name: cloudProfile.name, onboarded: cloudProfile.onboardingComplete } : "none");

          if (cloudProfile?.onboardingComplete) {
            // User already completed onboarding on another device
            console.log("[Momentum Init] Cloud profile onboarded — going to app");
            setView("app");
            setIsLoading(false);
            return;
          }

          // User is authenticated but hasn't completed onboarding
          console.log("[Momentum Init] Authenticated but not onboarded — showing onboarding");
          setSkipAuthStep(true);
          setView("onboarding");
          setIsLoading(false);
          return;
        }
      }

      console.log("[Momentum Init] No session, no local user — showing landing");
      setIsLoading(false);
    }

    init();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
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
          skipAuth={skipAuthStep}
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

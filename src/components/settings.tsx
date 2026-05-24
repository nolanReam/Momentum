"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, User, BookOpen, Zap, RotateCcw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUser, saveUser, clearAllData, getAchievements, getTasks } from "@/lib/store";
import { isSupabaseConfigured } from "@/lib/supabase";
import { UserProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SettingsProps {
  onClose: () => void;
  onLogout: () => void;
}

export function Settings({ onClose, onLogout }: SettingsProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const u = getUser();
    setUser(u);
    if (u) setName(u.name);
  }, []);

  const handleSave = () => {
    if (!user || !name.trim()) return;
    const updated = { ...user, name: name.trim() };
    saveUser(updated);
    setUser(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePreferenceChange = (key: keyof UserProfile["preferences"], value: string) => {
    if (!user) return;
    const updated = { ...user, preferences: { ...user.preferences, [key]: value } };
    saveUser(updated);
    setUser(updated);
  };

  const handleExport = () => {
    const data = {
      profile: getUser(),
      tasks: getTasks(),
      achievements: getAchievements(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `momentum-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (confirm("This will delete all your local data. Are you sure?")) {
      clearAllData();
      onLogout();
    }
  };

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background"
    >
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="font-semibold text-[15px]">Settings</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Profile */}
        <Section icon={User} title="Profile">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Display Name</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-border bg-secondary text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <Button size="sm" onClick={handleSave} disabled={name === user.name}>
                  {saved ? "Saved!" : "Save"}
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Level</span>
              <span className="font-medium">{user.level}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total XP</span>
              <span className="font-medium">{user.xp}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current Streak</span>
              <span className="font-medium">{user.streak} days</span>
            </div>
            {isSupabaseConfigured() && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Cloud Sync</span>
                <span className="text-emerald-600 text-xs font-medium">Active</span>
              </div>
            )}
          </div>
        </Section>

        {/* Study Preferences */}
        <Section icon={BookOpen} title="Study Preferences">
          <div className="space-y-4">
            <PreferenceSelect
              label="Study Style"
              value={user.preferences.studyStyle}
              onChange={(v) => handlePreferenceChange("studyStyle", v)}
              options={[
                { value: "short-bursts", label: "Short bursts (10-15 min)" },
                { value: "pomodoro", label: "Pomodoro (25 min blocks)" },
                { value: "deep-work", label: "Deep work (45+ min)" },
                { value: "not-sure", label: "Flexible / Not sure" },
              ]}
            />
            <PreferenceSelect
              label="Stress Level"
              value={user.preferences.stressLevel}
              onChange={(v) => handlePreferenceChange("stressLevel", v)}
              options={[
                { value: "low", label: "Pretty chill" },
                { value: "moderate", label: "Somewhat stressed" },
                { value: "high", label: "Very stressed" },
                { value: "crisis", label: "In crisis mode" },
              ]}
            />
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Current Goal</label>
              <input
                type="text"
                value={user.preferences.currentGoal}
                onChange={(e) => handlePreferenceChange("currentGoal", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-secondary text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        </Section>

        {/* Data */}
        <Section icon={Zap} title="Data & Privacy">
          <div className="space-y-3">
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-2 w-full justify-start">
              <Download className="h-3.5 w-3.5" />
              Export My Data
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-2 w-full justify-start text-red-600 border-red-200 hover:bg-red-50">
              <RotateCcw className="h-3.5 w-3.5" />
              Reset All Data
            </Button>
          </div>
        </Section>
      </main>
    </motion.div>
  );
}

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="font-semibold text-sm">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function PreferenceSelect({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-xl border border-border text-sm bg-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

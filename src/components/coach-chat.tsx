"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, Sparkles, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildAIContext, contextToPrompt } from "@/lib/ai-context";
import { getChatHistory, addChatMessage, ChatMessage } from "@/lib/chat-store";
import { cn } from "@/lib/utils";

interface CoachChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const suggestedPrompts = [
  "Help me start",
  "Break this down further",
  "I'm overwhelmed",
  "Give me a 10-minute version",
  "Quiz me on this",
  "Make a schedule",
];

export function CoachChat({ isOpen, onClose }: CoachChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [source, setSource] = useState<"groq" | "fallback" | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMessages(getChatHistory());
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMsg = addChatMessage({ role: "user", content: content.trim() });
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const ctx = buildAIContext();
      const contextStr = contextToPrompt(ctx);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          context: contextStr,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg = addChatMessage({ role: "assistant", content: data.content });
        setMessages((prev) => [...prev, assistantMsg]);
        setSource(data.source);
      }
    } catch (e) {
      const errorMsg = addChatMessage({ role: "assistant", content: "I'm here. Let's try that again — what's on your mind?" });
      setMessages((prev) => [...prev, errorMsg]);
    }

    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed inset-0 sm:inset-auto sm:right-4 sm:top-4 sm:bottom-4 sm:w-[380px] z-50 flex flex-col bg-card border border-border rounded-none sm:rounded-2xl shadow-glow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">Momentum Coach</p>
            <p className="text-[10px] text-muted-foreground">
              {source === "groq" ? "AI-powered • personalized" : "Ready to help"}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7 text-muted-foreground">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <MessageCircle className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-1">Hey, I&apos;m your study coach.</p>
            <p className="text-xs text-muted-foreground/70">Ask me anything about your tasks, or just tell me how you&apos;re feeling.</p>

            {/* Suggested prompts */}
            <div className="flex flex-wrap gap-1.5 justify-center mt-5">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="px-3 py-1.5 rounded-full bg-secondary border border-border text-[11px] text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-secondary text-foreground rounded-bl-md"
              )}
            >
              {msg.content}
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-pulse [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-pulse [animation-delay:0.4s]" />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts (when there are messages) */}
      {messages.length > 0 && messages.length < 4 && (
        <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto">
          {suggestedPrompts.slice(0, 3).map((prompt) => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              className="px-2.5 py-1 rounded-full bg-secondary border border-border text-[10px] text-muted-foreground hover:text-foreground whitespace-nowrap flex-shrink-0 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-3 py-3 border-t border-border">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
            placeholder="Ask your coach anything..."
            disabled={isLoading}
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-border bg-secondary text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim()}
            size="icon"
            className="h-10 w-10 rounded-xl gradient-primary text-white flex-shrink-0"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Floating "Ask Momentum" button
 */
export function CoachChatButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 h-12 px-4 rounded-full gradient-primary text-white shadow-glow-lg flex items-center gap-2 hover:scale-105 transition-transform"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <MessageCircle className="h-4 w-4" />
      <span className="text-sm font-medium hidden sm:inline">Ask Momentum</span>
    </motion.button>
  );
}

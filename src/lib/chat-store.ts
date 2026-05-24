export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const CHAT_KEY = "momentum_chat_history";
const MAX_MESSAGES = 50;

export function getChatHistory(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CHAT_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveChatHistory(messages: ChatMessage[]): void {
  if (typeof window === "undefined") return;
  // Keep only last MAX_MESSAGES
  const trimmed = messages.slice(-MAX_MESSAGES);
  localStorage.setItem(CHAT_KEY, JSON.stringify(trimmed));
}

export function addChatMessage(message: Omit<ChatMessage, "id" | "timestamp">): ChatMessage {
  const msg: ChatMessage = {
    ...message,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
  const history = getChatHistory();
  history.push(msg);
  saveChatHistory(history);
  return msg;
}

export function clearChatHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CHAT_KEY);
}

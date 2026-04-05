import { useState } from "react";
import { Send, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import GlassCard from "./GlassCard";
import ModeToggle from "./ModeToggle";
import ChatBubble from "./ChatBubble";
import type { Message, Conversation } from "@/data/mockData";
import type { EncryptionMode } from "@/hooks/useCrypto";
import { useCrypto } from "@/hooks/useCrypto";

interface ChatWindowProps {
  conversation: Conversation | undefined;
  messages: Message[];
  mode: EncryptionMode;
  onModeChange: (mode: EncryptionMode) => void;
  shiftKey: number;
  onShiftKeyChange: (key: number) => void;
  inputValue: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
}

const ChatWindow = ({
  conversation,
  messages,
  mode,
  onModeChange,
  shiftKey,
  onShiftKeyChange,
  inputValue,
  onInputChange,
  onSendMessage,
}: ChatWindowProps) => {
  const [sending, setSending] = useState(false);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    setSending(true);
    onSendMessage();
    setTimeout(() => setSending(false), 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Lock className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p>Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      {/* Header */}
      <GlassCard className="rounded-2xl p-4 mb-3 shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                {conversation.initials}
              </div>
              {conversation.online && (
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success border-2 border-background" />
              )}
            </div>
            <div>
              <p className="font-semibold text-foreground">{conversation.name}</p>
              <p className="text-xs text-muted-foreground">
                {conversation.online ? "Online" : "Offline"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ModeToggle mode={mode} onModeChange={onModeChange} size="sm" />
            <div
              className={cn(
                "flex items-center gap-2 transition-all duration-300",
                mode === "asymmetric" ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
              )}
            >
              <span className="text-xs text-muted-foreground">Shift:</span>
              <input
                type="number"
                min={1}
                max={25}
                value={shiftKey}
                onChange={(e) => onShiftKeyChange(Number(e.target.value) || 1)}
                className="w-12 glass rounded-lg px-2 py-1 text-center text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <span
              className={cn(
                "text-xs px-2 py-1 rounded-full font-mono",
                mode === "symmetric"
                  ? "bg-primary/10 text-primary"
                  : "bg-secondary/10 text-secondary"
              )}
            >
              {mode === "symmetric" ? `SYM · Key:${shiftKey}` : "ASY · Base64"}
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1 min-h-0">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <Lock className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No messages yet. Send your first encrypted message.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-border/30" />
              <span className="text-xs text-muted-foreground px-3 py-1 glass rounded-full">
                Today
              </span>
              <div className="flex-1 h-px bg-border/30" />
            </div>
            {messages.map((msg, i) => (
              <ChatBubble key={msg.id} message={msg} index={i} />
            ))}
          </>
        )}
      </div>

      {/* Input bar */}
      <GlassCard className="rounded-2xl p-3 mt-3 shrink-0">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message to encrypt..."
            className={cn(
              "flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm py-2 px-3 rounded-xl glass focus:outline-none transition-all duration-300",
              mode === "symmetric"
                ? "focus:ring-2 focus:ring-primary/50"
                : "focus:ring-2 focus:ring-secondary/50"
            )}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className={cn(
              "p-2.5 rounded-xl transition-all duration-300 disabled:opacity-30",
              sending && "animate-pulse-scale",
              mode === "symmetric"
                ? "bg-primary/20 text-primary hover:bg-primary/30"
                : "bg-secondary/20 text-secondary hover:bg-secondary/30"
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        {inputValue && (
          <p className="text-[10px] text-muted-foreground mt-1 px-3">
            {inputValue.length} characters
          </p>
        )}
      </GlassCard>
    </div>
  );
};

export default ChatWindow;

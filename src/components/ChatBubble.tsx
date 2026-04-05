import { cn } from "@/lib/utils";
import type { Message } from "@/data/mockData";

interface ChatBubbleProps {
  message: Message;
  index: number;
}

const ChatBubble = ({ message, index }: ChatBubbleProps) => {
  if (message.type === "system") {
    return (
      <div
        className="flex justify-center my-3 animate-fade-in-up"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <span className="glass text-xs text-muted-foreground px-4 py-1.5 rounded-full">
          {message.original}
        </span>
      </div>
    );
  }

  const isSent = message.sender === "me";

  if (!isSent) {
    return (
      <div
        className="flex justify-start mb-4 animate-fade-in-up"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="max-w-[75%]">
          <span className="text-xs text-muted-foreground mb-1 block">{message.senderName}</span>
          <div
            className="glass rounded-2xl p-4"
            style={{
              boxShadow:
                message.mode === "symmetric"
                  ? "0 0 20px hsl(187 85% 43% / 0.08)"
                  : "0 0 20px hsl(270 91% 65% / 0.08)",
            }}
          >
            <p className="text-foreground">{message.decrypted}</p>
            <span className="text-xs text-muted-foreground mt-2 block text-right">{message.timestamp}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex justify-end mb-4 animate-fade-in-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div
        className={cn(
          "max-w-[75%] glass rounded-2xl overflow-hidden",
          message.mode === "symmetric" ? "border-l-2 border-l-primary" : "border-l-2 border-l-secondary"
        )}
      >
        <div className="p-4 space-y-3">
          <div>
            <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
              📝 Original
            </span>
            <p className="text-foreground text-sm">{message.original}</p>
          </div>
          <div className="border-t border-border/30" />
          <div>
            <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
              🔒 Encrypted
            </span>
            <p
              className={cn(
                "font-mono text-xs break-all",
                message.mode === "symmetric" ? "text-primary" : "text-secondary"
              )}
            >
              {message.encrypted}
            </p>
          </div>
          <div className="border-t border-border/30" />
          <div>
            <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
              🔓 Decrypted
            </span>
            <p className="text-foreground text-sm font-medium">{message.decrypted}</p>
          </div>
        </div>
        <div className="px-4 pb-3 text-right">
          <span className="text-xs text-muted-foreground">{message.timestamp}</span>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;

import { MessageSquare, Clock, Settings, LogOut, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import GlassCard from "./GlassCard";
import type { EncryptionMode } from "@/hooks/useCrypto";

export type SidebarConversationItem = {
  id: string;
  name: string;
  initials: string;
  lastMessage: string;
  timestamp: string;
  online?: boolean;
};

interface SidebarProps {
  conversations: SidebarConversationItem[];
  activeConversation: string | null;
  onConversationSelect: (id: string) => void;
  activePage: string;
  onPageChange: (page: string) => void;
  mode: EncryptionMode;
  onLogout: () => void;
  userDisplayName: string;
  userEmail: string;
  userInitials: string;
  onNewChat: () => void;
}

const navItems = [
  { id: "chats", label: "Chats", icon: MessageSquare },
  { id: "history", label: "History", icon: Clock },
  { id: "settings", label: "Settings", icon: Settings },
];

const Sidebar = ({
  conversations,
  activeConversation,
  onConversationSelect,
  activePage,
  onPageChange,
  mode,
  onLogout,
  userDisplayName,
  userEmail,
  userInitials,
  onNewChat,
}: SidebarProps) => {
  return (
    <GlassCard className="w-[220px] h-full rounded-2xl flex flex-col shrink-0">
      <div className="p-4 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-semibold text-sm">
            {userInitials}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">{userDisplayName}</p>
            <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span className="text-xs text-muted-foreground">Online</span>
        </div>
      </div>

      <div className="p-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onPageChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-300",
              activePage === item.id
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30",
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 min-h-0">
        <div className="flex items-center justify-between px-3 py-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Conversations</p>
          <button
            type="button"
            onClick={onNewChat}
            className="p-1 rounded-lg text-primary hover:bg-primary/10 transition-colors"
            aria-label="New chat"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-1">
          {conversations.map((conv, i) => (
            <button
              key={conv.id}
              type="button"
              onClick={() => {
                onConversationSelect(conv.id);
                onPageChange("chats");
              }}
              className={cn(
                "w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all duration-300 animate-slide-in-left",
                activeConversation === conv.id
                  ? "glass-strong border-l-2 border-l-primary"
                  : "hover:bg-muted/20",
              )}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-foreground">
                  {conv.initials}
                </div>
                {conv.online && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success border-2 border-background" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between items-center gap-1">
                  <span className="text-sm font-medium text-foreground truncate">{conv.name}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0">{conv.timestamp}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 border-t border-border/30 space-y-2">
        <div
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium text-center transition-all duration-500",
            mode === "symmetric"
              ? "bg-primary/10 text-primary border border-primary/20"
              : "bg-secondary/10 text-secondary border border-secondary/20",
          )}
        >
          {mode === "symmetric" ? "🔑 Symmetric" : "🔐 Asymmetric"}
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all duration-300"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </GlassCard>
  );
};

export default Sidebar;

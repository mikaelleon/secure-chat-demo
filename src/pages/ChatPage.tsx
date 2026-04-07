import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";
import EncryptionPanel from "@/components/EncryptionPanel";
import HistoryPage from "./HistoryPage";
import AnimatedBackground from "@/components/AnimatedBackground";
import type { Message as UIMessage } from "@/data/mockData";
import type { Conversation as UIConversation } from "@/data/mockData";
import type { MessageWithSender } from "@/types/database";
import { useAuthContext } from "@/context/AuthContext";
import { useConversations } from "@/hooks/useConversations";
import { useMessages } from "@/hooks/useMessages";
import { useCrypto, type EncryptionMode } from "@/hooks/useCrypto";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogEntry {
  original: string;
  encrypted: string;
  mode: EncryptionMode;
  timestamp: string;
}

function initialsFromName(name: string) {
  return (
    name
      .split(/\s+/)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

function formatSidebarTime(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function toUIMessage(
  m: MessageWithSender,
  currentUserId: string,
  decryptFn: (cipher: string, mode: EncryptionMode, shift: number) => string,
): UIMessage {
  const isSent = m.sender_id === currentUserId;
  const shift = m.shift_key ?? 3;
  const decrypted = decryptFn(m.encrypted_text, m.mode, shift);
  return {
    id: m.id,
    conversationId: m.conversation_id,
    sender: isSent ? "me" : "them",
    senderName: isSent ? "You" : m.sender?.display_name ?? "Unknown",
    encrypted: m.encrypted_text,
    decrypted,
    mode: m.mode,
    shift: m.shift_key ?? undefined,
    timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    type: "message",
  };
}

export default function ChatPage() {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuthContext();
  const { conversations, loading: convsLoading, startConversation } = useConversations();
  const { messages, loading: msgsLoading, sendMessage } = useMessages(conversationId ?? null);
  const { encrypt, decrypt } = useCrypto();

  const [activePage, setActivePage] = useState("chats");
  const [mode, setMode] = useState<EncryptionMode>("symmetric");
  const [shiftKey, setShiftKey] = useState(3);
  const [inputValue, setInputValue] = useState("");
  const [sessionLog, setSessionLog] = useState<LogEntry[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newChatEmail, setNewChatEmail] = useState("");
  const [newChatError, setNewChatError] = useState("");
  const [newChatLoading, setNewChatLoading] = useState(false);

  const userId = user?.id ?? "";

  const sidebarItems = useMemo(
    () =>
      conversations
        .filter((c): c is typeof c & { partner: NonNullable<typeof c.partner> } => !!c.partner)
        .map((c) => ({
          id: c.id,
          name: c.partner.display_name,
          initials: initialsFromName(c.partner.display_name),
          lastMessage: c.last_message ?? "No messages yet",
          timestamp: formatSidebarTime(c.last_message_at),
          online: false,
        })),
    [conversations],
  );

  const activeConvMeta = useMemo(
    () => conversations.find((c) => c.id === conversationId),
    [conversations, conversationId],
  );

  const currentConversation: UIConversation | undefined = useMemo(() => {
    if (!conversationId || !activeConvMeta?.partner) return undefined;
    const p = activeConvMeta.partner;
    return {
      id: conversationId,
      name: p.display_name,
      initials: initialsFromName(p.display_name),
      lastMessage: activeConvMeta.last_message ?? "",
      timestamp: formatSidebarTime(activeConvMeta.last_message_at),
      online: false,
    };
  }, [conversationId, activeConvMeta]);

  const uiMessages: UIMessage[] = useMemo(
    () => messages.map((m) => toUIMessage(m, userId, decrypt)),
    [messages, userId, decrypt],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handlePageChange = useCallback(
    (page: string) => {
      if (page === "settings") {
        navigate("/profile");
        return;
      }
      setActivePage(page);
    },
    [navigate],
  );

  const handleModeChange = useCallback((newMode: EncryptionMode) => {
    setMode(newMode);
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || !conversationId || !user) return;

    const original = inputValue.trim();
    const encrypted_text = encrypt(original, mode, shiftKey);
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setInputValue("");

    setSessionLog((prev) => [{ original, encrypted: encrypted_text, mode, timestamp }, ...prev]);

    const { error } = await sendMessage({
      sender_id: user.id,
      mode,
      shift_key: mode === "symmetric" ? shiftKey : null,
      encrypted_text,
    });
    if (error) {
      console.error(error);
    }
  }, [inputValue, conversationId, user, encrypt, decrypt, mode, shiftKey, sendMessage]);

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  async function handleStartConversation() {
    setNewChatError("");
    setNewChatLoading(true);
    const result = await startConversation(newChatEmail);
    setNewChatLoading(false);
    if ("error" in result) {
      setNewChatError(result.error);
      return;
    }
    setNewChatOpen(false);
    setNewChatEmail("");
    navigate(`/chat/${result.conversationId}`);
  }

  const displayName = profile?.display_name ?? user?.email ?? "User";
  const email = user?.email ?? profile?.email ?? "";
  const userInitials = initialsFromName(displayName);

  if (convsLoading && !conversations.length) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex relative overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10 flex w-full h-full p-3 gap-3">
        <Sidebar
          conversations={sidebarItems}
          activeConversation={conversationId ?? null}
          onConversationSelect={(id) => navigate(`/chat/${id}`)}
          activePage={activePage}
          onPageChange={handlePageChange}
          mode={mode}
          onLogout={() => void handleSignOut()}
          userDisplayName={displayName}
          userEmail={email}
          userInitials={userInitials}
          onNewChat={() => setNewChatOpen(true)}
        />

        {activePage === "chats" && (
          <>
            <ChatWindow
              conversation={currentConversation}
              messages={uiMessages}
              mode={mode}
              onModeChange={handleModeChange}
              shiftKey={shiftKey}
              onShiftKeyChange={setShiftKey}
              inputValue={inputValue}
              onInputChange={setInputValue}
              onSendMessage={() => void handleSendMessage()}
              bottomRef={bottomRef}
              messagesLoading={msgsLoading}
            />
            <EncryptionPanel mode={mode} shiftKey={shiftKey} inputValue={inputValue} sessionLog={sessionLog} />
          </>
        )}

        {activePage === "history" && <HistoryPage />}
      </div>

      <Dialog open={newChatOpen} onOpenChange={setNewChatOpen}>
        <DialogContent className="glass border-border/30 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New chat</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Enter the other user&apos;s email (they must be registered).</p>
            <input
              type="email"
              value={newChatEmail}
              onChange={(e) => {
                setNewChatEmail(e.target.value);
                setNewChatError("");
              }}
              placeholder="partner@example.com"
              className={cn(
                "w-full rounded-xl px-3 py-2 text-sm bg-transparent border border-border/50",
                "focus:outline-none focus:ring-2 focus:ring-primary/50",
              )}
            />
            {newChatError && <p className="text-xs text-destructive">{newChatError}</p>}
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => void handleStartConversation()}
              disabled={newChatLoading}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm disabled:opacity-50"
            >
              {newChatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Start"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

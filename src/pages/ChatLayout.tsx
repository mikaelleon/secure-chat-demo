import { useState, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";
import EncryptionPanel from "@/components/EncryptionPanel";
import HistoryPage from "./HistoryPage";
import SettingsPage from "./SettingsPage";
import AnimatedBackground from "@/components/AnimatedBackground";
import { mockConversations, mockMessages, type Message } from "@/data/mockData";
import { useCrypto, type EncryptionMode } from "@/hooks/useCrypto";

interface ChatLayoutProps {
  onLogout: () => void;
}

interface LogEntry {
  original: string;
  encrypted: string;
  mode: EncryptionMode;
  timestamp: string;
}

const ChatLayout = ({ onLogout }: ChatLayoutProps) => {
  const [activePage, setActivePage] = useState("chats");
  const [activeConversation, setActiveConversation] = useState("1");
  const [mode, setMode] = useState<EncryptionMode>("symmetric");
  const [shiftKey, setShiftKey] = useState(3);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [sessionLog, setSessionLog] = useState<LogEntry[]>([]);

  const { encrypt, decrypt } = useCrypto();

  const currentConversation = mockConversations.find((c) => c.id === activeConversation);
  const currentMessages = messages.filter((m) => m.conversationId === activeConversation);

  const handleModeChange = useCallback(
    (newMode: EncryptionMode) => {
      setMode(newMode);
      const sysMessage: Message = {
        id: `sys-${Date.now()}`,
        conversationId: activeConversation,
        sender: "me",
        senderName: "System",
        original: `Switched to ${newMode === "symmetric" ? "Symmetric" : "Asymmetric"} mode`,
        encrypted: "",
        decrypted: "",
        mode: newMode,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        type: "system",
      };
      setMessages((prev) => [...prev, sysMessage]);
    },
    [activeConversation]
  );

  const handleSendMessage = useCallback(() => {
    if (!inputValue.trim()) return;
    const encrypted_text = encrypt(inputValue, mode, shiftKey);
    const decrypted_text = decrypt(encrypted_text, mode, shiftKey);
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId: activeConversation,
      sender: "me",
      senderName: "You",
      original: inputValue,
      encrypted: encrypted_text,
      decrypted: decrypted_text,
      mode,
      shift: mode === "symmetric" ? shiftKey : undefined,
      timestamp,
      type: "message",
    };

    setMessages((prev) => [...prev, newMessage]);
    setSessionLog((prev) => [
      { original: inputValue, encrypted: encrypted_text, mode, timestamp },
      ...prev,
    ]);
    setInputValue("");
  }, [inputValue, mode, shiftKey, activeConversation, encrypt, decrypt]);

  return (
    <div className="h-screen flex relative overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10 flex w-full h-full p-3 gap-3">
        <Sidebar
          conversations={mockConversations}
          activeConversation={activeConversation}
          onConversationSelect={setActiveConversation}
          activePage={activePage}
          onPageChange={setActivePage}
          mode={mode}
          onLogout={onLogout}
        />

        {activePage === "chats" && (
          <>
            <ChatWindow
              conversation={currentConversation}
              messages={currentMessages}
              mode={mode}
              onModeChange={handleModeChange}
              shiftKey={shiftKey}
              onShiftKeyChange={setShiftKey}
              inputValue={inputValue}
              onInputChange={setInputValue}
              onSendMessage={handleSendMessage}
            />
            <EncryptionPanel
              mode={mode}
              shiftKey={shiftKey}
              inputValue={inputValue}
              sessionLog={sessionLog}
            />
          </>
        )}

        {activePage === "history" && <HistoryPage />}

        {activePage === "settings" && (
          <SettingsPage
            mode={mode}
            onModeChange={setMode}
            shiftKey={shiftKey}
            onShiftKeyChange={setShiftKey}
            onLogout={onLogout}
            onClearLog={() => setSessionLog([])}
          />
        )}
      </div>
    </div>
  );
};

export default ChatLayout;

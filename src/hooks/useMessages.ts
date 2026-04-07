import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Message, MessageWithSender, Profile } from "@/types/database";

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    setLoading(true);
    const { data } = await supabase
      .from("messages")
      .select("*, sender:profiles(id, display_name, created_at)")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    setMessages((data as MessageWithSender[]) ?? []);
    setLoading(false);
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    void fetchMessages();

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const row = payload.new as Message;
          const { data: senderRow } = await supabase.from("profiles").select("*").eq("id", row.sender_id).single();
          const sender: Profile =
            senderRow ??
            ({
              id: row.sender_id,
              display_name: "Unknown",
              email: null,
              created_at: new Date().toISOString(),
            } satisfies Profile);
          setMessages((prev) => [...prev, { ...row, sender }]);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId, fetchMessages]);

  async function sendMessage(payload: {
    sender_id: string;
    mode: "symmetric" | "asymmetric";
    shift_key: number | null;
    encrypted_text: string;
  }) {
    if (!conversationId) {
      return { data: null, error: new Error("No conversation selected") };
    }
    return supabase.from("messages").insert({
      conversation_id: conversationId,
      ...payload,
    });
  }

  return { messages, loading, sendMessage };
}

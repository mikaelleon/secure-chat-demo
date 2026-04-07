import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Message, MessageWithSender, Profile } from "@/types/database";

function sortByCreatedAt(a: MessageWithSender, b: MessageWithSender) {
  return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
}

/** Keep rows from prev that are missing from fetch (e.g. in-flight fetch older than Realtime/insert). */
function mergeMessagesFromFetch(
  fetched: MessageWithSender[],
  previous: MessageWithSender[],
): MessageWithSender[] {
  const map = new Map<string, MessageWithSender>();
  for (const m of previous) map.set(m.id, m);
  for (const m of fetched) map.set(m.id, m);
  return Array.from(map.values()).sort(sortByCreatedAt);
}

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchGeneration = useRef(0);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    const myGen = ++fetchGeneration.current;
    setLoading(true);
    const { data } = await supabase
      .from("messages")
      .select("*, sender:profiles(id, display_name, email, created_at)")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    if (myGen !== fetchGeneration.current) return;
    setMessages((prev) => mergeMessagesFromFetch((data as MessageWithSender[]) ?? [], prev));
    setLoading(false);
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) {
      fetchGeneration.current += 1;
      setMessages([]);
      setLoading(false);
      return;
    }

    setMessages([]);

    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const run = async () => {
      void fetchMessages();

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;

      if (session?.access_token) {
        await supabase.realtime.setAuth(session.access_token);
      }

      if (cancelled) return;

      // Private channel: Realtime applies RLS so each user only receives rows they may SELECT.
      // Without config.private, postgres_changes on RLS-protected tables often never deliver events.
      channel = supabase.channel(`messages_room:${conversationId}`, {
        config: { private: true },
      });

      channel.on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const row = payload.new as Message;
          const { data: senderRow } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", row.sender_id)
            .maybeSingle();
          const sender: Profile =
            senderRow ??
            ({
              id: row.sender_id,
              display_name: "Unknown",
              email: null,
              created_at: new Date().toISOString(),
            } satisfies Profile);
          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev;
            return [...prev, { ...row, sender }].sort(sortByCreatedAt);
          });
        },
      );

      channel.subscribe((status, err) => {
        if (import.meta.env.DEV && (status === "CHANNEL_ERROR" || status === "TIMED_OUT")) {
          console.warn("[useMessages] Realtime:", status, err?.message ?? err);
        }
      });
    };

    void run();

    return () => {
      cancelled = true;
      if (channel) void supabase.removeChannel(channel);
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
    const result = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        ...payload,
      })
      .select("*, sender:profiles(id, display_name, email, created_at)")
      .single();

    if (!result.error && result.data) {
      const row = result.data as MessageWithSender;
      setMessages((prev) => {
        if (prev.some((m) => m.id === row.id)) return prev;
        return [...prev, row].sort(sortByCreatedAt);
      });
    }

    return result;
  }

  return { messages, loading, sendMessage };
}

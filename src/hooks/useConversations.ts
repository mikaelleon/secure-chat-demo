import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/context/AuthContext";
import type { Profile } from "@/types/database";

export type ConversationWithPartner = {
  id: string;
  partner: Profile | null;
  last_message: string | null;
  last_message_at: string | null;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function useConversations() {
  const { user } = useAuthContext();
  const [conversations, setConversations] = useState<ConversationWithPartner[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("conversations")
      .select(
        `
        id,
        participant_one,
        participant_two,
        created_at,
        messages (
          original_text,
          created_at
        )
      `,
      )
      .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (error || !data) {
      setLoading(false);
      return;
    }

    const enriched = await Promise.all(
      data.map(async (conv) => {
        const partnerId =
          conv.participant_one === user.id ? conv.participant_two : conv.participant_one;

        const { data: partner } = await supabase.from("profiles").select("*").eq("id", partnerId).maybeSingle();

        const msgList = (conv.messages ?? []) as { original_text: string; created_at: string }[];
        const last = [...msgList].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )[0];

        return {
          id: conv.id,
          partner,
          last_message: last?.original_text ?? null,
          last_message_at: last?.created_at ?? null,
        };
      }),
    );

    setConversations(enriched);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) {
      setConversations([]);
      setLoading(false);
      return;
    }
    void fetchConversations();
  }, [user, fetchConversations]);

  async function startConversation(partnerEmail: string): Promise<
    { error: string } | { conversationId: string }
  > {
    if (!user) return { error: "Not signed in" };

    const normalized = normalizeEmail(partnerEmail);
    if (!normalized.includes("@")) return { error: "Invalid email" };
    if (user.email && normalizeEmail(user.email) === normalized) {
      return { error: "You cannot start a chat with yourself" };
    }

    const { data: partnerProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", normalized)
      .maybeSingle();

    if (profileError) return { error: profileError.message };
    if (!partnerProfile) return { error: "User not found" };

    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .or(
        `and(participant_one.eq.${user.id},participant_two.eq.${partnerProfile.id}),and(participant_one.eq.${partnerProfile.id},participant_two.eq.${user.id})`,
      )
      .maybeSingle();

    if (existing?.id) return { conversationId: existing.id };

    const { data: newConv, error } = await supabase
      .from("conversations")
      .insert({
        participant_one: user.id,
        participant_two: partnerProfile.id,
      })
      .select("id")
      .single();

    if (error || !newConv) return { error: error?.message ?? "Failed to create conversation" };
    await fetchConversations();
    return { conversationId: newConv.id };
  }

  return { conversations, loading, fetchConversations, startConversation };
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Conversation, Message } from "@/lib/types";

// A conversation row enriched with the other participant's display name and
// the latest message preview, built client-side.
export type ConversationWithMeta = Conversation & {
  other_user_id: string;
  other_name: string;
  other_avatar: string | null;
  last_message_body: string | null;
  last_message_at: string | null;
  unread_count: number;
};

export type ConversationDetail = ConversationWithMeta & {
  messages: Message[];
};

const CONV_QK = ["conversations"];

export function useConversations() {
  const qc = useQueryClient();
  const query = useQuery<ConversationWithMeta[]>({
    queryKey: CONV_QK,
    queryFn: async () => {
      // 1. Get conversation ids the user participates in
      const { data: parts, error: pErr } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id ?? "");
      if (pErr) throw pErr;
      const ids = (parts ?? []).map((p) => p.conversation_id);
      if (ids.length === 0) return [];

      // 2. Fetch conversations
      const { data: convs, error: cErr } = await supabase
        .from("conversations")
        .select("*")
        .in("id", ids)
        .order("last_message_at", { ascending: false, nullsFirst: false });
      if (cErr) throw cErr;

      // 3. For each conversation, find the other participant + their profile
      const result: ConversationWithMeta[] = [];
      for (const conv of convs ?? []) {
        const { data: otherParts } = await supabase
          .from("conversation_participants")
          .select("user_id")
          .eq("conversation_id", conv.id)
          .neq("user_id", (await supabase.auth.getUser()).data.user?.id ?? "");
        const otherId = otherParts?.[0]?.user_id ?? "";
        const { data: otherProfile } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", otherId)
          .maybeSingle();

        // latest message
        const { data: lastMsg } = await supabase
          .from("messages")
          .select("body, created_at, read_at, sender_id")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        // unread count (messages not sent by me, read_at is null)
        const { count } = await supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .is("read_at", null)
          .neq("sender_id", (await supabase.auth.getUser()).data.user?.id ?? "");

        result.push({
          ...conv,
          other_user_id: otherId,
          other_name: otherProfile?.full_name || "Unknown",
          other_avatar: otherProfile?.avatar_url ?? null,
          last_message_body: lastMsg?.body ?? null,
          last_message_at: lastMsg?.created_at ?? conv.last_message_at,
          unread_count: count ?? 0,
        });
      }
      return result;
    },
  });

  // Realtime: refresh conversation list when any message/conversation changes
  useEffect(() => {
    const channel = supabase
      .channel("conversations-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => qc.invalidateQueries({ queryKey: CONV_QK }),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        () => qc.invalidateQueries({ queryKey: CONV_QK }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  return query;
}

export function useConversationMessages(conversationId: string | null) {
  const qc = useQueryClient();
  const query = useQuery<Message[]>({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!conversationId,
  });

  // Realtime for messages in this conversation
  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => qc.invalidateQueries({ queryKey: ["messages", conversationId] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, qc]);

  return query;
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      conversationId,
      body,
    }: {
      conversationId: string;
      body: string;
    }) => {
      const { data, error } = await supabase
        .from("messages")
        .insert({ conversation_id: conversationId, body })
        .select()
        .single();
      if (error) throw error;
      // update last_message_at
      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conversationId);
      return data as Message;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["messages", vars.conversationId] });
      qc.invalidateQueries({ queryKey: CONV_QK });
    },
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (conversationId: string) => {
      const me = (await supabase.auth.getUser()).data.user?.id;
      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .neq("sender_id", me ?? "")
        .is("read_at", null);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CONV_QK });
    },
  });
}

// Start a conversation with another user (optionally about a listing).
// Returns the existing conversation id if one already exists between the two users.
export function useStartConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      otherUserId,
      listingId,
    }: {
      otherUserId: string;
      listingId?: string;
    }): Promise<string> => {
      const me = (await supabase.auth.getUser()).data.user?.id;
      if (!me) throw new Error("Not authenticated");

      // Check for existing conversation with both participants
      const { data: myParts } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", me);
      const myIds = (myParts ?? []).map((p) => p.conversation_id);
      if (myIds.length > 0) {
        const { data: otherParts } = await supabase
          .from("conversation_participants")
          .select("conversation_id")
          .eq("user_id", otherUserId)
          .in("conversation_id", myIds);
        if (otherParts && otherParts.length > 0) {
          return otherParts[0].conversation_id;
        }
      }

      // Create new conversation
      const { data: conv, error: cErr } = await supabase
        .from("conversations")
        .insert({ listing_id: listingId ?? null })
        .select()
        .single();
      if (cErr) throw cErr;

      await supabase.from("conversation_participants").insert([
        { conversation_id: conv.id, user_id: me },
        { conversation_id: conv.id, user_id: otherUserId },
      ]);

      return conv.id as string;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CONV_QK });
    },
  });
}

import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Search, Send, Paperclip, Smile, Loader2, MessageSquare } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import {
  useConversations,
  useConversationMessages,
  useSendMessage,
  useMarkRead,
  type ConversationWithMeta,
} from "@/hooks/use-messages";
import { requireAuth } from "@/lib/auth-guard";

export const Route = createFileRoute("/messages")({
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Messages · EcoLoop" },
      {
        name: "description",
        content: "Chat with verified recyclers about your listings, pickups, and offers.",
      },
      { property: "og:title", content: "Messages · EcoLoop" },
      { property: "og:description", content: "Talk directly with verified recyclers." },
    ],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  const { data: conversations, isLoading: convLoading, isError: convError, refetch } = useConversations();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized || !conversations) return conversations ?? [];
    return conversations.filter((c) => c.other_name.toLowerCase().includes(normalized));
  }, [query, conversations]);

  // Auto-select first conversation
  useEffect(() => {
    if (!activeId && filtered.length > 0) {
      setActiveId(filtered[0].id);
    }
    if (activeId && !filtered.find((c) => c.id === activeId)) {
      setActiveId(filtered[0]?.id ?? null);
    }
  }, [filtered, activeId]);

  const current = filtered.find((c) => c.id === activeId) ?? null;
  const { data: messages, isLoading: msgLoading } = useConversationMessages(activeId);
  const sendMessage = useSendMessage();
  const markRead = useMarkRead();

  // Mark read when opening a conversation
  useEffect(() => {
    if (activeId && current && current.unread_count > 0) {
      markRead.mutate(activeId);
    }
  }, [activeId, current?.unread_count]);

  const handleSend = () => {
    if (!activeId || !draft.trim()) return;
    sendMessage.mutate(
      { conversationId: activeId, body: draft.trim() },
      { onSuccess: () => setDraft("") },
    );
  };

  return (
    <AppShell title="Messages">
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="rounded-3xl border border-border bg-surface p-3">
          <div className="mb-3 flex items-center gap-2 rounded-xl bg-background px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search conversations"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          {convLoading ? (
            <div className="grid place-items-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : convError ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Failed to load conversations.
              <button onClick={() => refetch()} className="mt-2 block w-full text-primary">
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="grid place-items-center py-12 text-center text-sm text-muted-foreground">
              <MessageSquare className="mb-2 h-6 w-6" />
              No conversations yet.
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((thread: ConversationWithMeta) => {
                const isActive = thread.id === activeId;
                return (
                  <button
                    key={thread.id}
                    onClick={() => setActiveId(thread.id)}
                    className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                      isActive ? "bg-background" : "hover:bg-background/50"
                    }`}
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl gradient-eco text-sm font-bold text-black">
                      {thread.other_name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="truncate text-sm font-semibold">{thread.other_name}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {thread.last_message_at
                            ? new Date(thread.last_message_at).toLocaleDateString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </div>
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {thread.last_message_body ?? "No messages yet"}
                      </div>
                    </div>
                    {thread.unread_count > 0 && (
                      <span className="grid h-5 min-w-5 place-items-center rounded-full gradient-eco px-1.5 text-[10px] font-bold text-black">
                        {thread.unread_count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex min-h-[600px] flex-col rounded-3xl border border-border bg-surface">
          {current ? (
            <>
              <div className="flex items-center gap-3 border-b border-border p-4">
                <div className="grid h-10 w-10 place-items-center rounded-xl gradient-eco text-sm font-bold text-black">
                  {current.other_name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div>
                  <div className="text-sm font-semibold">{current.other_name}</div>
                  <div className="text-[11px] text-primary">● online</div>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto p-6">
                {msgLoading ? (
                  <div className="grid place-items-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : messages && messages.length > 0 ? (
                  messages.map((message, i) => {
                    const isMe = message.sender_id === current.other_user_id ? false : true;
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.03 * i }}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                            isMe
                              ? "gradient-eco text-black"
                              : "border border-border bg-background text-foreground"
                          }`}
                        >
                          {message.body}
                          <div className="mt-1 text-[9px] opacity-60">
                            {new Date(message.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {message.read_at && isMe && " · read"}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="grid place-items-center py-12 text-center text-sm text-muted-foreground">
                    No messages yet. Say hello!
                  </div>
                )}
              </div>

              <div className="border-t border-border p-3">
                <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2">
                  <button className="text-muted-foreground hover:text-foreground">
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Type a message…"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                  <button className="text-muted-foreground hover:text-foreground">
                    <Smile className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!draft.trim() || sendMessage.isPending}
                    className="grid h-8 w-8 place-items-center rounded-xl gradient-eco text-black disabled:opacity-50"
                  >
                    {sendMessage.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="grid min-h-[600px] place-items-center p-8 text-center text-sm text-muted-foreground">
              <div>
                <MessageSquare className="mx-auto mb-3 h-8 w-8" />
                Select a conversation to start chatting.
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

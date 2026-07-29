import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { Search, Send, Paperclip, Smile } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useMarketplace } from "@/hooks/use-marketplace";
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
  const { threads, sendMessage, markThreadRead } = useMarketplace();
  const [active, setActive] = useState(0);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");

  const filteredThreads = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return threads;
    return threads.filter((thread) => thread.vendor.toLowerCase().includes(normalized));
  }, [query, threads]);

  const safeActive = Math.min(active, Math.max(filteredThreads.length - 1, 0));
  const currentThread = filteredThreads[safeActive];

  const handleSend = () => {
    if (!currentThread) return;
    sendMessage(currentThread.id, draft);
    setDraft("");
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
          <div className="space-y-1">
            {filteredThreads.map((thread, i) => {
              const lastMessage = thread.messages[thread.messages.length - 1];
              return (
                <button
                  key={thread.id}
                  onClick={() => {
                    setActive(i);
                    markThreadRead(thread.id);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                    i === safeActive ? "bg-background" : "hover:bg-background/50"
                  }`}
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl gradient-eco text-sm font-bold text-black">
                    {thread.vendor[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="truncate text-sm font-semibold">{thread.vendor}</div>
                      <div className="text-[10px] text-muted-foreground">{lastMessage?.sentAt}</div>
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{lastMessage?.text}</div>
                  </div>
                  {thread.unread > 0 && (
                    <span className="grid h-5 min-w-5 place-items-center rounded-full gradient-eco px-1.5 text-[10px] font-bold text-black">
                      {thread.unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex min-h-[600px] flex-col rounded-3xl border border-border bg-surface">
          {currentThread ? (
            <>
              <div className="flex items-center gap-3 border-b border-border p-4">
                <div className="grid h-10 w-10 place-items-center rounded-xl gradient-eco text-sm font-bold text-black">
                  {currentThread.vendor[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold">{currentThread.vendor}</div>
                  <div className="text-[11px] text-primary">
                    ● {currentThread.online ? "online" : "offline"}
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto p-6">
                {currentThread.messages.map((message, i) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 * i }}
                    className={`flex ${message.me ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                        message.me
                          ? "gradient-eco text-black"
                          : "border border-border bg-background text-foreground"
                      }`}
                    >
                      {message.text}
                    </div>
                  </motion.div>
                ))}
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
                    className="grid h-8 w-8 place-items-center rounded-xl gradient-eco text-black"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="grid min-h-[600px] place-items-center p-8 text-center text-sm text-muted-foreground">
              No conversations found.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { Search, Send, Paperclip, Smile } from "lucide-react";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/messages")({
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

const THREADS = [
  { name: "GreenCycle Co.", last: "Pickup confirmed for 10 AM.", time: "2m", unread: 2 },
  { name: "EcoHarbor Recyclers", last: "We can offer ₹34/kg.", time: "18m" },
  { name: "MetalWorks Recycle", last: "Send a photo of the cans?", time: "1h" },
  { name: "ReNova Waste Hub", last: "Great — see you tomorrow.", time: "3h" },
  { name: "CircularOne", last: "Thanks for your listing!", time: "1d" },
];

const CHAT = [
  { me: false, text: "Hey Shreyas — saw your PET listing. We're 1.2 km away." },
  { me: false, text: "Can offer ₹30/kg, pickup today 4–6 PM. Works?" },
  { me: true, text: "Sounds great. Any chance of 4:30?" },
  { me: false, text: "Confirmed 4:30 PM. Sharing route." },
  { me: true, text: "Perfect, thanks 🌱" },
];

function MessagesPage() {
  const [active, setActive] = useState(0);

  return (
    <AppShell title="Messages">
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* Thread list */}
        <div className="rounded-3xl border border-border bg-surface p-3">
          <div className="mb-3 flex items-center gap-2 rounded-xl bg-background px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search conversations"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="space-y-1">
            {THREADS.map((t, i) => (
              <button
                key={t.name}
                onClick={() => setActive(i)}
                className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                  i === active ? "bg-background" : "hover:bg-background/50"
                }`}
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl gradient-eco text-sm font-bold text-black">
                  {t.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="truncate text-sm font-semibold">{t.name}</div>
                    <div className="text-[10px] text-muted-foreground">{t.time}</div>
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{t.last}</div>
                </div>
                {t.unread && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full gradient-eco px-1.5 text-[10px] font-bold text-black">
                    {t.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div className="flex min-h-[600px] flex-col rounded-3xl border border-border bg-surface">
          <div className="flex items-center gap-3 border-b border-border p-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl gradient-eco text-sm font-bold text-black">
              {THREADS[active].name[0]}
            </div>
            <div>
              <div className="text-sm font-semibold">{THREADS[active].name}</div>
              <div className="text-[11px] text-primary">● online</div>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-6">
            {CHAT.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i }}
                className={`flex ${m.me ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.me
                      ? "gradient-eco text-black"
                      : "border border-border bg-background text-foreground"
                  }`}
                >
                  {m.text}
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
                placeholder="Type a message…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <button className="text-muted-foreground hover:text-foreground">
                <Smile className="h-4 w-4" />
              </button>
              <button className="grid h-8 w-8 place-items-center rounded-xl gradient-eco text-black">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

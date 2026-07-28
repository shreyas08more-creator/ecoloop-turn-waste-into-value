import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { Filter, Package, Recycle } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { GradientButton, StatusBadge } from "@/components/eco-ui";

export const Route = createFileRoute("/listings")({
  head: () => ({
    meta: [
      { title: "My Listings · EcoLoop" },
      {
        name: "description",
        content:
          "Track your active recycling listings, pickups, and completed transactions in one dashboard.",
      },
      { property: "og:title", content: "My Listings · EcoLoop" },
      { property: "og:description", content: "All your listings, one dashboard." },
    ],
  }),
  component: ListingsPage,
});

type Status = "pending" | "accepted" | "completed" | "cancelled";
const LISTINGS: {
  material: string;
  weight: string;
  price: string;
  vendor: string;
  status: Status;
}[] = [
  {
    material: "PET Plastic Bottles",
    weight: "3.2 kg",
    price: "₹ 96",
    vendor: "GreenCycle Co.",
    status: "accepted",
  },
  {
    material: "Cardboard Boxes",
    weight: "8.5 kg",
    price: "₹ 128",
    vendor: "ReNova Waste Hub",
    status: "pending",
  },
  {
    material: "Aluminium Cans",
    weight: "1.1 kg",
    price: "₹ 154",
    vendor: "MetalWorks Recycle",
    status: "completed",
  },
  {
    material: "E-Waste (Laptop)",
    weight: "2.4 kg",
    price: "₹ 1,240",
    vendor: "EcoHarbor",
    status: "completed",
  },
  { material: "Mixed Paper", weight: "5.0 kg", price: "₹ 60", vendor: "—", status: "cancelled" },
  {
    material: "Glass Bottles",
    weight: "6.3 kg",
    price: "₹ 88",
    vendor: "GreenCycle Co.",
    status: "pending",
  },
];

const TABS: (Status | "all")[] = ["all", "pending", "accepted", "completed", "cancelled"];

function ListingsPage() {
  const [tab, setTab] = useState<Status | "all">("all");
  const filtered = tab === "all" ? LISTINGS : LISTINGS.filter((l) => l.status === tab);

  return (
    <AppShell title="My Listings" subtitle="6 active · 12 completed this month">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="scrollbar-hidden flex gap-1.5 overflow-x-auto rounded-2xl border border-border bg-surface p-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative rounded-xl px-4 py-2 text-xs font-semibold capitalize transition ${
                tab === t ? "text-black" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === t && (
                <motion.span
                  layoutId="listing-tab"
                  className="absolute inset-0 rounded-xl gradient-eco"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative">{t}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground">
            <Filter className="h-3.5 w-3.5" /> Filter
          </button>
          <GradientButton className="px-4 py-2 text-xs">+ New listing</GradientButton>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((l, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 * i }}
            className="card-hover overflow-hidden rounded-2xl border border-border bg-surface"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-background">
              <div className="absolute inset-0 gradient-eco opacity-25" />
              <div className="absolute inset-0 grid place-items-center text-black/40">
                <Package className="h-10 w-10" strokeWidth={1.5} />
              </div>
              <div className="absolute left-3 top-3">
                <StatusBadge status={l.status} />
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-[15px] font-semibold">{l.material}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    {l.weight} · {l.vendor}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-lg font-bold text-primary">{l.price}</div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="flex-1 rounded-lg border border-border bg-background py-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground">
                  Details
                </button>
                <button className="flex-1 rounded-lg gradient-eco py-2 text-xs font-semibold text-black">
                  Message
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="grid place-items-center rounded-3xl border border-dashed border-border bg-surface/40 p-16 text-center">
          <Recycle className="h-10 w-10 text-muted-foreground" />
          <div className="mt-4 text-sm font-semibold">No listings in this state</div>
          <div className="mt-1 text-xs text-muted-foreground">Try a different tab.</div>
        </div>
      )}
    </AppShell>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { Filter, Package, Recycle, MessageSquare, CheckCircle2, XCircle } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { GradientButton, StatusBadge } from "@/components/eco-ui";
import { useMarketplace } from "@/hooks/use-marketplace";
import { formatCurrency, formatWeight, type ListingStatus } from "@/lib/marketplace-data";

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

const TABS: (ListingStatus | "all")[] = [
  "all",
  "draft",
  "pending",
  "accepted",
  "completed",
  "cancelled",
];

function ListingsPage() {
  const { listings, updateListingStatus } = useMarketplace();
  const [tab, setTab] = useState<ListingStatus | "all">("all");
  const filtered = tab === "all" ? listings : listings.filter((listing) => listing.status === tab);

  const activeCount = listings.filter((listing) => ["pending", "accepted"].includes(listing.status)).length;
  const completedCount = listings.filter((listing) => listing.status === "completed").length;

  return (
    <AppShell title="My Listings" subtitle={`${activeCount} active · ${completedCount} completed`}>
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
          <Link to="/sell">
            <GradientButton className="px-4 py-2 text-xs">+ New listing</GradientButton>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((listing, i) => (
          <motion.div
            key={listing.id}
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
                <StatusBadge status={listing.status} />
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-[15px] font-semibold">{listing.material}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    {formatWeight(listing.weightKg)} · {listing.vendor}
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    {listing.preferredTime}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-lg font-bold text-primary">{formatCurrency(listing.price)}</div>
                </div>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <Link
                  to="/messages"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background py-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
                >
                  <MessageSquare className="h-3.5 w-3.5" /> Message
                </Link>
                {listing.status === "pending" ? (
                  <button
                    onClick={() => updateListingStatus(listing.id, "accepted")}
                    className="inline-flex items-center justify-center gap-2 rounded-lg gradient-eco py-2 text-xs font-semibold text-black"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Accept
                  </button>
                ) : listing.status === "accepted" ? (
                  <button
                    onClick={() => updateListingStatus(listing.id, "completed")}
                    className="inline-flex items-center justify-center gap-2 rounded-lg gradient-eco py-2 text-xs font-semibold text-black"
                  >
                    <Recycle className="h-3.5 w-3.5" /> Complete
                  </button>
                ) : (
                  <button
                    onClick={() => updateListingStatus(listing.id, "cancelled")}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background py-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Archive
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="grid place-items-center rounded-3xl border border-dashed border-border bg-surface/40 p-16 text-center">
          <Recycle className="h-10 w-10 text-muted-foreground" />
          <div className="mt-4 text-sm font-semibold">No listings in this state</div>
          <div className="mt-1 text-xs text-muted-foreground">Try a different tab or create a new listing.</div>
        </div>
      )}
    </AppShell>
  );
}

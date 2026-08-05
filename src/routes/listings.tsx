import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import {
  Filter,
  Package,
  Recycle,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Loader2,
  Pencil,
  Trash2,
  Archive,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { GradientButton, StatusBadge } from "@/components/eco-ui";
import { useUserListings, useUpdateListing, useDeleteListing } from "@/hooks/use-listings";
import { useStartConversation } from "@/hooks/use-messages";
import { formatCurrency, formatWeight } from "@/lib/marketplace-data";
import type { Listing, ListingStatus } from "@/lib/types";
import { requireAuth } from "@/lib/auth-guard";

export const Route = createFileRoute("/listings")({
  beforeLoad: requireAuth,
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
  const { data: listings, isLoading, isError, refetch } = useUserListings();
  const updateListing = useUpdateListing();
  const deleteListing = useDeleteListing();
  const startConversation = useStartConversation();
  const [tab, setTab] = useState<ListingStatus | "all">("all");
  const [editing, setEditing] = useState<Listing | null>(null);

  const safe = listings ?? [];
  const filtered = tab === "all" ? safe : safe.filter((l) => l.status === tab);
  const activeCount = safe.filter((l) => ["pending", "accepted"].includes(l.status)).length;
  const completedCount = safe.filter((l) => l.status === "completed").length;

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    try {
      await deleteListing.mutateAsync(id);
      toast.success("Listing deleted.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete listing.");
    }
  };

  const handleArchive = async (listing: Listing) => {
    try {
      await updateListing.mutateAsync({ id: listing.id, patch: { status: "cancelled" } });
      toast.success("Listing archived.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to archive listing.");
    }
  };

  const handleMessage = async (listing: Listing) => {
    try {
      const convId = await startConversation.mutateAsync({
        otherUserId: listing.user_id,
        listingId: listing.id,
      });
      toast.success("Conversation started.");
      // navigate to messages — we pass conversation id via router state
      window.location.hash = `#/messages?c=${convId}`;
      window.location.href = "/messages";
    } catch (err) {
      console.error(err);
      toast.error("Failed to start conversation.");
    }
  };

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

      {isLoading ? (
        <div className="grid place-items-center rounded-3xl border border-border bg-surface/40 p-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="mt-4 text-sm text-muted-foreground">Loading your listings…</div>
        </div>
      ) : isError ? (
        <div className="grid place-items-center rounded-3xl border border-dashed border-border bg-surface/40 p-16 text-center">
          <div className="text-sm font-semibold">Couldn't load listings</div>
          <button
            onClick={() => refetch()}
            className="mt-4 rounded-xl gradient-eco px-4 py-2 text-xs font-semibold text-black"
          >
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="grid place-items-center rounded-3xl border border-dashed border-border bg-surface/40 p-16 text-center">
          <Recycle className="h-10 w-10 text-muted-foreground" />
          <div className="mt-4 text-sm font-semibold">No listings in this state</div>
          <div className="mt-1 text-xs text-muted-foreground">Try a different tab or create a new listing.</div>
        </div>
      ) : (
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
                {listing.images && listing.images.length > 0 ? (
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 gradient-eco opacity-25" />
                    <div className="absolute inset-0 grid place-items-center text-black/40">
                      <Package className="h-10 w-10" strokeWidth={1.5} />
                    </div>
                  </>
                )}
                <div className="absolute left-3 top-3">
                  <StatusBadge status={listing.status} />
                </div>
                <div className="absolute right-3 top-3 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
                  {listing.views} views
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-[15px] font-semibold">{listing.title}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      {formatWeight(Number(listing.weight_kg))} · {listing.vendor || "Unassigned"}
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      {new Date(listing.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-lg font-bold text-primary">{formatCurrency(Number(listing.price))}</div>
                  </div>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <button
                    onClick={() => handleMessage(listing)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background py-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> Message
                  </button>
                  {listing.status === "pending" ? (
                    <button
                      onClick={() =>
                        updateListing.mutate({ id: listing.id, patch: { status: "accepted" } })
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-lg gradient-eco py-2 text-xs font-semibold text-black"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Accept
                    </button>
                  ) : listing.status === "accepted" ? (
                    <button
                      onClick={() =>
                        updateListing.mutate({ id: listing.id, patch: { status: "completed" } })
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-lg gradient-eco py-2 text-xs font-semibold text-black"
                    >
                      <Recycle className="h-3.5 w-3.5" /> Complete
                    </button>
                  ) : (
                    <button
                      onClick={() => handleArchive(listing)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background py-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
                    >
                      <Archive className="h-3.5 w-3.5" /> Archive
                    </button>
                  )}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setEditing(listing)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background py-1.5 text-[11px] font-medium text-muted-foreground transition hover:text-foreground"
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(listing.id)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background py-1.5 text-[11px] font-medium text-red-400 transition hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {editing && (
        <EditDialog
          listing={editing}
          onClose={() => setEditing(null)}
          onSave={async (patch) => {
            try {
              await updateListing.mutateAsync({ id: editing.id, patch });
              toast.success("Listing updated.");
              setEditing(null);
            } catch (err) {
              console.error(err);
              toast.error("Failed to update listing.");
            }
          }}
        />
      )}
    </AppShell>
  );
}

function EditDialog({
  listing,
  onClose,
  onSave,
}: {
  listing: Listing;
  onClose: () => void;
  onSave: (patch: Partial<Listing>) => void;
}) {
  const [title, setTitle] = useState(listing.title);
  const [price, setPrice] = useState(String(listing.price));
  const [weightKg, setWeightKg] = useState(String(listing.weight_kg));
  const [condition, setCondition] = useState(listing.condition);
  const [pickupLocation, setPickupLocation] = useState(listing.pickup_location);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-3xl border border-border bg-surface p-6"
      >
        <h3 className="text-lg font-bold">Edit listing</h3>
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="text-[11px] font-medium uppercase text-muted-foreground">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[11px] font-medium uppercase text-muted-foreground">Price (₹)</span>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-medium uppercase text-muted-foreground">Weight (kg)</span>
              <input
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                type="number"
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-[11px] font-medium uppercase text-muted-foreground">Condition</span>
            <input
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50"
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-medium uppercase text-muted-foreground">Pickup location</span>
            <input
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50"
            />
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              onSave({
                title,
                price: Number(price),
                weight_kg: Number(weightKg),
                condition,
                pickup_location: pickupLocation,
              })
            }
            className="rounded-xl gradient-eco px-4 py-2 text-sm font-semibold text-black"
          >
            Save
          </button>
        </div>
      </motion.div>
    </div>
  );
}

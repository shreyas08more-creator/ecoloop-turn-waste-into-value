import { useCallback, useEffect, useMemo, useState } from "react";
import {
  INITIAL_MARKETPLACE_STATE,
  MARKETPLACE_STORAGE_KEY,
  type Listing,
  type ListingStatus,
  type MarketplaceState,
  type MessageThread,
} from "@/lib/marketplace-data";

type DraftListingInput = {
  material: string;
  weightKg: number;
  condition: string;
  preferredTime: string;
  pickupAddress: string;
  source: "manual" | "scan";
  vendor?: string;
  price?: number;
};

const isClient = typeof window !== "undefined";

function readInitialState(): MarketplaceState {
  if (!isClient) return INITIAL_MARKETPLACE_STATE;

  const raw = window.localStorage.getItem(MARKETPLACE_STORAGE_KEY);
  if (!raw) return INITIAL_MARKETPLACE_STATE;

  try {
    return { ...INITIAL_MARKETPLACE_STATE, ...JSON.parse(raw) } as MarketplaceState;
  } catch {
    return INITIAL_MARKETPLACE_STATE;
  }
}

function upsertThread(threads: MessageThread[], vendor: string, seedText?: string) {
  const existing = threads.find((thread) => thread.vendor === vendor);
  if (existing) return threads;

  return [
    {
      id: `thread-${vendor.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      vendor,
      online: true,
      unread: 1,
      messages: [
        {
          id: crypto.randomUUID(),
          me: false,
          text: seedText ?? `Hi! We reviewed your listing and can help with pickup scheduling.`,
          sentAt: "Just now",
        },
      ],
    },
    ...threads,
  ];
}

export function useMarketplace() {
  const [state, setState] = useState<MarketplaceState>(readInitialState);

  useEffect(() => {
    if (!isClient) return;
    window.localStorage.setItem(MARKETPLACE_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const createListing = useCallback((input: DraftListingInput) => {
    const selectedVendor =
      input.vendor ||
      state.vendors.find((vendor: { materials: string[] }) =>
        vendor.materials.some((material: string) => input.material.toLowerCase().includes(material.toLowerCase())),
      )?.name ||
      state.vendors[0]?.name ||
      "Pending assignment";

    const selectedVendorRate =
      state.vendors.find((vendor: { name: string; pricePerKg: number }) => vendor.name === selectedVendor)
        ?.pricePerKg ?? 30;
    const computedPrice = input.price ?? Math.max(20, Math.round(input.weightKg * selectedVendorRate));

    const listing: Listing = {
      id: crypto.randomUUID(),
      material: input.material,
      weightKg: input.weightKg,
      price: computedPrice,
      vendor: selectedVendor,
      status: "pending",
      createdAt: new Date().toISOString(),
      pickupAddress: input.pickupAddress,
      preferredTime: input.preferredTime,
      condition: input.condition,
      source: input.source,
    };

    setState((current: MarketplaceState) => ({
      ...current,
      listings: [listing, ...current.listings],
      threads: upsertThread(
        current.threads,
        listing.vendor,
        `We've received your ${listing.material} listing. Want to confirm pickup for ${listing.preferredTime}?`,
      ),
      recentActivity: [
        {
          text: `Created listing for ${listing.material}`,
          when: "Just now",
          earn: `+${computedPrice}`,
        },
        ...current.recentActivity,
      ].slice(0, 8),
    }));

    return listing;
  }, [state.vendors]);

  const acceptVendorOffer = useCallback((vendorName: string) => {
    const vendor = state.vendors.find((item: { name: string }) => item.name === vendorName);
    if (!vendor) return;

    setState((current: MarketplaceState) => ({
      ...current,
      listings: current.listings.map((listing: Listing, index: number) =>
        index === 0 && listing.status === "pending"
          ? {
              ...listing,
              vendor: vendor.name,
              price: Math.max(20, Math.round(listing.weightKg * vendor.pricePerKg)),
              status: "accepted",
            }
          : listing,
      ),
      threads: upsertThread(
        current.threads,
        vendor.name,
        `Thanks for accepting our offer. We can arrange pickup ${vendor.availableToday ? "today" : "tomorrow"}.`,
      ),
      recentActivity: [
        { text: `Accepted offer from ${vendor.name}`, when: "Just now" },
        ...current.recentActivity,
      ].slice(0, 8),
    }));
  }, [state.vendors]);

  const sendMessage = useCallback((threadId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setState((current: MarketplaceState) => ({
      ...current,
      threads: current.threads.map((thread: MessageThread) =>
        thread.id === threadId
          ? {
              ...thread,
              unread: 0,
              messages: [
                ...thread.messages,
                { id: crypto.randomUUID(), me: true, text: trimmed, sentAt: "Just now" },
              ],
            }
          : thread,
      ),
    }));
  }, []);

  const markThreadRead = useCallback((threadId: string) => {
    setState((current: MarketplaceState) => ({
      ...current,
      threads: current.threads.map((thread: MessageThread) =>
        thread.id === threadId ? { ...thread, unread: 0 } : thread,
      ),
    }));
  }, []);

  const updateListingStatus = useCallback((listingId: string, status: ListingStatus) => {
    setState((current: MarketplaceState) => ({
      ...current,
      listings: current.listings.map((listing: Listing) =>
        listing.id === listingId ? { ...listing, status } : listing,
      ),
    }));
  }, []);

  const derived = useMemo(() => {
    const completedListings = state.listings.filter((listing: Listing) => listing.status === "completed");
    const acceptedListings = state.listings.filter((listing: Listing) => listing.status === "accepted");
    const pendingListings = state.listings.filter((listing: Listing) => listing.status === "pending");
    const totalWeight = state.listings.reduce((sum: number, listing: Listing) => sum + listing.weightKg, 0);
    const totalEarned = completedListings.reduce((sum: number, listing: Listing) => sum + listing.price, 0);
    const monthlyWeight = state.listings
      .slice(0, 4)
      .reduce((sum: number, listing: Listing) => sum + listing.weightKg, 0);
    const co2Saved = totalWeight * 1.45;

    return {
      completedListings,
      acceptedListings,
      pendingListings,
      totalWeight,
      totalEarned,
      monthlyWeight,
      co2Saved,
      unreadMessages: state.threads.reduce((sum: number, thread: MessageThread) => sum + thread.unread, 0),
    };
  }, [state]);

  return {
    ...state,
    ...derived,
    createListing,
    acceptVendorOffer,
    sendMessage,
    markThreadRead,
    updateListingStatus,
  };
}



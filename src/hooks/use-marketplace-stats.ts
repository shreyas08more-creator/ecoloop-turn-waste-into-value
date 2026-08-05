import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Listing } from "@/lib/types";

export type MarketplaceStats = {
  listings: Listing[];
  totalWeight: number;
  totalEarned: number;
  monthlyWeight: number;
  co2Saved: number;
  pendingCount: number;
  completedCount: number;
  acceptedCount: number;
};

export function useMarketplaceStats() {
  return useQuery<MarketplaceStats>({
    queryKey: ["marketplace-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const listings = (data ?? []) as Listing[];

      const completed = listings.filter((l) => l.status === "completed");
      const pending = listings.filter((l) => l.status === "pending");
      const accepted = listings.filter((l) => l.status === "accepted");
      const totalWeight = listings.reduce((s, l) => s + Number(l.weight_kg), 0);
      const totalEarned = completed.reduce((s, l) => s + Number(l.price), 0);

      const now = new Date();
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      const monthlyWeight = listings
        .filter((l) => new Date(l.created_at) >= monthAgo)
        .reduce((s, l) => s + Number(l.weight_kg), 0);

      return {
        listings,
        totalWeight,
        totalEarned,
        monthlyWeight,
        co2Saved: totalWeight * 1.45,
        pendingCount: pending.length,
        completedCount: completed.length,
        acceptedCount: accepted.length,
      };
    },
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Listing, ListingStatus } from "@/lib/types";

const QK = ["listings"];

export function useListings() {
  const qc = useQueryClient();
  return useQuery<Listing[]>({
    queryKey: QK,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Listing[];
    },
  });
}

export function useUserListings() {
  const qc = useQueryClient();
  return useQuery<Listing[]>({
    queryKey: ["my-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Listing[];
    },
  });
}

export type CreateListingInput = {
  title: string;
  description: string;
  material: string;
  category: string;
  weight_kg: number;
  condition: string;
  images: string[];
  price: number;
  pickup_location: string;
  status?: ListingStatus;
  vendor?: string;
  source?: "manual" | "scan";
};

export function useCreateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateListingInput) => {
      const { data, error } = await supabase
        .from("listings")
        .insert({
          title: input.title,
          description: input.description,
          material: input.material,
          category: input.category,
          weight_kg: input.weight_kg,
          condition: input.condition,
          images: input.images,
          price: input.price,
          pickup_location: input.pickup_location,
          status: input.status ?? "pending",
          vendor: input.vendor ?? "",
          source: input.source ?? "manual",
        })
        .select()
        .single();
      if (error) throw error;

      // Award green score points for creating a listing
      await supabase.rpc("add_score_event", {
        p_event_type: "listing_created",
        p_points: 10,
        p_description: `Created listing: ${input.title}`,
      });

      return data as Listing;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK });
      qc.invalidateQueries({ queryKey: ["my-listings"] });
      qc.invalidateQueries({ queryKey: ["green-score"] });
      qc.invalidateQueries({ queryKey: ["score-events"] });
    },
  });
}

export function useUpdateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: Partial<Listing>;
    }) => {
      const { data, error } = await supabase
        .from("listings")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;

      // If listing completed, award points
      if (patch.status === "completed") {
        await supabase.rpc("add_score_event", {
          p_event_type: "listing_completed",
          p_points: 25,
          p_description: `Completed listing: ${data.title}`,
        });
      }

      return data as Listing;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK });
      qc.invalidateQueries({ queryKey: ["my-listings"] });
      qc.invalidateQueries({ queryKey: ["green-score"] });
      qc.invalidateQueries({ queryKey: ["score-events"] });
    },
  });
}

export function useDeleteListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("listings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK });
      qc.invalidateQueries({ queryKey: ["my-listings"] });
    },
  });
}

export function useIncrementViews() {
  return useMutation({
    mutationFn: async (id: string) => {
      await supabase.rpc("increment_listing_views", { listing_uuid: id });
    },
  });
}

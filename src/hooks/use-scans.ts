import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { AiScan } from "@/lib/types";

const QK = ["ai-scans"];

export function useScans() {
  return useQuery<AiScan[]>({
    queryKey: QK,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_scans")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as AiScan[];
    },
  });
}

export type CreateScanInput = {
  image_url: string;
  detected_material: string;
  confidence: number;
  recyclable: boolean;
  instructions: string;
  category: string;
  estimated_value: number;
  co2_saved_kg: number;
  energy_saved_wh: number;
};

export function useCreateScan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateScanInput) => {
      const { data, error } = await supabase
        .from("ai_scans")
        .insert(input)
        .select()
        .single();
      if (error) throw error;

      await supabase.rpc("add_score_event", {
        p_event_type: "ai_scan",
        p_points: 5,
        p_description: `AI scan: ${input.detected_material}`,
      });

      return data as AiScan;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK });
      qc.invalidateQueries({ queryKey: ["green-score"] });
      qc.invalidateQueries({ queryKey: ["score-events"] });
    },
  });
}

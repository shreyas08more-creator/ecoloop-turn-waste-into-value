import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { GreenScore, ScoreEvent, Achievement } from "@/lib/types";

export function useGreenScore() {
  return useQuery<GreenScore | null>({
    queryKey: ["green-score"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("green_scores")
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return data as GreenScore | null;
    },
  });
}

export function useScoreEvents() {
  return useQuery<ScoreEvent[]>({
    queryKey: ["score-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("score_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data as ScoreEvent[];
    },
  });
}

export function useAchievements() {
  return useQuery<Achievement[]>({
    queryKey: ["achievements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .order("unlocked_at", { ascending: false });
      if (error) throw error;
      return data as Achievement[];
    },
  });
}

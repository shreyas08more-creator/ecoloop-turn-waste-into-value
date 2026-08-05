import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/types";

const QK = ["profile"];

export function useProfile() {
  return useQuery<Profile | null>({
    queryKey: QK,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });
}

export type UpdateProfileInput = Partial<
  Pick<
    Profile,
    | "full_name"
    | "phone"
    | "address"
    | "company"
    | "bio"
    | "avatar_url"
    | "tier"
  >
>;

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateProfileInput) => {
      const { data, error } = await supabase
        .from("profiles")
        .update({ ...input, updated_at: new Date().toISOString() })
        .select()
        .single();
      if (error) throw error;
      return data as Profile;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK });
    },
  });
}

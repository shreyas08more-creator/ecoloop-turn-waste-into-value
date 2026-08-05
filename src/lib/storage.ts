import { supabase } from "@/lib/supabase";

export type BucketName = "listing-images" | "scan-images" | "avatars";

// Upload a file to a Supabase Storage bucket under a path prefixed by the user id.
// Returns the public URL of the uploaded object.
export async function uploadFile(
  bucket: BucketName,
  file: File,
  userId: string,
): Promise<{ url: string; path: string } | null> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });

  if (error) {
    console.error("upload error", error);
    return null;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

export async function deleteFile(bucket: BucketName, path: string): Promise<boolean> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  return !error;
}

// Extract the storage path from a public URL (for deletion).
export function pathFromUrl(bucket: BucketName, url: string): string | null {
  const marker = `/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length).split("?")[0];
}

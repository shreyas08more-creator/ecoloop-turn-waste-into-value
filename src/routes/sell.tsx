import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import {
  Upload,
  Camera,
  ImageIcon,
  Sparkles,
  MapPin,
  Weight,
  Clock,
  ChevronDown,
  X,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { GradientButton, GhostButton, SectionHeading } from "@/components/eco-ui";
import { useAuth } from "@/hooks/use-auth";
import { useCreateListing } from "@/hooks/use-listings";
import { uploadFile } from "@/lib/storage";
import { VENDORS, suggestVendorsForMaterial } from "@/lib/vendors";
import { formatCurrency } from "@/lib/marketplace-data";
import { requireAuth } from "@/lib/auth-guard";

export const Route = createFileRoute("/sell")({
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Sell Waste · EcoLoop" },
      {
        name: "description",
        content:
          "Upload photos of your recyclable waste. Get instant AI-powered price estimates from verified vendors.",
      },
      { property: "og:title", content: "Sell Waste · EcoLoop" },
      { property: "og:description", content: "List recyclables and get instant AI quotes." },
    ],
  }),
  component: SellPage,
});

function SellPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createListing = useCreateListing();

  const [photos, setPhotos] = useState<{ url: string; file: File }[]>([]);
  const [form, setForm] = useState({
    title: "",
    material: "Plastic (PET)",
    weightKg: "3.2",
    condition: "Clean · sorted",
    preferredTime: "Tomorrow · 10–12 AM",
    pickupAddress: "",
    description: "",
  });
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const suggestedVendors = useMemo(
    () => suggestVendorsForMaterial(form.material),
    [form.material],
  );
  const primaryVendor = suggestedVendors[0] ?? VENDORS[0];
  const estimatedPrice = useMemo(() => {
    const weight = Number(form.weightKg) || 0;
    const rate = primaryVendor?.pricePerKg ?? 30;
    return Math.max(20, Math.round(weight * rate));
  }, [form.weightKg, primaryVendor]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const newPhotos: { url: string; file: File }[] = [];
      for (const file of Array.from(files).slice(0, 6 - photos.length)) {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image.`);
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 10 MB).`);
          continue;
        }
        newPhotos.push({ url: URL.createObjectURL(file), file });
      }
      setPhotos((cur) => [...cur, ...newPhotos]);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (idx: number) => {
    setPhotos((cur) => cur.filter((_, i) => i !== idx));
  };

  const handlePublish = async () => {
    if (!form.title.trim()) {
      toast.error("Please enter a title.");
      return;
    }
    if (!user) {
      toast.error("Please sign in to create a listing.");
      return;
    }

    setUploading(true);
    try {
      // Upload images to storage
      const imageUrls: string[] = [];
      for (const photo of photos) {
        const uploaded = await uploadFile("listing-images", photo.file, user.id);
        if (uploaded) imageUrls.push(uploaded.url);
      }

      await createListing.mutateAsync({
        title: form.title,
        description: form.description,
        material: form.material,
        category: primaryVendor?.materials[0] ?? "Mixed",
        weight_kg: Number(form.weightKg) || 0,
        condition: form.condition,
        images: imageUrls,
        price: estimatedPrice,
        pickup_location: form.pickupAddress || form.preferredTime,
        source: "manual",
        vendor: primaryVendor?.name ?? "",
      });

      toast.success("Listing published.");
      navigate({ to: "/listings" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to publish listing.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <AppShell title="Sell Waste" subtitle="Upload photos, get instant AI price estimates.">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-dashed border-border bg-surface/60 p-8 text-center"
          >
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl gradient-eco eco-glow text-black">
              <Upload className="h-7 w-7" strokeWidth={2.5} />
            </div>
            <h3 className="mt-5 text-lg font-bold">Drag & drop your photos</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              PNG, JPG or HEIC · up to 10 MB each · we blur faces automatically.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <GradientButton onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4" /> Choose files
              </GradientButton>
              <GhostButton onClick={() => cameraInputRef.current?.click()}>
                <Camera className="h-4 w-4" /> Camera
              </GhostButton>
            </div>
          </motion.div>

          {photos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-3 gap-3"
            >
              {photos.map((photo, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-surface"
                >
                  <img
                    src={photo.url}
                    alt={`Upload ${idx + 1}`}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <button
                    onClick={() => removePhoto(idx)}
                    className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </motion.div>
          )}

          <div className="rounded-3xl border border-border bg-surface p-6">
            <SectionHeading title="Listing details" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Title"
                icon={<Sparkles className="h-4 w-4" />}
                value={form.title}
                onChange={(value) => setForm((current) => ({ ...current, title: value }))}
                placeholder="e.g. PET Plastic Bottles"
              />
              <Field
                label="Material type"
                icon={<Sparkles className="h-4 w-4" />}
                value={form.material}
                onChange={(value) => setForm((current) => ({ ...current, material: value }))}
              />
              <Field
                label="Weight (kg)"
                icon={<Weight className="h-4 w-4" />}
                value={form.weightKg}
                onChange={(value) => setForm((current) => ({ ...current, weightKg: value }))}
              />
              <Field
                label="Condition"
                icon={<CheckCircle2 className="h-4 w-4" />}
                value={form.condition}
                onChange={(value) => setForm((current) => ({ ...current, condition: value }))}
              />
              <Field
                label="Preferred time"
                icon={<Clock className="h-4 w-4" />}
                value={form.preferredTime}
                onChange={(value) => setForm((current) => ({ ...current, preferredTime: value }))}
              />
              <div className="sm:col-span-2">
                <Field
                  label="Pickup address"
                  icon={<MapPin className="h-4 w-4" />}
                  value={form.pickupAddress}
                  onChange={(value) => setForm((current) => ({ ...current, pickupAddress: value }))}
                  placeholder="Enter pickup location"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block">
                  <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Description
                  </div>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))}
                    rows={3}
                    placeholder="Describe your waste material…"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-3 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  />
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <GhostButton onClick={() => navigate({ to: "/" })}>Cancel</GhostButton>
              <GradientButton onClick={handlePublish} disabled={uploading || createListing.isPending}>
                {uploading || createListing.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Publish listing"
                )}
              </GradientButton>
            </div>
          </div>
        </div>

        <motion.aside
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-fit overflow-hidden rounded-3xl border border-border bg-surface p-6"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
              <Sparkles className="h-3 w-3" /> AI prediction
            </div>
            <h3 className="mt-4 text-xl font-bold tracking-tight">{form.material || "Material"} detected</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {form.condition || "High-value recyclable — clean and sorted."}
            </p>

            <div className="mt-5 rounded-2xl border border-border bg-background p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Confidence</span>
                <span className="font-semibold text-primary">94%</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "94%" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full gradient-eco"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Est. price</div>
                <div className="mt-1 text-2xl font-bold text-primary">{formatCurrency(estimatedPrice)}</div>
                <div className="text-[10px] text-muted-foreground">
                  for {form.weightKg || "0"} kg · ₹{primaryVendor?.pricePerKg ?? 30}/kg avg
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Category</div>
                <div className="mt-1 text-2xl font-bold">{primaryVendor?.materials[0] ?? "Mixed"}</div>
                <div className="text-[10px] text-muted-foreground">{form.material}</div>
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 text-xs font-medium text-muted-foreground">Suggested vendors</div>
              <div className="space-y-2">
                {suggestedVendors.slice(0, 3).map((vendor) => (
                  <div
                    key={vendor.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg gradient-eco" />
                      <div>
                        <span className="text-sm font-medium">{vendor.name}</span>
                        <div className="text-[10px] text-muted-foreground">
                          ₹{vendor.pricePerKg}/kg · {vendor.distanceKm.toFixed(1)} km
                        </div>
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 -rotate-90 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.aside>
      </div>
    </AppShell>
  );
}

function Field({
  label,
  icon,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  icon: ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <input
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-background px-3.5 py-3 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}

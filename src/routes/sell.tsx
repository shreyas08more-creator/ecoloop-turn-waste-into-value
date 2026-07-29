import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useMemo, useState, type ChangeEvent, type ReactNode } from "react";
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
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { GradientButton, GhostButton, SectionHeading } from "@/components/eco-ui";
import { useMarketplace } from "@/hooks/use-marketplace";
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
  const { vendors, createListing } = useMarketplace();
  const [uploaded, setUploaded] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [form, setForm] = useState({
    material: "Plastic (PET)",
    weightKg: "3.2",
    condition: "Clean · sorted",
    preferredTime: "Tomorrow · 10–12 AM",
    pickupAddress: "12 Marine Drive, Mumbai 400020",
  });

  const primaryVendor = vendors[0];
  const estimatedPrice = useMemo(() => {
    const weight = Number(form.weightKg) || 0;
    const rate = primaryVendor?.pricePerKg ?? 30;
    return Math.max(20, Math.round(weight * rate));
  }, [form.weightKg, primaryVendor]);

  const handleUpload = () => {
    setUploaded(true);
    setPhotos((current) =>
      current.length > 0
        ? current
        : ["Front view", "Label close-up", "Sorted batch"],
    );
  };

  const handlePublish = () => {
    const listing = createListing({
      material: form.material,
      weightKg: Number(form.weightKg) || 0,
      condition: form.condition,
      preferredTime: form.preferredTime,
      pickupAddress: form.pickupAddress,
      source: "manual",
      price: estimatedPrice,
      vendor: primaryVendor?.name,
    });

    navigate({ to: "/listings" });
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
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <GradientButton onClick={handleUpload}>
                <Upload className="h-4 w-4" /> Choose files
              </GradientButton>
              <GhostButton onClick={handleUpload}>
                <Camera className="h-4 w-4" /> Camera
              </GhostButton>
              <GhostButton onClick={handleUpload}>
                <ImageIcon className="h-4 w-4" /> Gallery
              </GhostButton>
            </div>
          </motion.div>

          {uploaded && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-3 gap-3"
            >
              {photos.map((label) => (
                <div
                  key={label}
                  className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-surface"
                >
                  <div className="absolute inset-0 gradient-eco opacity-30" />
                  <div className="absolute inset-0 grid place-items-center text-center text-black/60">
                    <div>
                      <ImageIcon className="mx-auto h-8 w-8" />
                      <div className="mt-2 text-xs font-medium">{label}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setPhotos((current) => current.filter((item) => item !== label))}
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
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <GhostButton onClick={() => setUploaded(false)}>Save draft</GhostButton>
              <GradientButton onClick={handlePublish}>Publish listing</GradientButton>
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
            <h3 className="mt-4 text-xl font-bold tracking-tight">{form.material} detected</h3>
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
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Est. price
                </div>
                <div className="mt-1 text-2xl font-bold text-primary">{formatCurrency(estimatedPrice)}</div>
                <div className="text-[10px] text-muted-foreground">
                  for {form.weightKg || "0"} kg · ₹{primaryVendor?.pricePerKg ?? 30}/kg avg
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Category
                </div>
                <div className="mt-1 text-2xl font-bold">Type-1</div>
                <div className="text-[10px] text-muted-foreground">Plastic bottles</div>
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 text-xs font-medium text-muted-foreground">Suggested vendors</div>
              <div className="space-y-2">
                {vendors.slice(0, 3).map((vendor) => (
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
}: {
  label: string;
  icon: ReactNode;
  value: string;
  onChange: (value: string) => void;
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
        className="w-full rounded-xl border border-border bg-background px-3.5 py-3 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}

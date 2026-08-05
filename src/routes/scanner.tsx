import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useRef, useState, type ReactNode } from "react";
import {
  Camera,
  ScanLine,
  Sparkles,
  Zap,
  Leaf,
  ArrowRight,
  Recycle,
  CheckCircle2,
  Loader2,
  Upload,
  ImageIcon,
  X,
  History,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { GradientButton } from "@/components/eco-ui";
import { useAuth } from "@/hooks/use-auth";
import { useCreateScan, useScans } from "@/hooks/use-scans";
import { useCreateListing } from "@/hooks/use-listings";
import { uploadFile } from "@/lib/storage";
import { predictMaterial, type ScanPrediction } from "@/lib/ai-scanner";
import { suggestVendorsForMaterial } from "@/lib/vendors";
import { formatCurrency } from "@/lib/marketplace-data";
import { requireAuth } from "@/lib/auth-guard";

export const Route = createFileRoute("/scanner")({
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "AI Scanner · EcoLoop" },
      {
        name: "description",
        content:
          "Point your camera at any waste. Our AI identifies the material and estimates its value in seconds.",
      },
      { property: "og:title", content: "AI Scanner · EcoLoop" },
      { property: "og:description", content: "Point, scan, sell — instantly." },
    ],
  }),
  component: ScannerPage,
});

function ScannerPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createScan = useCreateScan();
  const createListing = useCreateListing();
  const { data: scans } = useScans();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanPrediction | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const suggestedVendors = result
    ? suggestVendorsForMaterial(result.material)
    : [];

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10 MB.");
      return;
    }

    // preview
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setUploading(true);
    setScanning(true);

    try {
      // 1. Upload to storage
      const uploaded =
        user && (await uploadFile("scan-images", file, user.id));
      if (!uploaded) {
        toast.error("Failed to upload image. Please try again.");
        setUploading(false);
        setScanning(false);
        return;
      }

      // 2. Run prediction (placeholder AI)
      const prediction = predictMaterial(file);
      setResult(prediction);

      // 3. Save scan to Supabase
      await createScan.mutateAsync({
        image_url: uploaded.url,
        detected_material: prediction.material,
        confidence: prediction.confidence,
        recyclable: prediction.recyclable,
        instructions: prediction.instructions,
        category: prediction.category,
        estimated_value: prediction.estimatedValue,
        co2_saved_kg: prediction.co2SavedKg,
        energy_saved_wh: prediction.energySavedWh,
      });

      toast.success("Scan complete — material identified.");
    } catch (err) {
      console.error(err);
      toast.error("Scan failed. Please try again.");
    } finally {
      setUploading(false);
      setScanning(false);
    }
  };

  const handleCreateListing = async () => {
    if (!result) return;
    try {
      await createListing.mutateAsync({
        title: result.material,
        description: `Scanned via AI · ${result.category}`,
        material: result.material,
        category: result.category,
        weight_kg: 1,
        condition: "Scanned via AI",
        images: previewUrl ? [previewUrl] : [],
        price: result.estimatedValue,
        pickup_location: "",
        source: "scan",
        vendor: suggestedVendors[0]?.name ?? "",
      });
      toast.success("Listing created from scan.");
      navigate({ to: "/listings" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to create listing.");
    }
  };

  return (
    <AppShell title="AI Scanner" subtitle="Point, scan, sell — in under a second.">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-border bg-surface"
        >
          <div className="relative aspect-[4/5] w-full sm:aspect-video">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Scan preview"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black" />
            )}

            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-3xl border-2 border-primary/60">
                <span className="absolute -left-1 -top-1 h-4 w-4 border-l-2 border-t-2 border-primary" />
                <span className="absolute -right-1 -top-1 h-4 w-4 border-r-2 border-t-2 border-primary" />
                <span className="absolute -bottom-1 -left-1 h-4 w-4 border-b-2 border-l-2 border-primary" />
                <span className="absolute -bottom-1 -right-1 h-4 w-4 border-b-2 border-r-2 border-primary" />
                {scanning && (
                  <motion.div
                    initial={{ y: 0 }}
                    animate={{ y: 240 }}
                    transition={{
                      duration: 1.6,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut",
                    }}
                    className="absolute left-3 right-3 h-0.5 rounded-full gradient-eco shadow-[0_0_20px_var(--primary)]"
                  />
                )}
              </div>
            </div>

            <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3 py-1 text-[11px] text-white/80 backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              {scanning ? "Analyzing…" : previewUrl ? "Ready" : "Live · idle"}
            </div>

            {previewUrl && !scanning && (
              <button
                onClick={() => {
                  setPreviewUrl(null);
                  setResult(null);
                }}
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            <div className="absolute inset-x-0 bottom-6 flex items-center justify-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                  e.target.value = "";
                }}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                  e.target.value = "";
                }}
              />
              <button
                onClick={() => cameraInputRef.current?.click()}
                disabled={scanning}
                className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-white backdrop-blur transition hover:bg-white/20 disabled:opacity-50"
              >
                <Camera className="h-5 w-5" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={scanning}
                className="group relative grid h-20 w-20 place-items-center rounded-full gradient-eco eco-glow text-black transition hover:scale-105 disabled:opacity-50"
              >
                {scanning ? (
                  <Loader2 className="h-8 w-8 animate-spin" strokeWidth={2.5} />
                ) : (
                  <ScanLine className="h-8 w-8" strokeWidth={2.5} />
                )}
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={scanning}
                className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-white backdrop-blur transition hover:bg-white/20 disabled:opacity-50"
              >
                <ImageIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          key={result ? "on" : "off"}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          {scanning && !result ? (
            <div className="grid h-full min-h-[340px] place-items-center rounded-3xl border border-border bg-surface/50 p-8 text-center">
              <div>
                <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
                <div className="mt-4 text-lg font-semibold">Analyzing image…</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Detecting material, recyclability, and estimated value.
                </p>
              </div>
            </div>
          ) : !result ? (
            <div className="grid h-full min-h-[340px] place-items-center rounded-3xl border border-dashed border-border bg-surface/50 p-8 text-center">
              <div>
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-background text-primary">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div className="mt-4 text-lg font-semibold">Ready when you are</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload or capture an image to scan. Results appear here.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <GradientButton onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4" /> Upload
                  </GradientButton>
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface/60 px-5 py-3 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:bg-surface"
                  >
                    <Camera className="h-4 w-4" /> Camera
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-3xl border border-border bg-surface p-6 eco-glow">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
                      <CheckCircle2 className="h-3 w-3" /> Match found
                    </div>
                    <h3 className="mt-3 text-2xl font-bold tracking-tight">
                      {result.material}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Category · {result.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase text-muted-foreground">
                      Confidence
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {result.confidence}%
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <MiniStat
                    icon={<Recycle className="h-4 w-4" />}
                    label="Est. value"
                    value={formatCurrency(result.estimatedValue)}
                  />
                  <MiniStat
                    icon={<Leaf className="h-4 w-4" />}
                    label="CO₂ saved"
                    value={`${result.co2SavedKg} kg`}
                  />
                  <MiniStat
                    icon={<Zap className="h-4 w-4" />}
                    label="Energy saved"
                    value={`${result.energySavedWh} Wh`}
                  />
                </div>

                <div className="mt-4 rounded-2xl border border-border bg-background p-4">
                  <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Recycling instructions
                  </div>
                  <p className="mt-1 text-sm">{result.instructions}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-surface p-6">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm font-semibold">Recommended vendors</div>
                  <span className="text-[11px] text-muted-foreground">
                    Sorted by price
                  </span>
                </div>
                <div className="space-y-2">
                  {suggestedVendors.map((vendor) => (
                    <div
                      key={vendor.id}
                      className="flex items-center justify-between rounded-2xl border border-border bg-background p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-xl gradient-eco text-black">
                          <Recycle className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{vendor.name}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {vendor.distanceKm.toFixed(1)} km
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-bold text-primary">
                          ₹ {vendor.pricePerKg}/kg
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
                <GradientButton
                  onClick={handleCreateListing}
                  disabled={createListing.isPending}
                  className="mt-4 w-full"
                >
                  {createListing.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Create listing from scan"
                  )}
                </GradientButton>
              </div>

              <button
                onClick={() => setShowHistory((s) => !s)}
                className="flex w-full items-center gap-2 rounded-2xl border border-border bg-surface p-4 text-left text-sm font-semibold transition hover:bg-surface/60"
              >
                <History className="h-4 w-4 text-primary" />
                Scan history
                <span className="ml-auto text-xs text-muted-foreground">
                  {scans?.length ?? 0} scans
                </span>
              </button>

              {showHistory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-2"
                >
                  {scans && scans.length > 0 ? (
                    scans.map((scan) => (
                      <div
                        key={scan.id}
                        className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3"
                      >
                        {scan.image_url ? (
                          <img
                            src={scan.image_url}
                            alt={scan.detected_material}
                            className="h-12 w-12 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="grid h-12 w-12 place-items-center rounded-xl bg-background text-muted-foreground">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold">
                            {scan.detected_material}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {new Date(scan.created_at).toLocaleDateString()} ·{" "}
                            {scan.confidence}% confidence
                          </div>
                        </div>
                        <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                          {scan.recyclable ? "Recyclable" : "Non-recyclable"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border bg-surface/40 p-6 text-center text-sm text-muted-foreground">
                      No scans yet. Scan an item to get started.
                    </div>
                  )}
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </AppShell>
  );
}

function MiniStat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">{icon}</div>
      <div className="mt-2 text-lg font-bold">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}

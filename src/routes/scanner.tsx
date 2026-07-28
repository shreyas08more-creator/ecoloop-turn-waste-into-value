import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import {
  Camera,
  ScanLine,
  Sparkles,
  Zap,
  Leaf,
  ArrowRight,
  Recycle,
  CheckCircle2,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { GradientButton } from "@/components/eco-ui";

export const Route = createFileRoute("/scanner")({
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
  const [scanned, setScanned] = useState(false);

  return (
    <AppShell title="AI Scanner" subtitle="Point, scan, sell — in under a second.">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* Camera */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-border bg-surface"
        >
          <div className="relative aspect-[4/5] w-full sm:aspect-video">
            <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black" />
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-3xl border-2 border-primary/60">
                <span className="absolute -left-1 -top-1 h-4 w-4 border-l-2 border-t-2 border-primary" />
                <span className="absolute -right-1 -top-1 h-4 w-4 border-r-2 border-t-2 border-primary" />
                <span className="absolute -bottom-1 -left-1 h-4 w-4 border-b-2 border-l-2 border-primary" />
                <span className="absolute -bottom-1 -right-1 h-4 w-4 border-b-2 border-r-2 border-primary" />
                {!scanned && (
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
              Live · analyzing
            </div>

            <div className="absolute inset-x-0 bottom-6 flex items-center justify-center gap-4">
              <button className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-white backdrop-blur hover:bg-white/20">
                <Camera className="h-5 w-5" />
              </button>
              <button
                onClick={() => setScanned(true)}
                className="group relative grid h-20 w-20 place-items-center rounded-full gradient-eco eco-glow text-black transition hover:scale-105"
              >
                <ScanLine className="h-8 w-8" strokeWidth={2.5} />
              </button>
              <button className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-white backdrop-blur hover:bg-white/20">
                <Zap className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Result */}
        <motion.div
          key={scanned ? "on" : "off"}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          {!scanned ? (
            <div className="grid h-full min-h-[340px] place-items-center rounded-3xl border border-dashed border-border bg-surface/50 p-8 text-center">
              <div>
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-background text-primary">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div className="mt-4 text-lg font-semibold">Ready when you are</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tap the green button to scan. Results appear here.
                </p>
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
                    <h3 className="mt-3 text-2xl font-bold tracking-tight">Aluminium Can</h3>
                    <p className="text-xs text-muted-foreground">Category · Non-ferrous metal</p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase text-muted-foreground">Confidence</div>
                    <div className="text-2xl font-bold text-primary">97%</div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <MiniStat
                    icon={<Recycle className="h-4 w-4" />}
                    label="Est. value"
                    value="₹ 12"
                  />
                  <MiniStat icon={<Leaf className="h-4 w-4" />} label="CO₂ saved" value="0.9 kg" />
                  <MiniStat icon={<Zap className="h-4 w-4" />} label="Energy saved" value="14 Wh" />
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-surface p-6">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm font-semibold">Recommended vendors</div>
                  <span className="text-[11px] text-muted-foreground">Sorted by price</span>
                </div>
                <div className="space-y-2">
                  {[
                    { n: "MetalWorks Recycle", p: "₹ 14/pc", d: "1.4 km" },
                    { n: "GreenCycle Co.", p: "₹ 12/pc", d: "1.2 km" },
                    { n: "EcoHarbor", p: "₹ 11/pc", d: "2.4 km" },
                  ].map((v) => (
                    <div
                      key={v.n}
                      className="flex items-center justify-between rounded-2xl border border-border bg-background p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-xl gradient-eco text-black">
                          <Recycle className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{v.n}</div>
                          <div className="text-[11px] text-muted-foreground">{v.d}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-bold text-primary">{v.p}</div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
                <GradientButton className="mt-4 w-full">Create listing from scan</GradientButton>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AppShell>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">{icon}</div>
      <div className="mt-2 text-lg font-bold">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}

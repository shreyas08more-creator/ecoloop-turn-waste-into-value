import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Recycle,
  ScanLine,
  MapPin,
  Calculator,
  Truck,
  Sparkles,
  ArrowRight,
  Star,
  BadgeCheck,
  Leaf,
  TrendingUp,
  Coins,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { GradientButton, GhostButton, SectionHeading, StatCard } from "@/components/eco-ui";
import heroImg from "@/assets/hero-recycle.png";
import { useMarketplace } from "@/hooks/use-marketplace";
import { formatCurrency, formatWeight } from "@/lib/marketplace-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EcoLoop — Home" },
      {
        name: "description",
        content:
          "Your AI recycling dashboard. Scan waste, get instant price estimates, book pickups with verified vendors.",
      },
      { property: "og:title", content: "EcoLoop — Home" },
      { property: "og:description", content: "AI-powered circular economy marketplace." },
    ],
  }),
  component: HomePage,
});

const QUICK_ACTIONS = [
  { icon: Recycle, title: "Sell Waste", desc: "List recyclables in seconds", to: "/sell" },
  { icon: ScanLine, title: "AI Scanner", desc: "Identify material with camera", to: "/scanner" },
  { icon: MapPin, title: "Nearby Vendors", desc: "Verified recyclers near you", to: "/listings" },
  { icon: Calculator, title: "Estimate Price", desc: "Instant AI-powered quotes", to: "/scanner" },
  { icon: Truck, title: "Pickup Requests", desc: "Track scheduled pickups", to: "/listings" },
  { icon: Leaf, title: "Environmental Impact", desc: "See your CO₂ savings", to: "/profile" },
] as const;

function HomePage() {
  const {
    profile,
    vendors,
    monthlyWeight,
    totalEarned,
    co2Saved,
    totalWeight,
    acceptVendorOffer,
    pendingListings,
  } = useMarketplace();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <AppShell>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="text-xs font-medium uppercase tracking-[0.14em] text-primary/80">{today}</div>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          Hello {profile.name.split(" ")[0]} <span className="inline-block">👋</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          You've recycled {formatWeight(monthlyWeight)} this cycle. Keep the loop turning.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative overflow-hidden rounded-3xl border border-border bg-surface p-8 sm:p-10 lg:p-12"
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-secondary/15 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
              <Sparkles className="h-3 w-3" /> AI-powered marketplace
            </div>
            <h2 className="mt-4 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Recycle smarter,
              <br />
              <span className="text-gradient-eco">earn more.</span>
            </h2>
            <p className="mt-4 max-w-md text-sm text-muted-foreground sm:text-base">
              Our AI finds the best-priced verified recycler near you — book a pickup in under 30
              seconds.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/sell">
                <GradientButton>
                  <Truck className="h-4 w-4" /> Schedule Pickup
                </GradientButton>
              </Link>
              <Link to="/scanner">
                <GhostButton>
                  <ScanLine className="h-4 w-4" /> Scan Waste
                </GhostButton>
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-border pt-6">
              {[
                { k: formatWeight(monthlyWeight), v: "Recycled" },
                { k: formatCurrency(totalEarned), v: "Earned" },
                { k: `${Math.round(co2Saved)} kg`, v: "CO₂ saved" },
              ].map((stat) => (
                <div key={stat.v}>
                  <div className="text-lg font-bold sm:text-xl">{stat.k}</div>
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{stat.v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-sm">
            <div className="absolute inset-6 rounded-full bg-primary/10 blur-2xl" />
            <img
              src={heroImg}
              alt="Modern recycling illustration"
              className="relative h-full w-full object-contain drop-shadow-[0_20px_40px_rgba(74,222,128,0.35)]"
            />
          </div>
        </div>
      </motion.div>

      <div className="mt-10">
        <SectionHeading eyebrow="Shortcuts" title="Quick actions" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {QUICK_ACTIONS.map(({ icon: Icon, title, desc, to }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * i }}
            >
              <Link
                to={to}
                className="card-hover group flex h-full flex-col justify-between rounded-2xl border border-border bg-surface p-4"
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-background text-primary transition group-hover:bg-primary group-hover:text-black">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                </div>
                <div className="mt-6">
                  <div className="text-sm font-semibold">{title}</div>
                  <div className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{desc}</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Coins className="h-5 w-5" />}
          label="Lifetime earnings"
          value={formatCurrency(totalEarned)}
          delta={`+${pendingListings.length} pending`}
          accent
        />
        <StatCard
          icon={<Recycle className="h-5 w-5" />}
          label="Waste recycled"
          value={formatWeight(totalWeight)}
          delta="Live"
        />
        <StatCard
          icon={<Leaf className="h-5 w-5" />}
          label="CO₂ saved"
          value={`${Math.round(co2Saved)} kg`}
          delta="Estimated"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Verified vendors"
          value={`${vendors.filter((vendor) => vendor.verified).length}`}
          delta="Nearby"
        />
      </div>

      <div className="mt-10">
        <SectionHeading
          eyebrow="Marketplace"
          title="Nearby vendors"
          action={
            <Link
              to="/listings"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vendors.slice(0, 3).map((vendor, i) => (
            <motion.div
              key={vendor.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i }}
              className="card-hover rounded-2xl border border-border bg-surface p-5"
            >
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl gradient-eco text-black">
                  <Recycle className="h-5 w-5" strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <div className="truncate text-[15px] font-semibold">{vendor.name}</div>
                    {vendor.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {vendor.rating}
                    </span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-0.5">
                      <MapPin className="h-3 w-3" />
                      {vendor.distanceKm.toFixed(1)} km
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-[11px] text-muted-foreground">{vendor.materials.join(", ")}</div>

              <div className="mt-4 flex items-end justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Est. price</div>
                  <div className="text-xl font-bold">₹ {vendor.pricePerKg}/kg</div>
                </div>
                {vendor.availableToday && (
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    Pickup today
                  </span>
                )}
              </div>

              <button
                onClick={() => acceptVendorOffer(vendor.name)}
                className="mt-4 w-full rounded-xl gradient-eco py-2.5 text-sm font-semibold text-black transition hover:-translate-y-0.5"
              >
                Accept offer
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

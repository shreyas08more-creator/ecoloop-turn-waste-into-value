import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Award,
  Settings,
  Recycle,
  Leaf,
  Coins,
  TreeDeciduous,
  TrendingUp,
  Trophy,
  Zap,
  Target,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, Tooltip, Bar, BarChart } from "recharts";
import { AppShell } from "@/components/app-shell";
import { StatCard, SectionHeading } from "@/components/eco-ui";
import { useMarketplace } from "@/hooks/use-marketplace";
import { formatCurrency, formatWeight } from "@/lib/marketplace-data";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile · EcoLoop" },
      {
        name: "description",
        content:
          "Your Green Score, lifetime earnings, achievements, and environmental impact — all in one place.",
      },
      { property: "og:title", content: "Profile · EcoLoop" },
      { property: "og:description", content: "Your impact, achievements, and earnings." },
    ],
  }),
  component: ProfilePage,
});

const MONTHLY = [
  { m: "Jun", v: 8 },
  { m: "Jul", v: 12 },
  { m: "Aug", v: 10 },
  { m: "Sep", v: 18 },
  { m: "Oct", v: 22 },
  { m: "Nov", v: 28 },
];

const CATEGORY = [
  { c: "Plastic", v: 42 },
  { c: "Paper", v: 34 },
  { c: "Metal", v: 22 },
  { c: "Glass", v: 18 },
  { c: "E-Waste", v: 12 },
];

const ACHIEVEMENTS = [
  { icon: Trophy, name: "First Pickup", desc: "Completed your first sale" },
  { icon: Leaf, name: "Green Guardian", desc: "100 kg recycled" },
  { icon: Zap, name: "Speed Seller", desc: "10 pickups in a week" },
  { icon: Target, name: "Consistent", desc: "12-week streak" },
];

function ProfilePage() {
  const { profile, totalEarned, totalWeight, co2Saved, recentActivity, completedListings } = useMarketplace();

  return (
    <AppShell title="Profile">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 sm:p-8"
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-6">
          <div className="relative">
            <div className="grid h-20 w-20 place-items-center rounded-3xl gradient-eco eco-glow text-3xl font-black text-black">
              {profile.name.charAt(0)}
            </div>
            <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full border-2 border-surface bg-primary text-black">
              <Award className="h-3 w-3" strokeWidth={3} />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight">{profile.name}</h2>
              <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                {profile.tier}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Member since {profile.memberSince} · {profile.location}
            </p>
            <div className="mt-3 flex items-center gap-4">
              <div>
                <div className="text-[10px] uppercase text-muted-foreground">Green Score</div>
                <div className="text-2xl font-bold text-primary">{profile.greenScore}</div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <div className="text-[10px] uppercase text-muted-foreground">Rank</div>
                <div className="text-2xl font-bold">#{profile.rank}</div>
              </div>
            </div>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
            <Settings className="h-4 w-4" /> Settings
          </button>
        </div>
      </motion.div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Coins className="h-5 w-5" />}
          label="Lifetime earnings"
          value={formatCurrency(totalEarned)}
          delta={`+${completedListings.length} completed`}
          accent
        />
        <StatCard
          icon={<Recycle className="h-5 w-5" />}
          label="Waste recycled"
          value={formatWeight(totalWeight)}
          delta="Tracked"
        />
        <StatCard
          icon={<Leaf className="h-5 w-5" />}
          label="CO₂ saved"
          value={`${Math.round(co2Saved)} kg`}
          delta="Estimated"
        />
        <StatCard
          icon={<TreeDeciduous className="h-5 w-5" />}
          label="Trees saved"
          value={`${profile.treesSaved}`}
          delta="Growing"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-border bg-surface p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Monthly progress</div>
              <div className="text-xl font-bold">28 kg recycled in November</div>
            </div>
            <div className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] text-primary">
              <TrendingUp className="h-3 w-3" /> +27%
            </div>
          </div>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4ADE80" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#4ADE80" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" stroke="#71717A" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#18181B",
                    border: "1px solid #27272A",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#A1A1AA" }}
                />
                <Area type="monotone" dataKey="v" stroke="#4ADE80" strokeWidth={2.5} fill="url(#grad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-3xl border border-border bg-surface p-6">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">By category</div>
          <div className="text-xl font-bold">Material mix</div>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CATEGORY}>
                <XAxis dataKey="c" stroke="#71717A" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#18181B",
                    border: "1px solid #27272A",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="v" fill="#22C55E" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <SectionHeading eyebrow="Milestones" title="Achievements" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ACHIEVEMENTS.map(({ icon: Icon, name, desc }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * i }}
              className="card-hover rounded-2xl border border-border bg-surface p-5"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl gradient-eco text-black">
                <Icon className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <div className="mt-4 text-sm font-semibold">{name}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">{desc}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <SectionHeading title="Recent activity" />
        <div className="rounded-3xl border border-border bg-surface p-2">
          {recentActivity.map((activity, i) => (
            <div
              key={`${activity.text}-${i}`}
              className="flex items-center justify-between gap-4 rounded-2xl p-4 transition hover:bg-background/60"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-background text-primary">
                  <Recycle className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm">{activity.text}</div>
                  <div className="text-[11px] text-muted-foreground">{activity.when}</div>
                </div>
              </div>
              {activity.earn && <div className="shrink-0 text-sm font-bold text-primary">{activity.earn}</div>}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

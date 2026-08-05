import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useRef, useState } from "react";
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
  Loader2,
  Camera,
  Save,
  BadgeCheck,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, Tooltip, Bar, BarChart } from "recharts";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { StatCard, SectionHeading } from "@/components/eco-ui";
import { useAuth } from "@/hooks/use-auth";
import { useProfile, useUpdateProfile } from "@/hooks/use-profile";
import { useGreenScore, useScoreEvents, useAchievements } from "@/hooks/use-green-score";
import { useMarketplaceStats } from "@/hooks/use-marketplace-stats";
import { uploadFile } from "@/lib/storage";
import { formatCurrency, formatWeight } from "@/lib/marketplace-data";
import { requireAuth } from "@/lib/auth-guard";

export const Route = createFileRoute("/profile")({
  beforeLoad: requireAuth,
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

const ACHIEVEMENT_ICONS: Record<string, typeof Trophy> = {
  Trophy,
  Leaf,
  Zap,
  Target,
};

function ProfilePage() {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading, isError: profileError, refetch } = useProfile();
  const { data: greenScore } = useGreenScore();
  const { data: scoreEvents } = useScoreEvents();
  const { data: achievements } = useAchievements();
  const { data: stats } = useMarketplaceStats();
  const updateProfile = useUpdateProfile();

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    phone: "",
    address: "",
    company: "",
    bio: "",
  });
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const totalEarned = stats?.totalEarned ?? 0;
  const totalWeight = stats?.totalWeight ?? 0;
  const co2Saved = stats?.co2Saved ?? 0;
  const completedCount = stats?.completedCount ?? 0;

  const monthlyData = (scoreEvents ?? []).slice(0, 6).reverse().map((e, i) => ({
    m: new Date(e.created_at).toLocaleDateString([], { month: "short" }),
    v: e.points + i * 3,
  }));

  const categoryData = [
    { c: "Plastic", v: 42 },
    { c: "Paper", v: 34 },
    { c: "Metal", v: 22 },
    { c: "Glass", v: 18 },
    { c: "E-Waste", v: 12 },
  ];

  const handleStartEdit = () => {
    setEditForm({
      full_name: profile?.full_name ?? "",
      phone: profile?.phone ?? "",
      address: profile?.address ?? "",
      company: profile?.company ?? "",
      bio: profile?.bio ?? "",
    });
    setEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync(editForm);
      toast.success("Profile updated.");
      setEditing(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile.");
    }
  };

  const handleAvatar = async (file: File) => {
    if (!user) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image.");
      return;
    }
    setAvatarUploading(true);
    try {
      const uploaded = await uploadFile("avatars", file, user.id);
      if (!uploaded) {
        toast.error("Upload failed.");
        return;
      }
      await updateProfile.mutateAsync({ avatar_url: uploaded.url });
      toast.success("Profile photo updated.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update photo.");
    } finally {
      setAvatarUploading(false);
    }
  };

  if (profileLoading) {
    return (
      <AppShell title="Profile">
        <div className="grid place-items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  if (profileError || !profile) {
    return (
      <AppShell title="Profile">
        <div className="grid place-items-center rounded-3xl border border-dashed border-border bg-surface/40 p-16 text-center">
          <div className="text-sm font-semibold">Couldn't load profile</div>
          <button
            onClick={() => refetch()}
            className="mt-4 rounded-xl gradient-eco px-4 py-2 text-xs font-semibold text-black"
          >
            Retry
          </button>
        </div>
      </AppShell>
    );
  }

  const displayName = profile.full_name || user?.email?.split("@")[0] || "Recycler";
  const memberSince = new Date(profile.member_since).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

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
            <button onClick={() => avatarInputRef.current?.click()} className="relative block">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={displayName}
                  className="h-20 w-20 rounded-3xl object-cover eco-glow"
                />
              ) : (
                <div className="grid h-20 w-20 place-items-center rounded-3xl gradient-eco eco-glow text-3xl font-black text-black">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full border-2 border-surface bg-primary text-black">
                {avatarUploading ? (
                  <Loader2 className="h-3 w-3 animate-spin" strokeWidth={3} />
                ) : (
                  <Camera className="h-3 w-3" strokeWidth={3} />
                )}
              </span>
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleAvatar(file);
                event.target.value = "";
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight">{displayName}</h2>
              <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                {profile.tier}
              </span>
              {profile.verification_status === "verified" && (
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  <BadgeCheck className="h-3 w-3" /> Verified
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Member since {memberSince} · {profile.address || "Location not set"}
            </p>
            {profile.bio && <p className="mt-2 text-sm text-muted-foreground">{profile.bio}</p>}
            <div className="mt-3 flex items-center gap-4">
              <div>
                <div className="text-[10px] uppercase text-muted-foreground">Green Score</div>
                <div className="text-2xl font-bold text-primary">{greenScore?.score ?? 0}</div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <div className="text-[10px] uppercase text-muted-foreground">Rank</div>
                <div className="text-2xl font-bold">#{greenScore?.rank ?? 0}</div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <div className="text-[10px] uppercase text-muted-foreground">Trees saved</div>
                <div className="text-2xl font-bold">{greenScore?.trees_saved ?? 0}</div>
              </div>
            </div>
          </div>
          <button
            onClick={handleStartEdit}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            <Settings className="h-4 w-4" /> Edit Profile
          </button>
        </div>
      </motion.div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Coins className="h-5 w-5" />}
          label="Lifetime earnings"
          value={formatCurrency(totalEarned)}
          delta={`+${completedCount} completed`}
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
          value={`${greenScore?.trees_saved ?? 0}`}
          delta="Growing"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-border bg-surface p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Monthly progress</div>
              <div className="text-xl font-bold">{greenScore?.monthly_change ?? 0} pts this month</div>
            </div>
            <div className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] text-primary">
              <TrendingUp className="h-3 w-3" /> +{greenScore?.weekly_change ?? 0} this week
            </div>
          </div>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4ADE80" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#4ADE80" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" stroke="#71717A" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "#18181B", border: "1px solid #27272A", borderRadius: 12, fontSize: 12 }}
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
              <BarChart data={categoryData}>
                <XAxis dataKey="c" stroke="#71717A" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "#18181B", border: "1px solid #27272A", borderRadius: 12, fontSize: 12 }}
                />
                <Bar dataKey="v" fill="#22C55E" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <SectionHeading eyebrow="Milestones" title="Achievements" />
        {achievements && achievements.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {achievements.map((ach, i) => {
              const Icon = ACHIEVEMENT_ICONS[ach.icon] ?? Trophy;
              return (
                <motion.div
                  key={ach.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.03 * i }}
                  className="card-hover rounded-2xl border border-border bg-surface p-5"
                >
                  <div className="grid h-11 w-11 place-items-center rounded-xl gradient-eco text-black">
                    <Icon className="h-5 w-5" strokeWidth={2.5} />
                  </div>
                  <div className="mt-4 text-sm font-semibold">{ach.name}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">{ach.description}</div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border bg-surface/40 p-10 text-center text-sm text-muted-foreground">
            No achievements unlocked yet. Keep recycling to earn badges!
          </div>
        )}
      </div>

      <div className="mt-8">
        <SectionHeading title="Recent activity" />
        <div className="rounded-3xl border border-border bg-surface p-2">
          {scoreEvents && scoreEvents.length > 0 ? (
            scoreEvents.map((event, i) => (
              <div
                key={event.id}
                className="flex items-center justify-between gap-4 rounded-2xl p-4 transition hover:bg-background/60"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-background text-primary">
                    <Recycle className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm">{event.description}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {new Date(event.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="shrink-0 text-sm font-bold text-primary">
                  +{event.points}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No recent activity. Start scanning and listing to earn points!
            </div>
          )}
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-3xl border border-border bg-surface p-6"
          >
            <h3 className="text-lg font-bold">Edit profile</h3>
            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="text-[11px] font-medium uppercase text-muted-foreground">Full name</span>
                <input
                  value={editForm.full_name}
                  onChange={(event) => setEditForm((current) => ({ ...current, full_name: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-medium uppercase text-muted-foreground">Phone</span>
                <input
                  value={editForm.phone}
                  onChange={(event) => setEditForm((current) => ({ ...current, phone: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-medium uppercase text-muted-foreground">Address</span>
                <input
                  value={editForm.address}
                  onChange={(event) => setEditForm((current) => ({ ...current, address: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-medium uppercase text-muted-foreground">Company</span>
                <input
                  value={editForm.company}
                  onChange={(event) => setEditForm((current) => ({ ...current, company: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-medium uppercase text-muted-foreground">Bio</span>
                <textarea
                  value={editForm.bio}
                  onChange={(event) => setEditForm((current) => ({ ...current, bio: event.target.value }))}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50"
                />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setEditing(false)}
                className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={updateProfile.isPending}
                className="inline-flex items-center gap-2 rounded-xl gradient-eco px-4 py-2 text-sm font-semibold text-black"
              >
                {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AppShell>
  );
}

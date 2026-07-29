import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Home,
  Recycle,
  ScanLine,
  Package,
  MessageSquare,
  User,
  Bell,
  Leaf,
  Search,
  Truck,
  Coins,
  BadgeCheck,
  CheckCheck,
  LogOut,
  ChevronDown,
  Menu,
  LayoutDashboard,
} from "lucide-react";
import { motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/hooks/use-auth";

type Notif = {
  id: string;
  icon: typeof Bell;
  title: string;
  desc: string;
  time: string;
  unread?: boolean;
  tone?: "eco" | "info" | "warn";
};

const INITIAL_NOTIFS: Notif[] = [
  {
    id: "n1",
    icon: Truck,
    title: "Pickup confirmed",
    desc: "GreenCycle Co. arrives tomorrow, 10:30 AM.",
    time: "2m ago",
    unread: true,
    tone: "eco",
  },
  {
    id: "n2",
    icon: Coins,
    title: "Payout received",
    desc: "₹ 340 credited for 8.2 kg plastic.",
    time: "1h ago",
    unread: true,
    tone: "eco",
  },
  {
    id: "n3",
    icon: BadgeCheck,
    title: "New verified vendor nearby",
    desc: "EcoHarbor Recyclers — 2.4 km away.",
    time: "5h ago",
    unread: true,
    tone: "info",
  },
  {
    id: "n4",
    icon: MessageSquare,
    title: "Message from ReNova Waste Hub",
    desc: '"Can we reschedule to Friday?"',
    time: "Yesterday",
    tone: "info",
  },
];

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/sell", label: "Sell Waste", icon: Recycle },
  { to: "/scanner", label: "AI Scanner", icon: ScanLine },
  { to: "/listings", label: "My Listings", icon: Package },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function AppShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { user, signOut, displayName } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = async () => {
    const { error } = await signOut();

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Logged out successfully.");
    setShowUserMenu(false);
    setShowMobileMenu(false);
    navigate({ to: "/login", search: {} });
  };

  const initials = (displayName || "U").charAt(0).toUpperCase();

  return (
    <div className="min-h-dvh w-full bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-border bg-background/60 backdrop-blur-xl lg:flex">
        <div className="flex items-center gap-2.5 px-6 pb-8 pt-7">
          <div className="grid h-9 w-9 place-items-center rounded-xl gradient-eco eco-glow">
            <Leaf className="h-5 w-5 text-black" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-[15px] font-bold tracking-tight">EcoLoop</div>
            <div className="-mt-0.5 text-[11px] text-muted-foreground">Turn Waste Into Value</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-surface text-foreground"
                    : "text-muted-foreground hover:bg-surface/60 hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="m-3 rounded-2xl border border-border bg-surface/60 p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Leaf className="h-3.5 w-3.5 text-primary" />
            Green Score
          </div>
          <div className="mt-1 text-2xl font-bold tracking-tight">842</div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-background">
            <div className="h-full w-[68%] rounded-full gradient-eco" />
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">158 pts to Platinum</div>
        </div>

        <div className="m-3 mt-0 space-y-2">
          <Link
            to="/"
            className="flex w-full items-center gap-2.5 rounded-xl border border-border bg-surface/60 px-3 py-2.5 text-sm font-medium text-foreground transition hover:border-primary/30"
          >
            <LayoutDashboard className="h-[18px] w-[18px]" strokeWidth={2} />
            <span>Dashboard</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-[18px] w-[18px]" strokeWidth={2} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-20 border-b border-border/60 bg-background/70 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-10">
            <div className="lg:hidden">
              <Popover open={showMobileMenu} onOpenChange={setShowMobileMenu}>
                <PopoverTrigger asChild>
                  <button className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-surface/60 text-muted-foreground transition hover:text-foreground">
                    <Menu className="h-5 w-5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" sideOffset={10} className="w-64 rounded-2xl border-border bg-surface p-2">
                  <div className="mb-2 px-3 py-2">
                    <div className="text-sm font-semibold">EcoLoop</div>
                    <div className="text-[11px] text-muted-foreground">Turn Waste Into Value</div>
                  </div>
                  <div className="space-y-1">
                    {NAV.map(({ to, label, icon: Icon }) => {
                      const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
                      return (
                        <Link
                          key={to}
                          to={to}
                          onClick={() => setShowMobileMenu(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                            active
                              ? "bg-background text-foreground"
                              : "text-muted-foreground hover:bg-background/70 hover:text-foreground",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{label}</span>
                        </Link>
                      );
                    })}
                    <div className="my-2 border-t border-border" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive transition hover:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log out</span>
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="min-w-0 flex-1">
              {title ? (
                <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">{title}</h1>
              ) : (
                <div className="hidden items-center gap-2 rounded-xl border border-border bg-surface/60 px-3 py-2 md:flex md:max-w-md">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    placeholder="Search materials, vendors, listings…"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                  <kbd className="hidden rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground md:inline">
                    ⌘K
                  </kbd>
                </div>
              )}
              {subtitle ? <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p> : null}
            </div>

            <NotificationsBell />

            {user ? (
              <Popover open={showUserMenu} onOpenChange={setShowUserMenu}>
                <PopoverTrigger asChild>
                  <button className="flex shrink-0 items-center gap-2 rounded-xl border border-border bg-surface/60 py-1 pl-1 pr-3 transition hover:border-primary/30">
                    <div className="grid h-8 w-8 place-items-center rounded-lg gradient-eco text-sm font-bold text-black">
                      {initials}
                    </div>
                    <div className="hidden text-left sm:block">
                      <div className="text-xs font-semibold leading-tight">{displayName}</div>
                      <div className="max-w-[120px] truncate text-[10px] leading-tight text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                    <ChevronDown className="hidden h-3 w-3 text-muted-foreground sm:block" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" sideOffset={8} className="w-56 rounded-xl border-border bg-surface p-2">
                  <div className="mb-1 border-b border-border px-3 py-2">
                    <div className="truncate text-sm font-semibold">{displayName}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{user.email}</div>
                  </div>
                  <Link
                    to="/"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground transition hover:bg-background"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground transition hover:bg-background"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive transition hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </PopoverContent>
              </Popover>
            ) : (
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  to="/login"
                  search={{}}
                  className="rounded-xl border border-border bg-surface/60 px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/30 hover:bg-surface"
                >
                  Login
                </Link>
                <Link
                  to="/login"
                  search={{ mode: "signup" } as never}
                  className="rounded-xl gradient-eco px-4 py-2 text-sm font-semibold text-black transition hover:-translate-y-0.5"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-10">
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/85 backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-6">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                <span className="truncate">{label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function NotificationsBell() {
  const [notifs, setNotifs] = useState<Notif[]>(INITIAL_NOTIFS);
  const unread = notifs.filter((notif) => notif.unread).length;

  const markAll = () => setNotifs((prev) => prev.map((notif) => ({ ...notif, unread: false })));
  const markOne = (id: string) =>
    setNotifs((prev) => prev.map((notif) => (notif.id === id ? { ...notif, unread: false } : notif)));

  const toneClass = (tone?: Notif["tone"]) =>
    tone === "eco"
      ? "bg-primary/15 text-primary"
      : tone === "warn"
        ? "bg-amber-500/15 text-amber-400"
        : "bg-surface text-foreground";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
          className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-surface/60 text-muted-foreground transition hover:text-foreground"
        >
          <Bell className="h-[18px] w-[18px]" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full gradient-eco px-1 text-[9px] font-bold text-black ring-2 ring-background">
              {unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[min(92vw,380px)] rounded-2xl border-border bg-surface p-0"
      >
        <div className="flex items-center justify-between px-4 pb-3 pt-4">
          <div>
            <div className="text-sm font-semibold">Notifications</div>
            <div className="text-[11px] text-muted-foreground">
              {unread > 0 ? `${unread} new update${unread > 1 ? "s" : ""}` : "You're all caught up"}
            </div>
          </div>
          <button
            onClick={markAll}
            disabled={unread === 0}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-primary transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:text-muted-foreground disabled:hover:bg-transparent"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </button>
        </div>
        <div className="max-h-[380px] overflow-y-auto border-t border-border">
          {notifs.map((notif) => {
            const Icon = notif.icon;
            return (
              <button
                key={notif.id}
                onClick={() => markOne(notif.id)}
                className={cn(
                  "flex w-full items-start gap-3 border-b border-border/60 px-4 py-3 text-left transition last:border-b-0 hover:bg-background/40",
                  notif.unread && "bg-primary/[0.04]",
                )}
              >
                <div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", toneClass(notif.tone))}>
                  <Icon className="h-4 w-4" strokeWidth={2.2} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="truncate text-[13px] font-semibold">{notif.title}</div>
                    {notif.unread && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                  </div>
                  <div className="mt-0.5 line-clamp-2 text-[11.5px] text-muted-foreground">{notif.desc}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground/70">{notif.time}</div>
                </div>
              </button>
            );
          })}
        </div>
        <div className="border-t border-border px-4 py-2.5">
          <button className="w-full rounded-lg py-1.5 text-center text-[11.5px] font-medium text-muted-foreground transition hover:text-foreground">
            View all activity
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

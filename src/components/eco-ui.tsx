import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <div className="mb-1 text-[11px] font-medium uppercase tracking-[0.14em] text-primary/80">
            {eyebrow}
          </div>
        )}
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  icon,
  label,
  value,
  delta,
  accent,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  delta?: string;
  accent?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(
        "card-hover rounded-2xl border border-border bg-surface p-5",
        accent && "eco-glow",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-background text-primary">
          {icon}
        </div>
        {delta && (
          <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
            {delta}
          </span>
        )}
      </div>
      <div className="mt-4 text-2xl font-bold tracking-tight">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </motion.div>
  );
}

export function GradientButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl gradient-eco px-5 py-3 text-sm font-semibold text-black transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-16px_rgba(74,222,128,0.55)] active:translate-y-0",
        className,
      )}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}

export function GhostButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface/60 px-5 py-3 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:bg-surface",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function StatusBadge({ status }: { status: "pending" | "accepted" | "completed" | "cancelled" }) {
  const map = {
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    accepted: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    completed: "bg-primary/15 text-primary border-primary/30",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/30",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize",
        map[status],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

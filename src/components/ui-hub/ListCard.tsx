import { Link } from "@tanstack/react-router";
import { ChevronRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type BaseProps = {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  trailing?: ReactNode;
  to: string;
  params?: Record<string, string>;
};

export function ListCard({
  title,
  subtitle,
  icon: Icon,
  iconColor,
  trailing,
  ...link
}: BaseProps) {
  return (
    <Link
      to={link.to as never}
      params={link.params as never}
      className="tap group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-4 hover:bg-[var(--color-surface-2)]"
    >
      {Icon ? (
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
          style={{ backgroundColor: (iconColor ?? "var(--color-primary)") + "22", color: iconColor ?? "var(--color-primary)" }}
        >
          <Icon className="h-5 w-5" />
        </span>
      ) : (
        <span />
      )}
      <span className="min-w-0">
        <span className="block truncate text-base font-semibold">{title}</span>
        {subtitle ? (
          <span className="mt-0.5 block truncate text-sm text-muted-foreground">{subtitle}</span>
        ) : null}
      </span>
      <span className="flex shrink-0 items-center gap-2 text-muted-foreground">
        {trailing}
        <ChevronRight className="h-5 w-5" />
      </span>
    </Link>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-2 mt-6 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </h2>
  );
}

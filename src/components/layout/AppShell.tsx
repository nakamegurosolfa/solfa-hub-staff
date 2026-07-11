import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Search, Star, User } from "lucide-react";
import type { ReactNode } from "react";

type Tab = { to: string; label: string; icon: typeof Home; exact?: boolean };
const tabs: Tab[] = [
  { to: "/", label: "ホーム", icon: Home, exact: true },
  { to: "/search", label: "検索", icon: Search },
  { to: "/favorites", label: "お気に入り", icon: Star },
  { to: "/me", label: "マイページ", icon: User },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-xl pb-28 pt-safe">
        <div className="animate-[fade-in_0.35s_ease-out] px-5 pt-6">{children}</div>
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/85 backdrop-blur-xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="mx-auto flex max-w-xl items-stretch justify-between px-2 py-1.5">
          {tabs.map(({ to, label, icon: Icon, exact }) => {
            const active = exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");
            return (
              <li key={to} className="flex-1">
                <Link
                  to={to}
                  className="tap flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium"
                  style={{ color: active ? "var(--color-primary)" : "var(--color-muted-foreground)" }}
                >
                  <Icon className="h-6 w-6" strokeWidth={active ? 2.4 : 2} />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  version,
  action,
}: {
  title: string;
  subtitle?: string;
  version?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-6 flex items-end justify-between gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-baseline gap-3">
          <h1 className="min-w-0 truncate text-[34px] font-bold leading-tight tracking-tight">{title}</h1>
          {version ? (
            <span className="shrink-0 pb-1 text-[11px] font-normal leading-none text-muted-foreground/60">
              {version}
            </span>
          ) : null}
        </div>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

export function BackLink({ to, label = "Back" }: { to: string; label?: string }) {
  return (
    <Link
      to={to}
      className="tap mb-4 inline-flex items-center gap-1 text-sm font-medium text-primary"
    >
      <span aria-hidden>‹</span> {label}
    </Link>
  );
}

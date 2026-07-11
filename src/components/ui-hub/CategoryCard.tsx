import { Link, useRouteContext } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { EmployeeOnlyBadge } from "@/components/auth/PasswordGateScreen";

type CategoryCardProps = {
  to: string;
  params?: Record<string, string>;
  search?: Record<string, string | undefined>;
  emoji: string;
  title: string;
  description: string;
  color: string;
  employeeOnly?: boolean;
};

export function CategoryCard({
  to,
  params,
  search,
  emoji,
  title,
  description,
  color,
  employeeOnly = false,
}: CategoryCardProps) {
  const { auth } = useRouteContext({ from: "__root__" });
  const needsEmployeeAuth = employeeOnly && !auth.employeeAuthenticated;
  const redirectPath = params?.id ? to.replace("$id", params.id) : to;

  return (
    <Link
      to={(needsEmployeeAuth ? "/employee-login" : to) as never}
      params={needsEmployeeAuth ? undefined : (params as never)}
      search={needsEmployeeAuth ? { redirect: redirectPath } : (search as never)}
      className="tap grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-3xl border border-border bg-[var(--color-surface)] px-5 py-5 hover:bg-[var(--color-surface-2)]"
    >
      <span
        className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl"
        style={{ backgroundColor: color + "1F" }}
        aria-hidden
      >
        {emoji}
      </span>
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-2">
          <span className="block truncate text-[17px] font-semibold tracking-tight">{title}</span>
          {employeeOnly ? <EmployeeOnlyBadge /> : null}
        </span>
        <span className="mt-1 block truncate text-[13px] text-muted-foreground">{description}</span>
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
    </Link>
  );
}

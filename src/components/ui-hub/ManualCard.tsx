import { Link, useRouteContext } from "@tanstack/react-router";
import { BookOpen, ChevronRight } from "lucide-react";

import { EmployeeOnlyBadge } from "@/components/auth/PasswordGateScreen";
import { formatUpdateDate } from "@/lib/update-history";
import type { ManualSummary } from "@/lib/notion-types";

const MANUAL_COLOR = "#B58BFF";

export function ManualCard({ manual }: { manual: ManualSummary }) {
  const { auth } = useRouteContext({ from: "__root__" });
  const updatedLabel = manual.updatedAt ? formatUpdateDate(manual.updatedAt) : undefined;
  const meta = [manual.category, updatedLabel].filter(Boolean).join(" · ");
  const needsEmployeeAuth = manual.employeeOnly && !auth.employeeAuthenticated;
  const redirectPath = `/manuals/${manual.id}`;

  return (
    <Link
      to={needsEmployeeAuth ? "/employee-login" : "/manuals/$id"}
      params={needsEmployeeAuth ? undefined : { id: manual.id }}
      search={needsEmployeeAuth ? { redirect: redirectPath } : undefined}
      className="tap grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-3xl border border-border bg-[var(--color-surface)] px-5 py-5 hover:bg-[var(--color-surface-2)]"
    >
      <span
        className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl"
        style={{ backgroundColor: MANUAL_COLOR + "1F", color: MANUAL_COLOR }}
        aria-hidden
      >
        <BookOpen className="h-7 w-7" strokeWidth={1.6} />
      </span>

      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-2">
          <span className="block truncate text-[17px] font-semibold tracking-tight">{manual.title}</span>
          {manual.employeeOnly ? <EmployeeOnlyBadge /> : null}
        </span>
        {meta ? <span className="mt-1 block truncate text-[13px] text-muted-foreground">{meta}</span> : null}
        {manual.searchTags?.length ? (
          <span className="mt-1 block truncate text-[12px] text-muted-foreground/80">
            {manual.searchTags.join(" · ")}
          </span>
        ) : null}
      </span>

      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
    </Link>
  );
}

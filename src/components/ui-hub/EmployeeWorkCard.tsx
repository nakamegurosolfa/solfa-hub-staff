import { Link } from "@tanstack/react-router";
import { Briefcase, ChevronRight } from "lucide-react";

import { formatUpdateDate } from "@/lib/update-history";
import type { ManualSummary } from "@/lib/notion-types";

const EMPLOYEE_WORK_COLOR = "#E8A838";

export function EmployeeWorkCard({ item }: { item: ManualSummary }) {
  const updatedLabel = item.updatedAt ? formatUpdateDate(item.updatedAt) : undefined;
  const meta = [item.category, updatedLabel].filter(Boolean).join(" · ");

  return (
    <Link
      to="/employee-work/$id"
      params={{ id: item.id }}
      className="tap grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-3xl border border-border bg-[var(--color-surface)] px-5 py-5 hover:bg-[var(--color-surface-2)]"
    >
      <span
        className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl"
        style={{ backgroundColor: EMPLOYEE_WORK_COLOR + "1F", color: EMPLOYEE_WORK_COLOR }}
        aria-hidden
      >
        <Briefcase className="h-7 w-7" strokeWidth={1.6} />
      </span>

      <span className="min-w-0">
        <span className="block truncate text-[17px] font-semibold tracking-tight">{item.title}</span>
        {meta ? <span className="mt-1 block truncate text-[13px] text-muted-foreground">{meta}</span> : null}
        {item.searchTags.length > 0 ? (
          <span className="mt-1 block truncate text-[12px] text-muted-foreground/80">
            {item.searchTags.join(" · ")}
          </span>
        ) : null}
      </span>

      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
    </Link>
  );
}

import { ChevronDown } from "lucide-react";
import type { ManualSummary } from "@/lib/notion-types";

type ManualSearchResultCardProps = {
  manual: ManualSummary;
  excerpt: string;
  onSelect: (manualId: string) => void;
};

export function ManualSearchResultCard({ manual, excerpt, onSelect }: ManualSearchResultCardProps) {
  if (!manual?.id) return null;

  return (
    <button
      type="button"
      onClick={() => onSelect(manual.id)}
      className="tap grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-4 text-left hover:bg-[var(--color-surface-2)] touch-manipulation"
    >
      <span className="min-w-0">
        <span className="block truncate text-base font-semibold text-foreground">{manual.title ?? ""}</span>
        <span className="mt-1 block truncate text-sm text-muted-foreground">{excerpt}</span>
        {manual.category ? (
          <span className="mt-1 block truncate text-xs text-muted-foreground/80">{manual.category}</span>
        ) : null}
      </span>
      <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
    </button>
  );
}

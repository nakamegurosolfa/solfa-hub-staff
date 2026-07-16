import type { UpdateHistoryEntry } from "@/data/update-history-entries";
import { formatReleaseDate } from "@/lib/update-history";

export function UpdateHistoryList({ entries }: { entries: UpdateHistoryEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-6 text-center text-sm text-muted-foreground">
        更新履歴はまだありません。
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {entries.map((entry) => (
        <article
          key={entry.version}
          className="rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-4"
        >
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-base font-semibold">{entry.version}</span>
            <span className="shrink-0 text-sm text-muted-foreground">
              {formatReleaseDate(entry.date)}
            </span>
          </div>
          <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-foreground/90">
            {entry.changes.map((change) => (
              <li key={change}>・{change}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

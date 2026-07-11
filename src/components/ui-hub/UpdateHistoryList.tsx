import { Link } from "@tanstack/react-router";

import { SectionLabel } from "@/components/ui-hub/ListCard";
import { formatUpdateDate, groupUpdatesByDate } from "@/lib/update-history";
import type { UpdateHistoryItem } from "@/lib/notion-types";

function UpdateHistoryItemLink({ item }: { item: UpdateHistoryItem }) {
  return (
    <Link
      to={item.to as never}
      params={item.params as never}
      className="tap block rounded-xl px-2 py-1.5 text-[15px] text-foreground/90 transition-colors hover:bg-[var(--color-surface-2)] hover:text-foreground"
    >
      ・{item.title} 更新
    </Link>
  );
}

export function UpdateHistoryPreview({ items }: { items: UpdateHistoryItem[] }) {
  if (items.length === 0) {
    return (
      <>
        <SectionLabel>🆕 更新履歴</SectionLabel>
        <p className="rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-6 text-center text-sm text-muted-foreground">
          更新履歴はまだありません。
        </p>
      </>
    );
  }

  const groups = groupUpdatesByDate(items);

  return (
    <>
      <SectionLabel>🆕 更新履歴</SectionLabel>
      <div className="card-surface flex flex-col gap-4 p-5">
        {groups.map((group) => (
          <div key={group.date}>
            <p className="mb-1 text-sm font-semibold text-muted-foreground">{group.date}</p>
            <div className="flex flex-col">
              {group.items.map((item) => (
                <UpdateHistoryItemLink key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export function UpdateHistoryList({ items }: { items: UpdateHistoryItem[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-6 text-center text-sm text-muted-foreground">
        更新履歴はまだありません。
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <Link
          key={item.id}
          to={item.to as never}
          params={item.params as never}
          className="tap grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-4 hover:bg-[var(--color-surface-2)]"
        >
          <span className="min-w-[3rem] text-sm font-semibold text-muted-foreground">
            {formatUpdateDate(item.lastEditedAt)}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-semibold">{item.title}</span>
            <span className="mt-0.5 block truncate text-sm text-muted-foreground">{item.sectionLabel}</span>
          </span>
          <span className="shrink-0 text-muted-foreground" aria-hidden>
            ›
          </span>
        </Link>
      ))}
    </div>
  );
}

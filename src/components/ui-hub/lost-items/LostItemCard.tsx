import { Link } from "@tanstack/react-router";
import { formatTokyoBusinessDateShortLabel } from "@/lib/tokyo-time";
import { formatStorageDeadlineLabel } from "@/lib/lost-items-storage";
import {
  LOST_ITEM_DISPOSAL_DONE,
  LOST_ITEM_HANDOVER_DONE,
  type LostItem,
} from "@/lib/lost-items-types";

type LostItemCardProps = {
  item: LostItem;
  todayDateKey: string;
};

function statusBadgeClass(done: boolean) {
  return done
    ? "bg-emerald-500/15 text-emerald-300"
    : "bg-amber-500/15 text-amber-200";
}

function deadlineBadgeClass(tone: "normal" | "today" | "overdue") {
  if (tone === "overdue") return "bg-destructive/15 text-destructive";
  if (tone === "today") return "bg-amber-500/15 text-amber-200";
  return "bg-primary/10 text-primary";
}

export function LostItemCard({ item, todayDateKey }: LostItemCardProps) {
  const deadlineLabel = formatStorageDeadlineLabel(item, todayDateKey);

  return (
    <Link
      to="/lost-items/$itemId"
      params={{ itemId: item.id }}
      className="tap block overflow-hidden rounded-3xl border border-border bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)]"
    >
      <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-0">
        <div className="h-28 bg-[var(--color-surface-2)]">
          {item.photo?.url ? (
            <img src={item.photo.url} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="grid h-full place-items-center text-3xl text-muted-foreground">👜</div>
          )}
        </div>
        <div className="min-w-0 px-4 py-3">
          <p className="truncate text-[16px] font-semibold tracking-tight">{item.name}</p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            拾得日 {formatTokyoBusinessDateShortLabel(item.foundDate)} ・ {item.foundLocation}
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            保管期限 {formatTokyoBusinessDateShortLabel(item.storageDeadline)}
            {deadlineLabel ? (
              <span className={`ml-2 rounded-full px-2 py-0.5 text-[11px] ${deadlineBadgeClass(deadlineLabel.tone)}`}>
                {deadlineLabel.text}
              </span>
            ) : null}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusBadgeClass(item.handoverStatus === LOST_ITEM_HANDOVER_DONE)}`}
            >
              {item.handoverStatus}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusBadgeClass(item.disposalStatus === LOST_ITEM_DISPOSAL_DONE)}`}
            >
              {item.disposalStatus}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

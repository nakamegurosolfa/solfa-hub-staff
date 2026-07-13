import { shiftTokyoDateKey } from "@/lib/tokyo-time";

import {
  LOST_ITEM_DISPOSAL_DONE,
  LOST_ITEM_HANDOVER_DONE,
  LOST_ITEM_HANDOVER_PENDING,
  type LostItem,
  type LostItemDeadlineLabel,
  type LostItemFilter,
} from "@/lib/lost-items-types";

export const LOST_ITEM_STORAGE_DAYS = 14;

export function calculateStorageDeadline(foundDate: string): string {
  return shiftTokyoDateKey(foundDate, LOST_ITEM_STORAGE_DAYS);
}

function parseDateKeyToUtcMs(dateKey: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) return null;
  return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

export function diffTokyoDateKeys(laterDateKey: string, earlierDateKey: string): number {
  const later = parseDateKeyToUtcMs(laterDateKey);
  const earlier = parseDateKeyToUtcMs(earlierDateKey);
  if (later === null || earlier === null) return 0;
  return Math.round((later - earlier) / 86_400_000);
}

export function shouldShowDeadlineWarning(item: Pick<LostItem, "handoverStatus" | "disposalStatus">): boolean {
  return item.handoverStatus !== LOST_ITEM_HANDOVER_DONE && item.disposalStatus !== LOST_ITEM_DISPOSAL_DONE;
}

export function formatStorageDeadlineLabel(
  item: Pick<LostItem, "storageDeadline" | "handoverStatus" | "disposalStatus">,
  todayDateKey: string,
): LostItemDeadlineLabel | null {
  if (!shouldShowDeadlineWarning(item)) return null;

  const remainingDays = diffTokyoDateKeys(item.storageDeadline, todayDateKey);
  if (remainingDays > 0) {
    return { text: `残り${remainingDays}日`, tone: "normal" };
  }
  if (remainingDays === 0) {
    return { text: "本日期限", tone: "today" };
  }
  return { text: `期限超過${Math.abs(remainingDays)}日`, tone: "overdue" };
}

export function isStorageOverdue(
  item: Pick<LostItem, "storageDeadline" | "handoverStatus" | "disposalStatus">,
  todayDateKey: string,
): boolean {
  if (!shouldShowDeadlineWarning(item)) return false;
  return diffTokyoDateKeys(item.storageDeadline, todayDateKey) < 0;
}

export function canDeleteLostItem(
  item: Pick<LostItem, "handoverStatus" | "disposalStatus">,
): boolean {
  return item.handoverStatus === LOST_ITEM_HANDOVER_DONE || item.disposalStatus === LOST_ITEM_DISPOSAL_DONE;
}

export function filterLostItems(items: LostItem[], filter: LostItemFilter, todayDateKey: string): LostItem[] {
  switch (filter) {
    case "pending-handover":
      return items.filter((item) => item.handoverStatus === LOST_ITEM_HANDOVER_PENDING);
    case "handed-over":
      return items.filter((item) => item.handoverStatus === LOST_ITEM_HANDOVER_DONE);
    case "overdue":
      return items.filter((item) => isStorageOverdue(item, todayDateKey));
    case "disposed":
      return items.filter((item) => item.disposalStatus === LOST_ITEM_DISPOSAL_DONE);
    default:
      return items;
  }
}

export function sortLostItemsNewestFirst(items: LostItem[]): LostItem[] {
  return [...items].sort((left, right) => {
    const foundDateDiff = diffTokyoDateKeys(right.foundDate, left.foundDate);
    if (foundDateDiff !== 0) return foundDateDiff;
    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });
}

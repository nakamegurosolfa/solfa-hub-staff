import type { BreakEntry } from "@/lib/breaks-types";
import { buildIsoFromTokyoDateAndTime, formatTokyoTimeHhmm, shiftTokyoDateKey } from "@/lib/tokyo-time";

export const BREAK_PLANNED_DURATION_MINUTES = 15;

export function resolveBreakStartInstant(
  businessDate: string,
  startAt: string,
  now: Date,
): Date | null {
  const candidates: Date[] = [];

  for (const dateKey of [businessDate, shiftTokyoDateKey(businessDate, -1)]) {
    const iso = buildIsoFromTokyoDateAndTime(dateKey, startAt);
    if (iso) {
      candidates.push(new Date(iso));
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  const nowMs = now.getTime();
  const pastOrPresent = candidates.filter((date) => date.getTime() <= nowMs);

  if (pastOrPresent.length > 0) {
    return pastOrPresent.reduce((latest, date) => (date.getTime() > latest.getTime() ? date : latest));
  }

  return candidates.reduce((earliest, date) => (date.getTime() < earliest.getTime() ? date : earliest));
}

export function getBreakExpectedEndAtLabel(
  businessDate: string,
  startAt: string,
  now: Date = new Date(),
): string {
  const start = resolveBreakStartInstant(businessDate, startAt, now);
  if (!start) {
    return "—";
  }

  const endAt = new Date(start.getTime() + BREAK_PLANNED_DURATION_MINUTES * 60 * 1000);
  return formatTokyoTimeHhmm(endAt);
}

export function findActiveBreakEntry(breaks: BreakEntry[]): BreakEntry | null {
  return breaks.find((entry) => entry.startAt && !entry.endAt) ?? null;
}

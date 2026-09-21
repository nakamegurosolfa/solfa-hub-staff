import type { BreakEntry } from "@/lib/breaks-types";
import { buildIsoFromTokyoDateAndTime, shiftTokyoDateKey } from "@/lib/tokyo-time";

export const BREAK_COUNTDOWN_DURATION_SECONDS = 15 * 60;

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

export function getBreakCountdownRemainingSeconds(
  businessDate: string,
  startAt: string,
  now: Date,
): number {
  const start = resolveBreakStartInstant(businessDate, startAt, now);
  if (!start) {
    return 0;
  }

  const remainingMs = start.getTime() + BREAK_COUNTDOWN_DURATION_SECONDS * 1000 - now.getTime();
  return Math.max(0, Math.floor(remainingMs / 1000));
}

export function formatBreakCountdownLabel(totalSeconds: number): string {
  const clamped = Math.max(0, totalSeconds);
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function findActiveBreakEntry(breaks: BreakEntry[]): BreakEntry | null {
  return breaks.find((entry) => entry.startAt && !entry.endAt) ?? null;
}

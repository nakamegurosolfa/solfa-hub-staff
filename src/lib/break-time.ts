import type { BreakEntry } from "@/lib/breaks-types";

const HHMM_PATTERN = /^(\d{1,2}):(\d{2})$/;

export function isValidHhmm(value: string | null | undefined): boolean {
  if (!value) return false;
  const match = HHMM_PATTERN.exec(value.trim());
  if (!match) return false;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

export function normalizeHhmm(value: string): string | null {
  const match = HHMM_PATTERN.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function parseHhmmToMinutes(hhmm: string): number | null {
  const normalized = normalizeHhmm(hhmm);
  if (!normalized) return null;
  const [hours, minutes] = normalized.split(":").map(Number);
  return hours * 60 + minutes;
}

export function formatHhmmLabel(hhmm: string | null): string {
  if (!hhmm) return "—";
  return isValidHhmm(hhmm) ? normalizeHhmm(hhmm)! : "—";
}

export function formatHhmmInputValue(hhmm: string | null): string {
  if (!hhmm) return "";
  return isValidHhmm(hhmm) ? normalizeHhmm(hhmm)! : "";
}

export function getBreakDurationMinutes(entry: BreakEntry): number {
  if (!entry.startAt || !entry.endAt) return 0;
  if (!isValidHhmm(entry.startAt) || !isValidHhmm(entry.endAt)) return 0;

  const interval = getBreakIntervalMinutes(entry);
  if (!interval) return 0;
  return interval[1] - interval[0];
}

function getBreakIntervalMinutes(entry: BreakEntry): [number, number] | null {
  if (!entry.startAt || !entry.endAt) return null;
  if (!isValidHhmm(entry.startAt) || !isValidHhmm(entry.endAt)) return null;

  const startMin = parseHhmmToMinutes(entry.startAt);
  let endMin = parseHhmmToMinutes(entry.endAt);
  if (startMin === null || endMin === null) return null;

  if (endMin <= startMin) {
    endMin += 24 * 60;
  }

  if (endMin <= startMin) return null;

  return [startMin, endMin];
}

function intervalsOverlap(startA: number, endA: number, startB: number, endB: number): boolean {
  return Math.max(startA, startB) < Math.min(endA, endB);
}

/** 22:00〜翌5:00（5:00未満）の深夜割増ゾーンと1分でも重なるか */
export function isLateNightPremiumBreak(entry: BreakEntry): boolean {
  const interval = getBreakIntervalMinutes(entry);
  if (!interval) return false;

  const [start, end] = interval;
  const dayMinutes = 24 * 60;
  const eveningStart = 22 * 60;
  const morningEnd = 5 * 60;

  for (let dayOffset = -1; dayOffset <= 2; dayOffset += 1) {
    const base = dayOffset * dayMinutes;
    if (intervalsOverlap(start, end, base + eveningStart, base + dayMinutes)) {
      return true;
    }
    if (intervalsOverlap(start, end, base + dayMinutes, base + dayMinutes + morningEnd)) {
      return true;
    }
  }

  return false;
}

export function getTotalCompletedMinutes(breaks: BreakEntry[]): number {
  return breaks.reduce((sum, entry) => sum + getBreakDurationMinutes(entry), 0);
}

export function getShortageMinutes(requiredMinutes: number, breaks: BreakEntry[]): number {
  const shortage = requiredMinutes - getTotalCompletedMinutes(breaks);
  return Math.max(0, shortage);
}

export function isStaffOnBreak(breaks: BreakEntry[]): boolean {
  return breaks.some((entry) => entry.startAt && !entry.endAt);
}

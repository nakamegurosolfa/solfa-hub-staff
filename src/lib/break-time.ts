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

  const startMin = parseHhmmToMinutes(entry.startAt);
  let endMin = parseHhmmToMinutes(entry.endAt);
  if (startMin === null || endMin === null) return 0;

  if (endMin <= startMin) {
    endMin += 24 * 60;
  }

  return endMin - startMin;
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

/** Japan Standard Time (Asia/Tokyo) — fixed UTC+9, no DST. */
export const TOKYO_TIME_ZONE = "Asia/Tokyo";
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"] as const;

type TokyoDateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

type TokyoPartType = "year" | "month" | "day" | "hour" | "minute";

function readTokyoPart(parts: Intl.DateTimeFormatPart[], type: TokyoPartType): number {
  const value = parts.find((part) => part.type === type)?.value ?? "";
  return Number(value);
}

/** Read wall-clock components in Asia/Tokyo regardless of server runtime timezone. */
function getTokyoParts(date: Date): TokyoDateParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TOKYO_TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  return {
    year: readTokyoPart(parts, "year"),
    month: readTokyoPart(parts, "month"),
    day: readTokyoPart(parts, "day"),
    hour: readTokyoPart(parts, "hour"),
    minute: readTokyoPart(parts, "minute"),
  };
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function parseHhmm(hhmm: string): { hours: number; minutes: number } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return { hours, minutes };
}

function parseDateKeyParts(dateKey: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

/** Current business date (YYYY-MM-DD) in Japan time. */
export function formatTokyoDateKey(date: Date): string {
  const { year, month, day } = getTokyoParts(date);
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

export function shiftTokyoDateKey(dateKey: string, days: number): string {
  const parts = parseDateKeyParts(dateKey);
  if (!parts) return dateKey;
  const shifted = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));
  return `${shifted.getUTCFullYear()}-${pad2(shifted.getUTCMonth() + 1)}-${pad2(shifted.getUTCDate())}`;
}

export function formatTokyoBusinessDateLabel(dateKey: string): string {
  const parts = parseDateKeyParts(dateKey);
  if (!parts) return dateKey;
  const weekday = WEEKDAYS[new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay()];
  return `${parts.year}年${parts.month}月${parts.day}日（${weekday}）`;
}

export function formatTokyoBusinessDateShortLabel(dateKey: string): string {
  const parts = parseDateKeyParts(dateKey);
  if (!parts) return dateKey;
  return `${parts.year}年${parts.month}月${parts.day}日`;
}

/** Interpret dateKey + HH:mm as Japan wall-clock time and return a UTC ISO string. */
export function buildIsoFromTokyoDateAndTime(dateKey: string, hhmm: string): string | null {
  const dateParts = parseDateKeyParts(dateKey);
  const timeParts = parseHhmm(hhmm);
  if (!dateParts || !timeParts) return null;

  const utcMs =
    Date.UTC(
      dateParts.year,
      dateParts.month - 1,
      dateParts.day,
      timeParts.hours,
      timeParts.minutes,
      0,
      0,
    ) - JST_OFFSET_MS;
  return new Date(utcMs).toISOString();
}

/** Build end ISO from start instant and end HH:mm (JST), rolling to the next day when needed. */
export function buildEndIsoFromTokyo(startIso: string, endHhmm: string): string | null {
  const start = new Date(startIso);
  if (Number.isNaN(start.getTime()) || !parseHhmm(endHhmm)) return null;

  const startTokyo = getTokyoParts(start);
  const dateKey = `${startTokyo.year}-${pad2(startTokyo.month)}-${pad2(startTokyo.day)}`;
  let endIso = buildIsoFromTokyoDateAndTime(dateKey, endHhmm);
  if (!endIso) return null;

  if (new Date(endIso).getTime() <= start.getTime()) {
    endIso = buildIsoFromTokyoDateAndTime(shiftTokyoDateKey(dateKey, 1), endHhmm);
  }
  return endIso;
}

export function formatTokyoTimeHhmm(date: Date): string {
  const { hour, minute } = getTokyoParts(date);
  return `${pad2(hour)}:${pad2(minute)}`;
}

export function formatIsoTimeInTokyo(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return formatTokyoTimeHhmm(date);
}

export function formatIsoTimeInputInTokyo(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return formatTokyoTimeHhmm(date);
}

export function formatTokyoSentAtLabel(date: Date): string {
  const { year, month, day, hour, minute } = getTokyoParts(date);
  return `${year}年${month}月${day}日 ${pad2(hour)}:${pad2(minute)}`;
}

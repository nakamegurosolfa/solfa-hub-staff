/** Japan Standard Time (Asia/Tokyo) — fixed UTC+9, no DST. */
export const TOKYO_TIME_ZONE = "Asia/Tokyo";
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

type TokyoDateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

function getTokyoParts(date: Date): TokyoDateParts {
  const jst = new Date(date.getTime() + JST_OFFSET_MS);
  return {
    year: jst.getUTCFullYear(),
    month: jst.getUTCMonth() + 1,
    day: jst.getUTCDate(),
    hour: jst.getUTCHours(),
    minute: jst.getUTCMinutes(),
  };
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
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

export function formatTokyoSentAtLabel(date: Date): string {
  const { year, month, day, hour, minute } = getTokyoParts(date);
  return `${year}年${month}月${day}日 ${pad2(hour)}:${pad2(minute)}`;
}

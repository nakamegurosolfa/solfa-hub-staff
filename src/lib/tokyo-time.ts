export const TOKYO_TIME_ZONE = "Asia/Tokyo";

type DatePartType = "year" | "month" | "day" | "hour" | "minute";

function partValue(parts: Intl.DateTimeFormatPart[], type: DatePartType): string {
  return parts.find((part) => part.type === type)?.value ?? "";
}

function formatTokyoParts(date: Date, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormatPart[] {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TOKYO_TIME_ZONE,
    ...options,
  }).formatToParts(date);
}

export function formatTokyoTimeHhmm(date: Date): string {
  const parts = formatTokyoParts(date, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const hours = partValue(parts, "hour").padStart(2, "0");
  const minutes = partValue(parts, "minute").padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function formatTokyoSentAtLabel(date: Date): string {
  const parts = formatTokyoParts(date, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const hours = partValue(parts, "hour").padStart(2, "0");
  const minutes = partValue(parts, "minute").padStart(2, "0");
  return `${partValue(parts, "year")}年${partValue(parts, "month")}月${partValue(parts, "day")}日 ${hours}:${minutes}`;
}

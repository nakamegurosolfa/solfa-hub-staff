type BadgeTone = {
  bg: string;
  text: string;
};

const CARD_BADGE_BASE =
  "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold leading-tight";
const DETAIL_BADGE_BASE =
  "inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold leading-tight";

const NEUTRAL_TONE: BadgeTone = {
  bg: "bg-muted/80",
  text: "text-muted-foreground",
};

export function learningPriorityTone(value: string): BadgeTone {
  const letter = value.trim().charAt(0).toUpperCase();

  switch (letter) {
    case "S":
      return { bg: "bg-red-500/20", text: "text-red-500" };
    case "A":
      return { bg: "bg-orange-500/20", text: "text-orange-500" };
    case "B":
      return { bg: "bg-amber-500/18", text: "text-amber-500" };
    case "C":
      return { bg: "bg-emerald-500/20", text: "text-emerald-500" };
    case "D":
      return { bg: "bg-violet-500/20", text: "text-violet-500" };
    default:
      return NEUTRAL_TONE;
  }
}

export function orderFrequencyTone(value: string): BadgeTone {
  switch (value.trim()) {
    case "多":
      return { bg: "bg-red-500/20", text: "text-red-500" };
    case "並":
      return { bg: "bg-amber-500/18", text: "text-amber-500" };
    case "少":
      return { bg: "bg-sky-500/20", text: "text-sky-500" };
    default:
      return NEUTRAL_TONE;
  }
}

export function cocktailBadgeClassName(tone: BadgeTone, size: "card" | "detail" = "card") {
  const base = size === "card" ? CARD_BADGE_BASE : DETAIL_BADGE_BASE;
  return `${base} ${tone.bg} ${tone.text}`;
}

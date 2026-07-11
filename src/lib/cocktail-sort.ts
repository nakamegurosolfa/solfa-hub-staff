import type { CocktailSummary } from "@/lib/notion-types";

const LEARNING_PRIORITY_LETTER_RANK: Record<string, number> = {
  S: 0,
  A: 1,
  B: 2,
  C: 3,
  D: 4,
};

const CATEGORY_RANK: Record<string, number> = {
  ビール: 0,
  ウイスキー: 1,
  ジン: 2,
  ウォッカ: 3,
  ラム: 4,
  テキーラ: 5,
  キンミヤ焼酎: 6,
  リキュール: 7,
  ワイン: 8,
  その他: 9,
};

const CATEGORY_ALIASES: Record<string, string> = {
  焼酎: "キンミヤ焼酎",
};

function normalizeCategory(value?: string): string | undefined {
  if (!value) return undefined;
  return CATEGORY_ALIASES[value] ?? value;
}

function rankLearningPriority(value?: string): number {
  if (!value) return Number.MAX_SAFE_INTEGER;

  const letter = value.trim().charAt(0).toUpperCase();
  if (letter in LEARNING_PRIORITY_LETTER_RANK) {
    return LEARNING_PRIORITY_LETTER_RANK[letter];
  }

  return Number.MAX_SAFE_INTEGER;
}

function rankCategory(value?: string): number {
  const normalized = normalizeCategory(value);
  if (!normalized) return Number.MAX_SAFE_INTEGER;
  return CATEGORY_RANK[normalized] ?? Number.MAX_SAFE_INTEGER;
}

/** 表示順昇順。未設定は最後。同じ表示順のときだけ名前順。 */
function compareDisplayOrder(a: CocktailSummary, b: CocktailSummary): number {
  const aOrder = a.displayOrder;
  const bOrder = b.displayOrder;
  const aHasOrder = aOrder !== undefined;
  const bHasOrder = bOrder !== undefined;

  if (aHasOrder && bHasOrder) {
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.name.localeCompare(b.name, "ja");
  }
  if (aHasOrder && !bHasOrder) return -1;
  if (!aHasOrder && bHasOrder) return 1;
  return a.name.localeCompare(b.name, "ja");
}

function compareCocktailsWithinSection(a: CocktailSummary, b: CocktailSummary): number {
  const categoryCompare = rankCategory(a.category) - rankCategory(b.category);
  if (categoryCompare !== 0) return categoryCompare;

  const priorityCompare = rankLearningPriority(a.learningPriority) - rankLearningPriority(b.learningPriority);
  if (priorityCompare !== 0) return priorityCompare;

  return compareDisplayOrder(a, b);
}

/** Sort cocktails for the index page: limited section first, then regular cocktails. */
export function sortCocktailsForIndex(cocktails: CocktailSummary[]): CocktailSummary[] {
  const limited = [...cocktails.filter((cocktail) => cocktail.limitedTime)].sort(compareCocktailsWithinSection);
  const regular = [...cocktails.filter((cocktail) => !cocktail.limitedTime)].sort(compareCocktailsWithinSection);
  return [...limited, ...regular];
}

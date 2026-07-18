import type { CocktailSummary } from "@/lib/notion-types";
import {
  COCKTAIL_TEST_RANKS,
  type CocktailTestQuestionCount,
  type CocktailTestRank,
} from "@/lib/cocktail-test-types";

export { COCKTAIL_TEST_RANKS };
export type { CocktailTestRank, CocktailTestQuestionCount };

export function normalizeLearningRank(value?: string | null): CocktailTestRank | null {
  if (!value?.trim()) return null;

  const compact = value
    .replace(/\s/g, "")
    .replace(/ランク/gi, "")
    .toUpperCase();
  const letter = compact.charAt(0);

  if (COCKTAIL_TEST_RANKS.includes(letter as CocktailTestRank)) {
    return letter as CocktailTestRank;
  }

  return null;
}

export function formatTestRankLabel(rank: CocktailTestRank): string {
  return `${rank}ランク`;
}

export function dedupeCocktailsById(cocktails: CocktailSummary[]): CocktailSummary[] {
  const seen = new Set<string>();
  const unique: CocktailSummary[] = [];

  for (const cocktail of cocktails) {
    if (seen.has(cocktail.id)) continue;
    seen.add(cocktail.id);
    unique.push(cocktail);
  }

  return unique;
}

export function shuffleArray<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

export const COCKTAIL_TEST_EXCLUDED_CATEGORIES = ["その他", "期間限定"] as const;

export function isCocktailExcludedFromTest(cocktail: CocktailSummary): boolean {
  if (cocktail.limitedTime) return true;
  if (!cocktail.category) return false;
  return COCKTAIL_TEST_EXCLUDED_CATEGORIES.includes(
    cocktail.category as (typeof COCKTAIL_TEST_EXCLUDED_CATEGORIES)[number],
  );
}

export function filterCocktailsForTest(cocktails: CocktailSummary[]): CocktailSummary[] {
  return cocktails.filter((cocktail) => !isCocktailExcludedFromTest(cocktail));
}

export function filterCocktailsByRanks(
  cocktails: CocktailSummary[],
  ranks: CocktailTestRank[],
): CocktailSummary[] {
  const rankSet = new Set(ranks);
  return dedupeCocktailsById(
    filterCocktailsForTest(cocktails).filter((cocktail) => {
      const rank = normalizeLearningRank(cocktail.learningPriority);
      return rank !== null && rankSet.has(rank);
    }),
  );
}

export function resolveQuestionLimit(
  questionCount: CocktailTestQuestionCount,
  availableCount: number,
): number {
  if (questionCount === "all") return availableCount;
  if (questionCount === "20") return Math.min(20, availableCount);
  return Math.min(10, availableCount);
}

export function selectTestCocktails(
  cocktails: CocktailSummary[],
  ranks: CocktailTestRank[],
  questionCount: CocktailTestQuestionCount,
): CocktailSummary[] {
  const filtered = filterCocktailsByRanks(cocktails, ranks);
  const shuffled = shuffleArray(filtered);
  const limit = resolveQuestionLimit(questionCount, shuffled.length);
  return shuffled.slice(0, limit);
}

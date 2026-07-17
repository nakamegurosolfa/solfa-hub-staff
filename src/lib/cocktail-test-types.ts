import type { CocktailDetail, CocktailSummary } from "@/lib/notion-types";

export const COCKTAIL_TEST_RANKS = ["S", "A", "B", "C", "D"] as const;

export type CocktailTestRank = (typeof COCKTAIL_TEST_RANKS)[number];

export type CocktailTestPhase = "setup" | "question" | "grading" | "result";

export type CocktailTestQuestionCount = "10" | "20" | "all";

export type CocktailTestState = {
  phase: CocktailTestPhase;
  selectedRanks: CocktailTestRank[];
  questionCount: CocktailTestQuestionCount;
  testCocktails: CocktailSummary[];
  detailById: Record<string, CocktailDetail>;
  currentQuestionIndex: number;
  currentGradingIndex: number;
  incorrectIds: string[];
  isTransitioning: boolean;
  isLoadingDetails: boolean;
  setupMessage: string | null;
};

export const INITIAL_COCKTAIL_TEST_STATE: CocktailTestState = {
  phase: "setup",
  selectedRanks: [],
  questionCount: "10",
  testCocktails: [],
  detailById: {},
  currentQuestionIndex: 0,
  currentGradingIndex: 0,
  incorrectIds: [],
  isTransitioning: false,
  isLoadingDetails: false,
  setupMessage: null,
};

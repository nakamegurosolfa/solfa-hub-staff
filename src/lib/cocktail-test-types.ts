import type { CocktailDetail, CocktailSummary } from "@/lib/notion-types";
import type {
  CocktailTestGradeResult,
  CocktailTestUserAnswer,
} from "@/lib/cocktail-test-recipe";

export const COCKTAIL_TEST_RANKS = ["S", "A", "B", "C", "D"] as const;

export type CocktailTestRank = (typeof COCKTAIL_TEST_RANKS)[number];

export type CocktailTestPhase = "setup" | "question" | "result";

export type CocktailTestQuestionCount = "10" | "20" | "all";

export type CocktailTestQuestionResult = {
  cocktailId: string;
  isCorrect: boolean;
  userAnswer: CocktailTestUserAnswer;
  gradeResult: CocktailTestGradeResult;
};

export type CocktailTestState = {
  phase: CocktailTestPhase;
  selectedRanks: CocktailTestRank[];
  questionCount: CocktailTestQuestionCount;
  testCocktails: CocktailSummary[];
  detailById: Record<string, CocktailDetail>;
  currentQuestionIndex: number;
  isReviewingQuestion: boolean;
  questionResults: CocktailTestQuestionResult[];
  currentAnswer: CocktailTestUserAnswer;
  isSubmitting: boolean;
  isLoadingDetails: boolean;
  setupMessage: string | null;
  answerMessage: string | null;
};

export const INITIAL_COCKTAIL_TEST_STATE: CocktailTestState = {
  phase: "setup",
  selectedRanks: [],
  questionCount: "10",
  testCocktails: [],
  detailById: {},
  currentQuestionIndex: 0,
  isReviewingQuestion: false,
  questionResults: [],
  currentAnswer: { price: "", method: "", lines: [] },
  isSubmitting: false,
  isLoadingDetails: false,
  setupMessage: null,
  answerMessage: null,
};

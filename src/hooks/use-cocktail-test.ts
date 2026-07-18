import { useCallback, useMemo, useState } from "react";

import {
  COCKTAIL_TEST_RANKS,
  filterCocktailsByRanks,
  selectTestCocktails,
} from "@/lib/cocktail-test";
import {
  extractRecipeLinesFromDetail,
  gradeCocktailTestAnswer,
  isCocktailTestable,
  validateCocktailTestAnswerInput,
  type CocktailTestUserAnswer,
} from "@/lib/cocktail-test-recipe";
import {
  INITIAL_COCKTAIL_TEST_STATE,
  type CocktailTestPhase,
  type CocktailTestQuestionCount,
  type CocktailTestQuestionResult,
  type CocktailTestRank,
  type CocktailTestState,
} from "@/lib/cocktail-test-types";
import { fetchCocktailPage } from "@/lib/notion-functions";
import type { CocktailDetail, CocktailSummary } from "@/lib/notion-types";

const EMPTY_COCKTAILS: CocktailSummary[] = [];

function createEmptyAnswer(detail: CocktailDetail): CocktailTestUserAnswer {
  const lines = extractRecipeLinesFromDetail(detail);
  return {
    price: "",
    method: "",
    lines: lines.map((line) => ({
      ingredientName: "",
      ...(line.kind === "ml" ? { mlAmount: "" } : {}),
    })),
  };
}

async function loadTestableDetails(selected: CocktailSummary[]) {
  const details = await Promise.all(
    selected.map((cocktail) => fetchCocktailPage({ data: cocktail.id })),
  );
  const detailById = Object.fromEntries(
    details.map((detail) => [detail.id, detail] satisfies [string, CocktailDetail]),
  );
  const testCocktails = selected.filter((cocktail) =>
    isCocktailTestable(detailById[cocktail.id]),
  );

  return { detailById, testCocktails };
}

export function useCocktailTest(allCocktails: CocktailSummary[] = EMPTY_COCKTAILS) {
  const [state, setState] = useState<CocktailTestState>(INITIAL_COCKTAIL_TEST_STATE);

  const toggleRank = useCallback((rank: CocktailTestRank, checked: boolean) => {
    setState((current) => ({
      ...current,
      setupMessage: null,
      selectedRanks: checked
        ? [...new Set([...current.selectedRanks, rank])]
        : current.selectedRanks.filter((value) => value !== rank),
    }));
  }, []);

  const setQuestionCount = useCallback((questionCount: CocktailTestQuestionCount) => {
    setState((current) => ({
      ...current,
      setupMessage: null,
      questionCount,
    }));
  }, []);

  const resetTest = useCallback(() => {
    setState(INITIAL_COCKTAIL_TEST_STATE);
  }, []);

  const backToSetup = useCallback((keepSettings = true) => {
    setState((current) => ({
      ...INITIAL_COCKTAIL_TEST_STATE,
      selectedRanks: keepSettings ? current.selectedRanks : [],
      questionCount: keepSettings ? current.questionCount : "10",
    }));
  }, []);

  const beginQuestionPhase = useCallback(async (selected: CocktailSummary[]) => {
    setState((current) => ({
      ...current,
      isLoadingDetails: true,
      setupMessage: null,
      answerMessage: null,
    }));

    try {
      const { detailById, testCocktails } = await loadTestableDetails(selected);
      if (testCocktails.length === 0) {
        setState((current) => ({
          ...current,
          isLoadingDetails: false,
          setupMessage: "選択したランクに出題できるカクテルがありません。",
        }));
        return;
      }

      const firstDetail = detailById[testCocktails[0].id];
      setState((current) => ({
        ...current,
        phase: "question",
        testCocktails,
        detailById,
        currentQuestionIndex: 0,
        isReviewingQuestion: false,
        questionResults: [],
        currentAnswer: createEmptyAnswer(firstDetail),
        isLoadingDetails: false,
        setupMessage: null,
        answerMessage: null,
      }));
    } catch {
      setState((current) => ({
        ...current,
        isLoadingDetails: false,
        setupMessage: "レシピの読み込みに失敗しました。もう一度お試しください。",
      }));
    }
  }, []);

  const startTest = useCallback(() => {
    setState((current) => {
      if (current.selectedRanks.length === 0) {
        return {
          ...current,
          setupMessage: "テストするランクを1つ以上選択してください。",
        };
      }

      const selected = selectTestCocktails(
        allCocktails,
        current.selectedRanks,
        current.questionCount,
      );
      if (selected.length === 0) {
        return {
          ...current,
          setupMessage: "選択したランクに出題できるカクテルがありません。",
        };
      }

      void beginQuestionPhase(selected);
      return {
        ...current,
        isLoadingDetails: true,
        setupMessage: null,
        answerMessage: null,
      };
    });
  }, [allCocktails, beginQuestionPhase]);

  const setCurrentAnswer = useCallback((currentAnswer: CocktailTestUserAnswer) => {
    setState((current) => ({
      ...current,
      currentAnswer,
      answerMessage: null,
    }));
  }, []);

  const submitAnswer = useCallback(() => {
    setState((current) => {
      const cocktail = current.testCocktails[current.currentQuestionIndex];
      const detail = cocktail ? current.detailById[cocktail.id] : null;
      if (!cocktail || !detail || current.isReviewingQuestion || current.isSubmitting) {
        return current;
      }

      const recipeLines = extractRecipeLinesFromDetail(detail);
      const validationMessage = validateCocktailTestAnswerInput(
        recipeLines,
        current.currentAnswer,
      );
      if (validationMessage) {
        return {
          ...current,
          answerMessage: validationMessage,
        };
      }

      const gradeResult = gradeCocktailTestAnswer(
        recipeLines,
        detail.price,
        detail.preparationMethod,
        current.currentAnswer,
      );
      const questionResult: CocktailTestQuestionResult = {
        cocktailId: cocktail.id,
        isCorrect: gradeResult.isCorrect,
        userAnswer: current.currentAnswer,
        gradeResult,
      };

      return {
        ...current,
        isReviewingQuestion: true,
        answerMessage: null,
        questionResults: [...current.questionResults, questionResult],
      };
    });
  }, []);

  const nextQuestion = useCallback(() => {
    setState((current) => {
      const isLast = current.currentQuestionIndex >= current.testCocktails.length - 1;
      if (isLast) {
        return {
          ...current,
          phase: "result",
          isReviewingQuestion: false,
          answerMessage: null,
        };
      }

      const nextIndex = current.currentQuestionIndex + 1;
      const nextCocktail = current.testCocktails[nextIndex];
      const nextDetail = nextCocktail ? current.detailById[nextCocktail.id] : null;

      return {
        ...current,
        currentQuestionIndex: nextIndex,
        isReviewingQuestion: false,
        currentAnswer: nextDetail ? createEmptyAnswer(nextDetail) : current.currentAnswer,
        answerMessage: null,
      };
    });
  }, []);

  const retryTest = useCallback(() => {
    setState((current) => {
      const selected = selectTestCocktails(
        allCocktails,
        current.selectedRanks,
        current.questionCount,
      );
      if (selected.length === 0) {
        return {
          ...current,
          phase: "setup",
          setupMessage: "選択したランクに出題できるカクテルがありません。",
        };
      }

      void beginQuestionPhase(selected);
      return {
        ...current,
        isLoadingDetails: true,
        setupMessage: null,
        answerMessage: null,
      };
    });
  }, [allCocktails, beginQuestionPhase]);

  const availableCount = useMemo(() => {
    if (state.selectedRanks.length === 0) return 0;
    return filterCocktailsByRanks(allCocktails, state.selectedRanks).length;
  }, [allCocktails, state.selectedRanks]);

  const currentQuestion = state.testCocktails[state.currentQuestionIndex] ?? null;
  const currentDetail = currentQuestion ? state.detailById[currentQuestion.id] : null;
  const currentRecipeLines = currentDetail ? extractRecipeLinesFromDetail(currentDetail) : [];
  const currentQuestionResult =
    state.questionResults.find((result) => result.cocktailId === currentQuestion?.id) ?? null;

  const resultStats = useMemo(() => {
    const total = state.questionResults.length;
    const correctCount = state.questionResults.filter((result) => result.isCorrect).length;
    const incorrectCount = total - correctCount;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    return { total, correctCount, incorrectCount, accuracy };
  }, [state.questionResults]);

  const incorrectResults = useMemo(
    () => state.questionResults.filter((result) => !result.isCorrect),
    [state.questionResults],
  );

  return {
    state,
    ranks: COCKTAIL_TEST_RANKS,
    availableCount,
    currentQuestion,
    currentDetail,
    currentRecipeLines,
    currentQuestionResult,
    resultStats,
    incorrectResults,
    toggleRank,
    setQuestionCount,
    startTest,
    setCurrentAnswer,
    submitAnswer,
    nextQuestion,
    retryTest,
    backToSetup,
    resetTest,
    canStartTest: allCocktails.length > 0,
  };
}

export function isCocktailTestActivePhase(phase: CocktailTestPhase): boolean {
  return phase === "question";
}

import { useCallback, useMemo, useState } from "react";

import {
  COCKTAIL_TEST_RANKS,
  filterCocktailsByRanks,
  selectTestCocktails,
} from "@/lib/cocktail-test";
import {
  INITIAL_COCKTAIL_TEST_STATE,
  type CocktailTestPhase,
  type CocktailTestQuestionCount,
  type CocktailTestRank,
  type CocktailTestState,
} from "@/lib/cocktail-test-types";
import { fetchCocktailPage } from "@/lib/notion-functions";
import type { CocktailDetail, CocktailSummary } from "@/lib/notion-types";

const EMPTY_COCKTAILS: CocktailSummary[] = [];

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

      return {
        ...current,
        phase: "question",
        setupMessage: null,
        testCocktails: selected,
        detailById: {},
        currentQuestionIndex: 0,
        currentGradingIndex: 0,
        incorrectIds: [],
        isTransitioning: false,
        isLoadingDetails: false,
      };
    });
  }, [allCocktails]);

  const beginGrading = useCallback(async (testCocktails: CocktailSummary[]) => {
    setState((current) => ({
      ...current,
      isLoadingDetails: true,
      isTransitioning: true,
      setupMessage: null,
    }));

    try {
      const details = await Promise.all(
        testCocktails.map((cocktail) => fetchCocktailPage({ data: cocktail.id })),
      );
      const detailById = Object.fromEntries(
        details.map((detail) => [detail.id, detail] satisfies [string, CocktailDetail]),
      );

      setState((current) => ({
        ...current,
        phase: "grading",
        detailById,
        currentGradingIndex: 0,
        isLoadingDetails: false,
        isTransitioning: false,
      }));
    } catch {
      setState((current) => ({
        ...current,
        isLoadingDetails: false,
        isTransitioning: false,
        setupMessage: "レシピの読み込みに失敗しました。もう一度お試しください。",
      }));
    }
  }, []);

  const nextQuestion = useCallback(() => {
    setState((current) => {
      const isLast = current.currentQuestionIndex >= current.testCocktails.length - 1;
      if (isLast) {
        return current;
      }

      return {
        ...current,
        currentQuestionIndex: current.currentQuestionIndex + 1,
      };
    });
  }, []);

  const proceedFromQuestion = useCallback(async () => {
    const isLast = state.currentQuestionIndex >= state.testCocktails.length - 1;
    if (!isLast) {
      nextQuestion();
      return;
    }

    await beginGrading(state.testCocktails);
  }, [beginGrading, nextQuestion, state.currentQuestionIndex, state.testCocktails]);

  const markGrading = useCallback((isCorrect: boolean) => {
    setState((current) => {
      if (current.isTransitioning) return current;

      const cocktail = current.testCocktails[current.currentGradingIndex];
      if (!cocktail) return current;

      const incorrectIds =
        !isCorrect && !current.incorrectIds.includes(cocktail.id)
          ? [...current.incorrectIds, cocktail.id]
          : current.incorrectIds;

      const isLast = current.currentGradingIndex >= current.testCocktails.length - 1;
      if (isLast) {
        return {
          ...current,
          incorrectIds,
          phase: "result",
          isTransitioning: false,
        };
      }

      return {
        ...current,
        incorrectIds,
        currentGradingIndex: current.currentGradingIndex + 1,
        isTransitioning: true,
      };
    });

    window.setTimeout(() => {
      setState((current) => ({ ...current, isTransitioning: false }));
    }, 120);
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

      return {
        ...current,
        phase: "question",
        setupMessage: null,
        testCocktails: selected,
        detailById: {},
        currentQuestionIndex: 0,
        currentGradingIndex: 0,
        incorrectIds: [],
        isTransitioning: false,
        isLoadingDetails: false,
      };
    });
  }, [allCocktails]);

  const availableCount = useMemo(() => {
    if (state.selectedRanks.length === 0) return 0;
    return filterCocktailsByRanks(allCocktails, state.selectedRanks).length;
  }, [allCocktails, state.selectedRanks]);

  const incorrectCocktails = useMemo(
    () => state.testCocktails.filter((cocktail) => state.incorrectIds.includes(cocktail.id)),
    [state.incorrectIds, state.testCocktails],
  );

  const currentQuestion = state.testCocktails[state.currentQuestionIndex] ?? null;
  const currentGradingCocktail = state.testCocktails[state.currentGradingIndex] ?? null;
  const currentGradingDetail = currentGradingCocktail
    ? state.detailById[currentGradingCocktail.id]
    : null;

  return {
    state,
    ranks: COCKTAIL_TEST_RANKS,
    availableCount,
    incorrectCocktails,
    currentQuestion,
    currentGradingCocktail,
    currentGradingDetail,
    toggleRank,
    setQuestionCount,
    startTest,
    proceedFromQuestion,
    markGrading,
    retryTest,
    backToSetup,
    resetTest,
    canStartTest: allCocktails.length > 0,
  };
}

export function isCocktailTestActivePhase(phase: CocktailTestPhase): boolean {
  return phase === "question" || phase === "grading";
}

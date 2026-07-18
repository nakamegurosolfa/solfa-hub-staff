import { Block, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AppShell, BackLink, PageHeader } from "@/components/layout/AppShell";
import { CocktailTestQuestionPanel } from "@/components/ui-hub/cocktail-test/CocktailTestQuestionPanel";
import { CocktailTestResultPanel } from "@/components/ui-hub/cocktail-test/CocktailTestResultPanel";
import { CocktailTestSetupPanel } from "@/components/ui-hub/cocktail-test/CocktailTestSetupPanel";
import { APP_NAME, appPageTitle } from "@/data/app-sections";
import { isCocktailTestActivePhase, useCocktailTest } from "@/hooks/use-cocktail-test";
import { fetchCocktailIndex } from "@/lib/notion-functions";

export const Route = createFileRoute("/cocktails/test")({
  loader: () => fetchCocktailIndex(),
  component: CocktailTestPage,
  head: () => ({ meta: [{ title: appPageTitle("カクテルテスト") }] }),
  errorComponent: () => (
    <AppShell>
      <BackLink to="/cocktails" label="カクテルレシピ" />
      <PageHeader title="テストモード" subtitle="ランク別カクテルテスト" />
      <p className="rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-6 text-center text-sm leading-relaxed text-muted-foreground">
        カクテルレシピの読み込みに失敗しました。
        <br />
        Notion の「カクテルレシピ」データベースを Integration「{APP_NAME}」に接続し、
        <code className="text-foreground/80">NOTION_COCKTAIL_DATABASE_ID</code>{" "}
        が正しいか確認してください。
      </p>
    </AppShell>
  ),
});

function CocktailTestPage() {
  const cocktails = Route.useLoaderData();
  const navigate = useNavigate();
  const [exitOpen, setExitOpen] = useState(false);
  const [pendingExit, setPendingExit] = useState<(() => void) | null>(null);

  const {
    state,
    ranks,
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
    canStartTest,
  } = useCocktailTest(cocktails);

  const isActivePhase = isCocktailTestActivePhase(state.phase);

  const requestExit = useCallback(
    (action: () => void) => {
      if (isCocktailTestActivePhase(state.phase)) {
        setPendingExit(() => action);
        setExitOpen(true);
        return;
      }

      action();
    },
    [state.phase],
  );

  const handleBackToRecipes = useCallback(() => {
    requestExit(() => {
      resetTest();
      void navigate({ to: "/cocktails" });
    });
  }, [navigate, requestExit, resetTest]);

  const confirmExit = useCallback(() => {
    const action = pendingExit;
    setExitOpen(false);
    setPendingExit(null);
    action?.();
  }, [pendingExit]);

  const backLabel = "カクテルレシピ";
  const needsExitConfirm = state.phase === "question";

  const handleBackWithoutConfirm = useCallback(() => {
    resetTest();
    void navigate({ to: "/cocktails" });
  }, [navigate, resetTest]);

  return (
    <AppShell>
      <Block
        shouldBlockFn={() => isActivePhase}
        withResolver
        enableBeforeUnload={isActivePhase}
        disabled={!isActivePhase}
      >
        {(blocker) =>
          blocker.status === "blocked" && !exitOpen ? (
            <AlertDialog
              open
              onOpenChange={(open) => {
                if (!open) blocker.reset();
              }}
            >
              <AlertDialogContent className="rounded-3xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>テストを終了しますか？</AlertDialogTitle>
                  <AlertDialogDescription>
                    テストを終了してカクテルレシピに戻りますか？
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => blocker.reset()}>キャンセル</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      resetTest();
                      blocker.proceed();
                    }}
                  >
                    終了する
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null
        }
      </Block>

      {needsExitConfirm ? (
        <button
          type="button"
          className="tap mb-4 inline-flex items-center gap-1 text-sm font-medium text-primary"
          onClick={handleBackToRecipes}
        >
          <span aria-hidden>‹</span> テストを終了
        </button>
      ) : state.phase === "setup" ? (
        <BackLink to="/cocktails" label={backLabel} />
      ) : (
        <button
          type="button"
          className="tap mb-4 inline-flex items-center gap-1 text-sm font-medium text-primary"
          onClick={handleBackWithoutConfirm}
        >
          <span aria-hidden>‹</span> {backLabel}
        </button>
      )}

      <PageHeader
        title="テストモード"
        subtitle={
          state.phase === "setup"
            ? "ランクと問題数を選んでテストを開始"
            : state.phase === "question"
              ? state.isReviewingQuestion
                ? "正解レシピを確認しましょう"
                : "材料名・分量・価格を入力してください"
              : "テスト結果"
        }
      />

      {state.phase === "setup" ? (
        <CocktailTestSetupPanel
          ranks={ranks}
          selectedRanks={state.selectedRanks}
          questionCount={state.questionCount}
          setupMessage={state.setupMessage}
          canStartTest={canStartTest}
          isLoadingDetails={state.isLoadingDetails}
          onToggleRank={toggleRank}
          onQuestionCountChange={setQuestionCount}
          onStart={startTest}
        />
      ) : null}

      {state.phase === "question" && currentQuestion && currentDetail ? (
        <CocktailTestQuestionPanel
          cocktail={currentQuestion}
          detail={currentDetail}
          recipeLines={currentRecipeLines}
          currentIndex={state.currentQuestionIndex}
          total={state.testCocktails.length}
          isReviewing={state.isReviewingQuestion}
          answer={state.currentAnswer}
          gradeResult={currentQuestionResult?.gradeResult ?? null}
          answerMessage={state.answerMessage}
          onAnswerChange={setCurrentAnswer}
          onSubmit={submitAnswer}
          onNext={nextQuestion}
        />
      ) : null}

      {state.phase === "result" ? (
        <CocktailTestResultPanel
          correctCount={resultStats.correctCount}
          incorrectCount={resultStats.incorrectCount}
          accuracy={resultStats.accuracy}
          incorrectResults={incorrectResults}
          detailById={state.detailById}
          onRetry={retryTest}
          onBackToSetup={() => backToSetup(true)}
          onBackToRecipes={() => {
            resetTest();
            void navigate({ to: "/cocktails" });
          }}
        />
      ) : null}

      <AlertDialog open={exitOpen} onOpenChange={setExitOpen}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>テストを終了しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              テストを終了してカクテルレシピに戻りますか？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setPendingExit(null);
              }}
            >
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmExit}>終了する</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

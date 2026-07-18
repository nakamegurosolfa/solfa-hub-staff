import { Button } from "@/components/ui/button";
import { CocktailTestResultDetailCard } from "@/components/ui-hub/cocktail-test/CocktailTestRecipeCard";
import type { CocktailDetail } from "@/lib/notion-types";
import type { CocktailTestQuestionResult } from "@/lib/cocktail-test-types";

type CocktailTestResultPanelProps = {
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
  incorrectResults: CocktailTestQuestionResult[];
  detailById: Record<string, CocktailDetail>;
  onRetry: () => void;
  onBackToSetup: () => void;
  onBackToRecipes: () => void;
};

export function CocktailTestResultPanel({
  correctCount,
  incorrectCount,
  accuracy,
  incorrectResults,
  detailById,
  onRetry,
  onBackToSetup,
  onBackToRecipes,
}: CocktailTestResultPanelProps) {
  const total = correctCount + incorrectCount;
  const hasIncorrect = incorrectResults.length > 0;

  return (
    <div className="flex flex-col gap-6 pb-8">
      <section className="card-surface px-5 py-8 text-center">
        <h2 className="text-[24px] font-bold leading-tight tracking-tight">
          {total}問お疲れさまでした！
        </h2>

        <dl className="mt-6 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-2xl border border-border bg-[var(--color-surface-2)] px-3 py-4">
            <dt className="text-[12px] text-muted-foreground">正解数</dt>
            <dd className="mt-1 text-[24px] font-bold text-primary">{correctCount}</dd>
          </div>
          <div className="rounded-2xl border border-border bg-[var(--color-surface-2)] px-3 py-4">
            <dt className="text-[12px] text-muted-foreground">不正解数</dt>
            <dd className="mt-1 text-[24px] font-bold text-destructive">{incorrectCount}</dd>
          </div>
          <div className="rounded-2xl border border-border bg-[var(--color-surface-2)] px-3 py-4">
            <dt className="text-[12px] text-muted-foreground">正答率</dt>
            <dd className="mt-1 text-[24px] font-bold">{accuracy}%</dd>
          </div>
        </dl>

        {!hasIncorrect ? (
          <p className="mt-5 text-[17px] font-semibold text-primary">全問正解です！</p>
        ) : (
          <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground">
            不正解だったカクテルは、完成済みレシピで確認できます。
          </p>
        )}
      </section>

      {hasIncorrect ? (
        <div className="flex flex-col gap-6">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            不正解だったカクテル
          </h3>
          {incorrectResults.map((result) => {
            const detail = detailById[result.cocktailId];
            if (!detail) return null;

            return (
              <CocktailTestResultDetailCard
                key={result.cocktailId}
                cocktail={detail}
                detail={detail}
                gradeResult={result.gradeResult}
                userAnswer={result.userAnswer}
              />
            );
          })}
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        <Button
          type="button"
          className="h-12 rounded-2xl text-base font-semibold"
          onClick={onRetry}
        >
          もう一度テストする
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-12 rounded-2xl text-base font-semibold"
          onClick={onBackToSetup}
        >
          ランクを選び直す
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="h-12 rounded-2xl text-base font-semibold"
          onClick={onBackToRecipes}
        >
          カクテルレシピに戻る
        </Button>
      </div>
    </div>
  );
}

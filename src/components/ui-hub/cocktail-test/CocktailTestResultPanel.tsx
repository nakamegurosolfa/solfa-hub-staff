import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CocktailCard } from "@/components/ui-hub/CocktailCard";
import type { CocktailSummary } from "@/lib/notion-types";

type CocktailTestResultPanelProps = {
  totalQuestions: number;
  incorrectCocktails: CocktailSummary[];
  onRetry: () => void;
  onBackToSetup: () => void;
  onBackToRecipes: () => void;
};

export function CocktailTestResultPanel({
  totalQuestions,
  incorrectCocktails,
  onRetry,
  onBackToSetup,
  onBackToRecipes,
}: CocktailTestResultPanelProps) {
  const hasIncorrect = incorrectCocktails.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <section className="card-surface px-5 py-8 text-center">
        <h2 className="text-[24px] font-bold leading-tight tracking-tight">
          {totalQuestions}問お疲れさまでした！
        </h2>

        {hasIncorrect ? (
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            間違ったカクテルのレシピはこちらです。
          </p>
        ) : (
          <div className="mt-5 flex flex-col items-center gap-2">
            <CheckCircle2 className="h-8 w-8 text-primary" aria-hidden />
            <p className="text-[17px] font-semibold text-primary">全問正解です！</p>
          </div>
        )}
      </section>

      {hasIncorrect ? (
        <div className="flex flex-col gap-3">
          {incorrectCocktails.map((cocktail) => (
            <CocktailCard key={cocktail.id} cocktail={cocktail} />
          ))}
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

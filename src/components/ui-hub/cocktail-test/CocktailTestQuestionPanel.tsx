import { Button } from "@/components/ui/button";
import { CocktailTestRecipeCard } from "@/components/ui-hub/cocktail-test/CocktailTestRecipeCard";
import {
  type CocktailTestGradeResult,
  type CocktailTestRecipeLine,
  type CocktailTestUserAnswer,
} from "@/lib/cocktail-test-recipe";
import type { CocktailDetail, CocktailSummary } from "@/lib/notion-types";

type CocktailTestQuestionPanelProps = {
  cocktail: CocktailSummary;
  detail: CocktailDetail;
  recipeLines: CocktailTestRecipeLine[];
  currentIndex: number;
  total: number;
  isReviewing: boolean;
  answer: CocktailTestUserAnswer;
  gradeResult: CocktailTestGradeResult | null;
  answerMessage: string | null;
  onAnswerChange: (answer: CocktailTestUserAnswer) => void;
  onSubmit: () => void;
  onNext: () => void;
};

export function CocktailTestQuestionPanel({
  cocktail,
  detail,
  recipeLines,
  currentIndex,
  total,
  isReviewing,
  answer,
  gradeResult,
  answerMessage,
  onAnswerChange,
  onSubmit,
  onNext,
}: CocktailTestQuestionPanelProps) {
  const isLast = currentIndex >= total - 1;

  return (
    <div className="flex flex-col gap-6 pb-8">
      <p className="text-center text-sm font-medium text-muted-foreground">
        {currentIndex + 1} / {total}
      </p>

      <CocktailTestRecipeCard
        cocktail={cocktail}
        detail={detail}
        recipeLines={recipeLines}
        mode={isReviewing ? "review" : "answering"}
        answer={answer}
        onAnswerChange={isReviewing ? undefined : onAnswerChange}
        gradeResult={gradeResult}
      />

      {answerMessage ? (
        <p
          className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.08] px-4 py-3 text-[13px] leading-relaxed text-amber-100/90"
          role="alert"
        >
          {answerMessage}
        </p>
      ) : null}

      {isReviewing ? (
        <Button
          type="button"
          className="h-12 w-full rounded-2xl text-base font-semibold"
          onClick={onNext}
        >
          {isLast ? "結果を見る" : "次の問題へ"}
        </Button>
      ) : (
        <Button
          type="button"
          className="h-12 w-full rounded-2xl text-base font-semibold"
          onClick={onSubmit}
        >
          回答する
        </Button>
      )}
    </div>
  );
}

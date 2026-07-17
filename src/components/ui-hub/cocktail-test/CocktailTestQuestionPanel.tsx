import { Button } from "@/components/ui/button";
import { formatTestRankLabel, normalizeLearningRank } from "@/lib/cocktail-test";
import type { CocktailSummary } from "@/lib/notion-types";

type CocktailTestQuestionPanelProps = {
  cocktail: CocktailSummary;
  currentIndex: number;
  total: number;
  isLoadingDetails: boolean;
  setupMessage: string | null;
  onNext: () => void;
};

export function CocktailTestQuestionPanel({
  cocktail,
  currentIndex,
  total,
  isLoadingDetails,
  setupMessage,
  onNext,
}: CocktailTestQuestionPanelProps) {
  const rank = normalizeLearningRank(cocktail.learningPriority);
  const isLast = currentIndex >= total - 1;

  return (
    <div className="flex flex-col gap-6">
      <p className="text-center text-sm font-medium text-muted-foreground">
        {currentIndex + 1} / {total}
      </p>

      <section className="card-surface px-5 py-8 text-center">
        {rank ? (
          <p className="text-sm font-semibold text-primary">{formatTestRankLabel(rank)}</p>
        ) : null}
        <h2 className="mt-3 break-words text-[28px] font-bold leading-tight tracking-tight">
          {cocktail.name}
        </h2>
        <p className="mt-6 whitespace-pre-line text-[16px] leading-relaxed text-muted-foreground">
          材料・分量・作り方を{"\n"}答えてください。
        </p>
      </section>

      {setupMessage ? (
        <p
          className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-[13px] leading-relaxed text-destructive"
          role="alert"
        >
          {setupMessage}
        </p>
      ) : null}

      <Button
        type="button"
        className="h-12 w-full rounded-2xl text-base font-semibold"
        disabled={isLoadingDetails}
        onClick={onNext}
      >
        {isLoadingDetails ? "読み込み中…" : isLast ? "採点へ進む" : "次の問題へ"}
      </Button>
    </div>
  );
}

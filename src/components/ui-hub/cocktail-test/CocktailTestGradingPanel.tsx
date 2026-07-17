import { Button } from "@/components/ui/button";
import { CocktailTestGradingRecipe } from "@/components/ui-hub/cocktail-test/CocktailTestGradingRecipe";
import { formatTestRankLabel, normalizeLearningRank } from "@/lib/cocktail-test";
import type { CocktailDetail, CocktailSummary } from "@/lib/notion-types";

const COCKTAIL_ACCENT = "var(--color-primary)";

type CocktailTestGradingPanelProps = {
  cocktail: CocktailSummary;
  detail: CocktailDetail | null;
  currentIndex: number;
  total: number;
  isTransitioning: boolean;
  onMark: (isCorrect: boolean) => void;
};

export function CocktailTestGradingPanel({
  cocktail,
  detail,
  currentIndex,
  total,
  isTransitioning,
  onMark,
}: CocktailTestGradingPanelProps) {
  const rank = normalizeLearningRank(cocktail.learningPriority);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[22px] font-bold tracking-tight">採点</h2>
        <p className="mt-2 text-sm font-medium text-muted-foreground">
          {currentIndex + 1} / {total}
        </p>
      </div>

      <section className="card-surface p-5">
        {rank ? (
          <p className="text-sm font-semibold text-primary">{formatTestRankLabel(rank)}</p>
        ) : null}
        <h3 className="mt-2 break-words text-[24px] font-bold leading-tight tracking-tight">
          {cocktail.name}
        </h3>

        {detail ? (
          <CocktailTestGradingRecipe cocktail={detail} accent={COCKTAIL_ACCENT} />
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">レシピを読み込んでいます…</p>
        )}
      </section>

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          className="h-12 rounded-2xl text-base font-semibold"
          disabled={!detail || isTransitioning}
          onClick={() => onMark(true)}
        >
          ○ 正解
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-12 rounded-2xl text-base font-semibold"
          disabled={!detail || isTransitioning}
          onClick={() => onMark(false)}
        >
          × 不正解
        </Button>
      </div>
    </div>
  );
}

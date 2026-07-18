import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CocktailRecipeSections } from "@/components/ui-hub/CocktailRecipeSections";
import { formatTestRankLabel, normalizeLearningRank } from "@/lib/cocktail-test";
import {
  COCKTAIL_PREPARATION_METHODS,
  COCKTAIL_PREPARATION_METHOD_LABELS,
  formatPreparationMethodLabel,
} from "@/lib/cocktail-preparation-method";
import {
  describeIncorrectReasons,
  extractRecipeLinesFromDetail,
  formatUserIngredientDisplay,
  type CocktailTestGradeResult,
  type CocktailTestRecipeLine,
  type CocktailTestUserAnswer,
} from "@/lib/cocktail-test-recipe";
import { formatDifficulty } from "@/lib/cocktail-difficulty";
import type { CocktailDetail, CocktailSummary } from "@/lib/notion-types";

const COCKTAIL_ACCENT = "var(--color-primary)";
const RECIPE_TEXT = "text-[17px] font-medium leading-8 text-foreground";
const LIQUEUR_SUFFIX = "リキュール";

const INPUT_CLASS =
  "min-h-[44px] min-w-0 rounded-xl border border-border bg-background px-3 text-[16px] text-foreground outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20";

const NUMERIC_INPUT_CLASS =
  "min-h-[44px] w-[72px] shrink-0 rounded-xl border border-border bg-background px-2 text-center text-[16px] tabular-nums text-foreground outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20 sm:w-20";

const LIQUEUR_INPUT_CLASS =
  "w-[5.5rem] shrink-0 px-2 sm:w-[6.5rem]";

function splitPriceDisplay(price?: string): { prefix: string; suffix: string } {
  const trimmed = price?.trim() ?? "";
  if (!trimmed) return { prefix: "¥", suffix: "" };
  if (/^[¥￥]/.test(trimmed)) {
    return { prefix: "¥", suffix: trimmed.includes("円") ? "円" : "" };
  }
  if (/円$/.test(trimmed)) {
    return { prefix: "", suffix: "円" };
  }
  return { prefix: "¥", suffix: "" };
}

function MetaRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-[15px] font-medium">{value}</span>
    </div>
  );
}

type CocktailTestRecipeCardProps = {
  cocktail: CocktailSummary;
  detail: CocktailDetail;
  recipeLines: CocktailTestRecipeLine[];
  mode: "answering" | "review";
  answer: CocktailTestUserAnswer;
  onAnswerChange?: (answer: CocktailTestUserAnswer) => void;
  gradeResult?: CocktailTestGradeResult | null;
};

export function CocktailTestRecipeCard({
  cocktail,
  detail,
  recipeLines,
  mode,
  answer,
  onAnswerChange,
  gradeResult,
}: CocktailTestRecipeCardProps) {
  const rank = normalizeLearningRank(cocktail.learningPriority);
  const priceDisplay = splitPriceDisplay(detail.price);
  const isReview = mode === "review";
  const isCorrect = gradeResult?.isCorrect ?? false;

  const updateLine = (index: number, patch: Partial<CocktailTestUserAnswer["lines"][number]>) => {
    if (!onAnswerChange) return;
    onAnswerChange({
      ...answer,
      lines: answer.lines.map((line, lineIndex) =>
        lineIndex === index ? { ...line, ...patch } : line,
      ),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {isReview && gradeResult ? (
        <div
          className={`rounded-3xl border px-5 py-6 text-center ${
            isCorrect
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
          role="status"
        >
          <p className="text-[32px] font-bold leading-none sm:text-[40px]">
            {isCorrect ? "⭕ 正解！" : "❌ 不正解"}
          </p>
          {!isCorrect ? (
            <p className="mt-3 text-[14px] font-normal leading-relaxed text-destructive/90 sm:text-[15px]">
              {describeIncorrectReasons(gradeResult).join(" / ")}
            </p>
          ) : null}
        </div>
      ) : null}

      <section className="card-surface p-5">
        {rank ? (
          <p className="text-sm font-semibold text-primary">{formatTestRankLabel(rank)}</p>
        ) : null}

        <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-2">
          <h2 className="min-w-0 flex-1 break-words text-[24px] font-bold leading-tight tracking-tight">
            {cocktail.name}
          </h2>
          <div className="flex shrink-0 items-center gap-1 text-[17px] font-semibold tabular-nums text-primary">
            {isReview ? (
              <span>{detail.price}</span>
            ) : (
              <>
                {priceDisplay.prefix ? <span>{priceDisplay.prefix}</span> : null}
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  aria-label="販売価格"
                  placeholder="価格"
                  value={answer.price}
                  onChange={(event) =>
                    onAnswerChange?.({ ...answer, price: event.target.value })
                  }
                  className={`${NUMERIC_INPUT_CLASS} w-[88px] sm:w-24`}
                />
                {priceDisplay.suffix ? <span>{priceDisplay.suffix}</span> : null}
              </>
            )}
          </div>
        </div>

        {!isReview ? (
          <>
            <section className="mt-5 rounded-2xl border border-primary/30 bg-primary/[0.04] p-5">
              <h3 className="mb-4 text-sm font-semibold tracking-tight text-primary">レシピ</h3>
              <ul className="flex flex-col gap-4">
                {recipeLines.map((line, index) => {
                  const userLine = answer.lines[index];

                  return (
                    <li
                      key={`${line.raw}-${index}`}
                      className={`flex min-w-0 flex-wrap items-center gap-x-2 gap-y-2 ${RECIPE_TEXT}`}
                    >
                      {line.liqueurSplit ? (
                        <span className="inline-flex shrink-0 items-center gap-1.5">
                          <input
                            type="text"
                            autoComplete="off"
                            aria-label={`材料${index + 1}行目のリキュール名`}
                            placeholder="例: アップル"
                            value={userLine?.ingredientName ?? ""}
                            onChange={(event) =>
                              updateLine(index, { ingredientName: event.target.value })
                            }
                            className={`${INPUT_CLASS} ${LIQUEUR_INPUT_CLASS}`}
                          />
                          <span className="shrink-0 text-foreground/90">{LIQUEUR_SUFFIX}</span>
                        </span>
                      ) : (
                        <input
                          type="text"
                          autoComplete="off"
                          aria-label={`材料${index + 1}行目の材料名`}
                          placeholder="材料名を入力"
                          value={userLine?.ingredientName ?? ""}
                          onChange={(event) =>
                            updateLine(index, { ingredientName: event.target.value })
                          }
                          className={`${INPUT_CLASS} min-w-[8rem] flex-1`}
                        />
                      )}

                      {line.kind === "ml" ? (
                        <span className="ml-auto flex shrink-0 items-center gap-1 pl-2 font-semibold tabular-nums text-primary">
                          <input
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            aria-label={`材料${index + 1}行目のml量`}
                            placeholder="量"
                            value={userLine?.mlAmount ?? ""}
                            onChange={(event) =>
                              updateLine(index, { mlAmount: event.target.value })
                            }
                            className={NUMERIC_INPUT_CLASS}
                          />
                          <span>ml</span>
                        </span>
                      ) : line.kind === "fixed" ? (
                        <span className="ml-auto shrink-0 pl-4 font-semibold tabular-nums text-primary">
                          {line.fixedSuffix}
                        </span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="mt-5 rounded-2xl border border-border/70 bg-[var(--color-surface-2)] p-5">
              <h3 className="text-sm font-semibold tracking-tight text-foreground">作り方</h3>
              <RadioGroup
                value={answer.method}
                onValueChange={(value) =>
                  onAnswerChange?.({
                    ...answer,
                    method: value as CocktailTestUserAnswer["method"],
                  })
                }
                className="mt-4 flex flex-col gap-3"
              >
                {COCKTAIL_PREPARATION_METHODS.map((method) => {
                  const id = `cocktail-test-method-${method}`;
                  return (
                    <div key={method} className="flex items-center gap-3">
                      <RadioGroupItem id={id} value={method} />
                      <Label htmlFor={id} className="cursor-pointer text-[16px] font-medium">
                        {COCKTAIL_PREPARATION_METHOD_LABELS[method]}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </section>
          </>
        ) : null}

        {isReview && gradeResult && !isCorrect ? (
          <section className="mt-4 rounded-2xl border border-border/70 bg-[var(--color-surface-2)] px-4 py-3">
            <h3 className="text-[13px] font-semibold text-foreground">あなたの回答</h3>
            <ul className="mt-2 space-y-1 text-[12px] leading-relaxed text-muted-foreground">
              {gradeResult.reasons.includes("price") ? (
                <li>価格: {answer.price || "未入力"}</li>
              ) : null}
              {gradeResult.reasons.includes("method") ? (
                <li>作り方: {formatPreparationMethodLabel(answer.method) || "未選択"}</li>
              ) : null}
              {answer.lines.map((userLine, index) => {
                const line = recipeLines[index];
                if (!line) return null;

                return (
                  <li key={`${line.raw}-${index}`}>
                    {formatUserIngredientDisplay(line, userLine) || "未入力"}
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {isReview ? (
          <>
            <section className="mt-4">
              <MetaRow
                label="作り方"
                value={formatPreparationMethodLabel(detail.preparationMethod)}
              />
              <MetaRow label="グラス" value={detail.glass} />
              <MetaRow label="氷" value={detail.ice} />
              <MetaRow label="難易度" value={formatDifficulty(detail.difficulty)} />
            </section>

            <div className="-mx-5 mt-2">
              <CocktailRecipeSections blocks={detail.blocks} accent={COCKTAIL_ACCENT} />
            </div>

            {detail.imageUrl ? (
              <section className="mt-4">
                <h3 className="mb-3 text-sm font-semibold tracking-tight text-foreground">
                  完成イメージ
                </h3>
                <figure className="overflow-hidden rounded-2xl border border-border">
                  <img
                    src={detail.imageUrl}
                    alt={`${detail.name}の完成イメージ`}
                    className="aspect-[4/3] w-full object-cover"
                  />
                </figure>
              </section>
            ) : null}
          </>
        ) : null}
      </section>
    </div>
  );
}

export function CocktailTestResultDetailCard({
  cocktail,
  detail,
  gradeResult,
  userAnswer,
}: {
  cocktail: CocktailSummary;
  detail: CocktailDetail;
  gradeResult: CocktailTestGradeResult;
  userAnswer: CocktailTestUserAnswer;
}) {
  return (
    <CocktailTestRecipeCard
      cocktail={cocktail}
      detail={detail}
      recipeLines={extractRecipeLinesFromDetail(detail)}
      mode="review"
      answer={userAnswer}
      gradeResult={gradeResult}
    />
  );
}

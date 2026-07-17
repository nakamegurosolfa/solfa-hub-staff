import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { formatTestRankLabel } from "@/lib/cocktail-test";
import type { CocktailTestQuestionCount, CocktailTestRank } from "@/lib/cocktail-test-types";

type CocktailTestSetupPanelProps = {
  ranks: readonly CocktailTestRank[];
  selectedRanks: CocktailTestRank[];
  questionCount: CocktailTestQuestionCount;
  setupMessage: string | null;
  canStartTest: boolean;
  onToggleRank: (rank: CocktailTestRank, checked: boolean) => void;
  onQuestionCountChange: (value: CocktailTestQuestionCount) => void;
  onStart: () => void;
};

export function CocktailTestSetupPanel({
  ranks,
  selectedRanks,
  questionCount,
  setupMessage,
  canStartTest,
  onToggleRank,
  onQuestionCountChange,
  onStart,
}: CocktailTestSetupPanelProps) {
  const hasSelectedRanks = selectedRanks.length > 0;

  return (
    <div className="flex flex-col gap-6 pb-8">
      <section className="card-surface p-5">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">テストするランク</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">1つ以上選択してください。</p>
        <div className="mt-4 flex flex-col gap-3">
          {ranks.map((rank) => {
            const id = `cocktail-test-rank-${rank}`;
            const checked = selectedRanks.includes(rank);
            return (
              <div key={rank} className="flex items-center gap-3">
                <Checkbox
                  id={id}
                  checked={checked}
                  onCheckedChange={(value) => onToggleRank(rank, value === true)}
                />
                <Label htmlFor={id} className="cursor-pointer text-[15px] font-medium">
                  {formatTestRankLabel(rank)}
                </Label>
              </div>
            );
          })}
        </div>
        {!hasSelectedRanks ? (
          <p className="mt-4 text-[13px] text-muted-foreground">
            ランクを選択するとテストを開始できます。
          </p>
        ) : null}
      </section>

      <section className="card-surface p-5">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">問題数</h2>
        <RadioGroup
          value={questionCount}
          onValueChange={(value) => onQuestionCountChange(value as CocktailTestQuestionCount)}
          className="mt-4 flex flex-col gap-3"
        >
          {(
            [
              { value: "10", label: "10問" },
              { value: "20", label: "20問" },
              { value: "all", label: "全問" },
            ] as const
          ).map(({ value, label }) => {
            const id = `cocktail-test-count-${value}`;
            return (
              <div key={value} className="flex items-center gap-3">
                <RadioGroupItem id={id} value={value} />
                <Label htmlFor={id} className="cursor-pointer text-[15px] font-medium">
                  {label}
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      </section>

      {setupMessage ? (
        <p
          className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.08] px-4 py-3 text-[13px] leading-relaxed text-amber-100/90"
          role="alert"
        >
          {setupMessage}
        </p>
      ) : null}

      <Button
        type="button"
        className="h-12 w-full rounded-2xl text-base font-semibold"
        disabled={!canStartTest || !hasSelectedRanks}
        onClick={onStart}
      >
        テストを開始する
      </Button>
    </div>
  );
}

import { getBreakExpectedEndAtLabel } from "@/lib/break-countdown";

type BreakCountdownDisplayProps = {
  businessDate: string;
  startAt: string;
};

export function BreakCountdownDisplay({ businessDate, startAt }: BreakCountdownDisplayProps) {
  const endAtLabel = getBreakExpectedEndAtLabel(businessDate, startAt);

  return (
    <div className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-6 text-center">
      <p className="text-xs font-medium text-muted-foreground">休憩終了予定</p>
      <p className="mt-2 font-mono text-[4.5rem] font-bold leading-none tabular-nums tracking-tight text-primary sm:text-8xl">
        {endAtLabel}
      </p>
    </div>
  );
}

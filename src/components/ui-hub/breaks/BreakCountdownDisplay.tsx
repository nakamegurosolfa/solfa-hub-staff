import { formatBreakCountdownLabel } from "@/lib/break-countdown";
import { useBreakCountdown } from "@/hooks/use-break-countdown";

type BreakCountdownDisplayProps = {
  businessDate: string;
  startAt: string;
};

export function BreakCountdownDisplay({ businessDate, startAt }: BreakCountdownDisplayProps) {
  const remainingSeconds = useBreakCountdown(businessDate, startAt);
  const label = formatBreakCountdownLabel(remainingSeconds);

  return (
    <div className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-6 text-center">
      <p className="text-xs font-medium text-muted-foreground">休憩残り時間</p>
      <p
        className="mt-2 font-mono text-[4.5rem] font-bold leading-none tabular-nums tracking-tight text-primary sm:text-8xl"
        aria-live="polite"
        aria-atomic="true"
      >
        {label}
      </p>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  formatMinutesLabel,
  formatTimeInputValue,
  formatTimeLabel,
  getBreakDurationMinutes,
  type BreakEntry,
} from "@/lib/break-management";

type BreakSlotRowProps = {
  index: number;
  entry: BreakEntry;
  disabled?: boolean;
  onStart: () => void;
  onEnd: () => void;
  onEditStart: (hhmm: string) => void;
  onEditEnd: (hhmm: string) => void;
};

const BREAK_LABELS = ["休憩①", "休憩②", "休憩③", "休憩④"] as const;

export function BreakSlotRow({
  index,
  entry,
  disabled = false,
  onStart,
  onEnd,
  onEditStart,
  onEditEnd,
}: BreakSlotRowProps) {
  const hasStart = Boolean(entry.startAt);
  const hasEnd = Boolean(entry.endAt);
  const duration = getBreakDurationMinutes(entry);

  return (
    <div className="rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">{BREAK_LABELS[index]}</p>
        {hasEnd ? (
          <p className="text-sm text-muted-foreground">{formatMinutesLabel(duration)}</p>
        ) : null}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button type="button" size="sm" disabled={disabled || hasStart} onClick={onStart}>
          開始
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={disabled || !hasStart || hasEnd}
          onClick={onEnd}
        >
          終了
        </Button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-medium text-muted-foreground">開始</p>
          {hasStart ? (
            <Input
              type="time"
              value={formatTimeInputValue(entry.startAt)}
              onChange={(e) => onEditStart(e.target.value)}
              className="h-9"
              disabled={disabled}
            />
          ) : (
            <p className="py-2 text-sm text-muted-foreground">{formatTimeLabel(entry.startAt)}</p>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-[11px] font-medium text-muted-foreground">終了</p>
          {hasEnd ? (
            <Input
              type="time"
              value={formatTimeInputValue(entry.endAt)}
              onChange={(e) => onEditEnd(e.target.value)}
              className="h-9"
              disabled={disabled}
            />
          ) : (
            <p className="py-2 text-sm text-muted-foreground">{formatTimeLabel(entry.endAt)}</p>
          )}
        </div>
      </div>
    </div>
  );
}

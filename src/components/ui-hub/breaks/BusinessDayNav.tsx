import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  formatBusinessDateLabel,
  shiftBusinessDate,
} from "@/lib/break-management";

type BusinessDayNavProps = {
  businessDate: string;
  onChange: (dateKey: string) => void;
};

export function BusinessDayNav({ businessDate, onChange }: BusinessDayNavProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-3">
      <button
        type="button"
        className="tap grid h-10 w-10 place-items-center rounded-xl border border-border text-muted-foreground hover:bg-[var(--color-surface-2)]"
        onClick={() => onChange(shiftBusinessDate(businessDate, -1))}
        aria-label="前日"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <div className="min-w-0 text-center">
        <p className="text-[11px] font-semibold tracking-wider text-muted-foreground">営業日</p>
        <p className="mt-0.5 truncate text-sm font-semibold">{formatBusinessDateLabel(businessDate)}</p>
      </div>
      <button
        type="button"
        className="tap grid h-10 w-10 place-items-center rounded-xl border border-border text-muted-foreground hover:bg-[var(--color-surface-2)]"
        onClick={() => onChange(shiftBusinessDate(businessDate, 1))}
        aria-label="翌日"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

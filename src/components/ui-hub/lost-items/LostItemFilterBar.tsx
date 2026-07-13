import type { LostItemFilter } from "@/lib/lost-items-types";

const FILTERS: { id: LostItemFilter; label: string }[] = [
  { id: "all", label: "すべて" },
  { id: "pending-handover", label: "未受け渡し" },
  { id: "handed-over", label: "受け渡し済み" },
  { id: "overdue", label: "期限超過" },
  { id: "disposed", label: "処分済み" },
];

type LostItemFilterBarProps = {
  value: LostItemFilter;
  onChange: (value: LostItemFilter) => void;
};

export function LostItemFilterBar({ value, onChange }: LostItemFilterBarProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {FILTERS.map((filter) => {
        const active = value === filter.id;
        return (
          <button
            key={filter.id}
            type="button"
            className={`tap shrink-0 rounded-full px-3 py-2 text-[12px] font-medium ${
              active
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-[var(--color-surface)] text-muted-foreground"
            }`}
            onClick={() => onChange(filter.id)}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}

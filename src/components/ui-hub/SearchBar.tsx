import { Search } from "lucide-react";

export function SearchBar({
  value,
  onChange,
  placeholder = "Search",
  readOnly = false,
  onActivate,
  autoFocus = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  onActivate?: () => void;
  autoFocus?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-3">
      <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={readOnly ? onActivate : undefined}
        onClick={readOnly ? onActivate : undefined}
        readOnly={readOnly}
        autoFocus={autoFocus}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
        type="search"
        autoComplete="off"
      />
    </label>
  );
}

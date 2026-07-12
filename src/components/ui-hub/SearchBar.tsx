import { Search } from "lucide-react";
import type { Ref } from "react";

const shellClassName =
  "relative z-10 flex items-center gap-2 rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-3";

const inputClassName =
  "relative z-10 min-w-0 flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none pointer-events-auto touch-manipulation";

export function SearchBar({
  value,
  onChange,
  placeholder = "Search",
  readOnly = false,
  onActivate,
  autoFocus = false,
  onSubmit,
  inputRef,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  onActivate?: () => void;
  autoFocus?: boolean;
  onSubmit?: () => void;
  inputRef?: Ref<HTMLInputElement>;
}) {
  if (readOnly && onActivate) {
    return (
      <button
        type="button"
        onClick={onActivate}
        className={`${shellClassName} w-full touch-manipulation text-left`}
        aria-label={placeholder}
      >
        <Search className="pointer-events-none h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
        <span className="pointer-events-none min-w-0 flex-1 text-base text-muted-foreground">{placeholder}</span>
      </button>
    );
  }

  return (
    <label className={shellClassName}>
      <Search className="pointer-events-none h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onSubmit?.();
          }
        }}
        autoFocus={autoFocus}
        placeholder={placeholder}
        className={inputClassName}
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        inputMode="search"
        style={{ fontSize: "16px" }}
      />
    </label>
  );
}

import { Link } from "@tanstack/react-router";
import { ChevronRight, Search } from "lucide-react";
import { HOME_SEARCH_BUTTON_LABEL } from "@/data/app-sections";

export function HomeSearchButton() {
  return (
    <Link
      to="/search"
      className="tap relative z-10 grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-3 hover:bg-[var(--color-surface-2)] touch-manipulation"
      aria-label={HOME_SEARCH_BUTTON_LABEL}
    >
      <Search className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
      <span className="min-w-0 truncate text-base text-muted-foreground">{HOME_SEARCH_BUTTON_LABEL}</span>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
    </Link>
  );
}

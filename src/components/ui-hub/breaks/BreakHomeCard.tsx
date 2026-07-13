import { ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { breakHomeSection } from "@/data/app-sections";

export function BreakHomeCard() {
  const section = breakHomeSection;

  return (
    <Link
      to={section.to}
      className="tap grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-3xl border border-border bg-[var(--color-surface)] px-5 py-5 hover:bg-[var(--color-surface-2)]"
    >
      <span
        className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl"
        style={{ backgroundColor: section.color + "1F" }}
        aria-hidden
      >
        {section.emoji}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[17px] font-semibold tracking-tight">{section.title}</span>
        <span className="mt-1 block truncate text-[13px] text-muted-foreground">{section.description}</span>
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
    </Link>
  );
}

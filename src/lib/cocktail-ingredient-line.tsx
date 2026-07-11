import type { ReactNode } from "react";

export function formatIngredientLine(text: string): ReactNode {
  const match = text.match(/^(.+?)(\d+(?:\.\d+)?\s*(?:ml|mL|g|個|枚|oz|dash|cc|滴)?)$/i);
  if (!match) return text;

  return (
    <>
      <span className="min-w-0 text-foreground/90">{match[1].trim()}</span>
      <span className="shrink-0 pl-4 font-semibold tabular-nums text-primary">{match[2].trim()}</span>
    </>
  );
}

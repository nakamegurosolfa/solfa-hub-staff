import { Link, useRouteContext } from "@tanstack/react-router";
import { ChevronRight, GlassWater } from "lucide-react";

import { EmployeeOnlyBadge } from "@/components/auth/PasswordGateScreen";
import { formatDifficulty } from "@/lib/cocktail-difficulty";
import type { CocktailSummary } from "@/lib/notion-types";
import { CocktailCardBadges } from "@/components/ui-hub/CocktailMetaBadges";

const COCKTAIL_COLOR = "var(--color-primary)";

export function CocktailCard({ cocktail }: { cocktail: CocktailSummary }) {
  const { auth } = useRouteContext({ from: "__root__" });
  const difficulty = formatDifficulty(cocktail.difficulty);
  const meta = [cocktail.category, cocktail.price, difficulty].filter(Boolean).join(" · ");
  const needsEmployeeAuth = cocktail.employeeOnly && !auth.employeeAuthenticated;
  const redirectPath = `/cocktails/${cocktail.id}`;

  return (
    <Link
      to={needsEmployeeAuth ? "/employee-login" : "/cocktails/$id"}
      params={needsEmployeeAuth ? undefined : { id: cocktail.id }}
      search={needsEmployeeAuth ? { redirect: redirectPath } : undefined}
      className="tap grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-3xl border border-border bg-[var(--color-surface)] px-5 py-5 hover:bg-[var(--color-surface-2)]"
    >
      {cocktail.imageUrl ? (
        <span className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-border/60">
          <img src={cocktail.imageUrl} alt={cocktail.name} className="h-full w-full object-cover" />
        </span>
      ) : (
        <span
          className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl"
          style={{ backgroundColor: COCKTAIL_COLOR + "1F", color: COCKTAIL_COLOR }}
          aria-hidden
        >
          <GlassWater className="h-7 w-7" strokeWidth={1.6} />
        </span>
      )}

      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-2">
          <span className="block truncate text-[17px] font-semibold tracking-tight">{cocktail.name}</span>
          {cocktail.employeeOnly ? <EmployeeOnlyBadge /> : null}
          {cocktail.recommended ? (
            <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
              おすすめ
            </span>
          ) : null}
        </span>
        {cocktail.learningPriority || cocktail.orderFrequency ? (
          <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <CocktailCardBadges
              learningPriority={cocktail.learningPriority}
              orderFrequency={cocktail.orderFrequency}
            />
          </span>
        ) : null}
        {meta ? (
          <span className="mt-1 block truncate text-[13px] text-muted-foreground">{meta}</span>
        ) : null}
        {cocktail.ingredientTags.length > 0 ? (
          <span className="mt-1 block truncate text-[12px] text-muted-foreground/80">
            {cocktail.ingredientTags.join(" · ")}
          </span>
        ) : null}
      </span>

      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
    </Link>
  );
}

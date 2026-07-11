import { AlertTriangle } from "lucide-react";

import { NotionBlockList } from "@/components/ui-hub/NotionContent";
import { formatIngredientLine } from "@/lib/cocktail-ingredient-line";
import {
  hasCocktailRecipeContent,
  splitCocktailRecipeSections,
} from "@/lib/cocktail-recipe-sections";
import type { NotionBlock } from "@/lib/notion-types";

const RECIPE_TEXT = "text-[17px] font-medium leading-8 text-foreground";
const STEP_TEXT = "text-[16px] leading-8 text-foreground/95";

function RecipeSection({
  title,
  blocks,
  accent,
  className,
  titleClassName,
  bulletClassName,
  paragraphClassName,
  bulletListClassName,
  numberedListClassName,
  containerClassName,
  formatListItemText,
  titleIcon,
}: {
  title: string;
  blocks: NotionBlock[];
  accent: string;
  className?: string;
  titleClassName?: string;
  bulletClassName?: string;
  paragraphClassName?: string;
  bulletListClassName?: string;
  numberedListClassName?: string;
  containerClassName?: string;
  formatListItemText?: (text: string) => React.ReactNode;
  titleIcon?: React.ReactNode;
}) {
  if (blocks.length === 0) return null;

  return (
    <section className={`card-surface mt-4 p-5 ${className ?? ""}`}>
      <div className={`mb-5 flex items-center gap-2 ${titleClassName ?? ""}`}>
        {titleIcon}
        <h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2>
      </div>
      <NotionBlockList
        blocks={blocks}
        accent={accent}
        bulletClassName={bulletClassName}
        paragraphClassName={paragraphClassName}
        bulletListClassName={bulletListClassName}
        numberedListClassName={numberedListClassName}
        containerClassName={containerClassName}
        formatListItemText={formatListItemText}
      />
    </section>
  );
}

export function CocktailRecipeSections({
  blocks,
  accent,
}: {
  blocks: NotionBlock[];
  accent: string;
}) {
  const sections = splitCocktailRecipeSections(blocks);

  if (!hasCocktailRecipeContent(sections)) {
    return (
      <p className="mt-4 rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-6 text-center text-sm text-muted-foreground">
        レシピ情報がありません。
      </p>
    );
  }

  return (
    <>
      <RecipeSection
        title="レシピ"
        blocks={sections.recipe}
        accent={accent}
        className="border border-primary/30 bg-primary/[0.04] p-6"
        titleClassName="text-primary"
        bulletClassName={RECIPE_TEXT}
        paragraphClassName={RECIPE_TEXT}
        bulletListClassName="space-y-4"
        containerClassName="flex flex-col gap-5"
        formatListItemText={formatIngredientLine}
      />
      <RecipeSection
        title="作り方"
        blocks={sections.instructions}
        accent={accent}
        bulletClassName={STEP_TEXT}
        paragraphClassName={STEP_TEXT}
        bulletListClassName="space-y-4"
        numberedListClassName="space-y-5"
        containerClassName="flex flex-col gap-5"
      />
      <RecipeSection
        title="注意"
        blocks={sections.notes}
        accent={accent}
        className="border border-amber-500/30 bg-amber-500/[0.08]"
        titleClassName="text-amber-200"
        titleIcon={<AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" aria-hidden />}
        bulletClassName="text-[15px] leading-relaxed text-amber-50/90"
        paragraphClassName="text-[15px] leading-relaxed text-amber-50/90"
        bulletListClassName="space-y-3"
        containerClassName="flex flex-col gap-4"
      />
    </>
  );
}

import type { ReactNode } from "react";

import { NotionBlockList } from "@/components/ui-hub/NotionContent";
import { formatIngredientLine } from "@/lib/cocktail-ingredient-line";
import {
  hasCocktailRecipeContent,
  splitCocktailRecipeSections,
} from "@/lib/cocktail-recipe-sections";
import type { CocktailDetail } from "@/lib/notion-types";

const RECIPE_TEXT = "text-[16px] font-medium leading-8 text-foreground";
const STEP_TEXT = "text-[15px] leading-8 text-foreground/95";

function GradingSection({
  title,
  blocks,
  accent,
  formatListItemText,
}: {
  title: string;
  blocks: CocktailDetail["blocks"];
  accent: string;
  formatListItemText?: (text: string) => ReactNode;
}) {
  if (blocks.length === 0) return null;

  return (
    <section className="mt-4">
      <h3 className="mb-3 text-sm font-semibold tracking-tight text-foreground">{title}</h3>
      <NotionBlockList
        blocks={blocks}
        accent={accent}
        bulletClassName={formatListItemText ? RECIPE_TEXT : STEP_TEXT}
        paragraphClassName={formatListItemText ? RECIPE_TEXT : STEP_TEXT}
        bulletListClassName="space-y-3"
        numberedListClassName="space-y-4"
        containerClassName="flex flex-col gap-4"
        formatListItemText={formatListItemText}
      />
    </section>
  );
}

export function CocktailTestGradingRecipe({
  cocktail,
  accent,
}: {
  cocktail: CocktailDetail;
  accent: string;
}) {
  const sections = splitCocktailRecipeSections(cocktail.blocks);

  if (!hasCocktailRecipeContent(sections)) {
    return <p className="mt-4 text-sm text-muted-foreground">レシピ情報がありません。</p>;
  }

  return (
    <div className="mt-4">
      <GradingSection
        title="材料・分量"
        blocks={sections.recipe}
        accent={accent}
        formatListItemText={formatIngredientLine}
      />
      <GradingSection title="作り方" blocks={sections.instructions} accent={accent} />
      {sections.notes.length > 0 ? (
        <GradingSection title="メモ" blocks={sections.notes} accent={accent} />
      ) : null}
      {cocktail.imageUrl ? (
        <section className="mt-4">
          <h3 className="mb-3 text-sm font-semibold tracking-tight text-foreground">
            完成イメージ
          </h3>
          <figure className="overflow-hidden rounded-2xl border border-border">
            <img
              src={cocktail.imageUrl}
              alt={`${cocktail.name}の完成イメージ`}
              className="aspect-[4/3] w-full object-cover"
            />
          </figure>
        </section>
      ) : null}
    </div>
  );
}

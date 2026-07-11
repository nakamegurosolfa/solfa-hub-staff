import type { NotionBlock } from "@/lib/notion-types";

export type CocktailRecipeSections = {
  recipe: NotionBlock[];
  instructions: NotionBlock[];
  notes: NotionBlock[];
};

type SectionKey = keyof CocktailRecipeSections | "finishImage" | "skip";

function headingText(block: NotionBlock) {
  return block.richText.map((item) => item.plain_text).join("").trim();
}

function classifySection(title: string): SectionKey {
  const normalized = title.replace(/\s/g, "");

  if (normalized.includes("完成イメージ") || normalized.includes("完成")) {
    return "finishImage";
  }
  if (normalized.includes("作り方")) {
    return "instructions";
  }
  if (normalized.includes("注意")) {
    return "notes";
  }
  if (normalized.includes("レシピ")) {
    return "recipe";
  }

  return "skip";
}

function isSectionHeading(block: NotionBlock) {
  return block.type === "heading_1" || block.type === "heading_2" || block.type === "heading_3";
}

export function splitCocktailRecipeSections(blocks: NotionBlock[]): CocktailRecipeSections {
  const sections: CocktailRecipeSections = {
    recipe: [],
    instructions: [],
    notes: [],
  };

  let current: SectionKey = "recipe";

  for (const block of blocks) {
    if (isSectionHeading(block)) {
      const kind = classifySection(headingText(block));
      if (kind !== "skip") {
        current = kind;
        continue;
      }
    }

    if (current === "finishImage" || current === "skip") {
      continue;
    }

    sections[current].push(block);
  }

  return sections;
}

export function hasCocktailRecipeContent(sections: CocktailRecipeSections) {
  return sections.recipe.length > 0 || sections.instructions.length > 0 || sections.notes.length > 0;
}

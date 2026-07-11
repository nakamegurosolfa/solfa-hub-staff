export type CocktailSearchable = {
  name: string;
  category?: string;
  glass?: string;
  ice?: string;
  difficulty?: string;
  ingredientTags: string[];
  price?: string;
  recipeText?: string;
};

export function cocktailSearchText(cocktail: CocktailSearchable) {
  return [
    cocktail.name,
    cocktail.category,
    cocktail.glass,
    cocktail.ice,
    cocktail.difficulty,
    cocktail.price,
    cocktail.recipeText,
    ...cocktail.ingredientTags,
  ]
    .filter(Boolean)
    .join(" ");
}

export function filterCocktails<T extends CocktailSearchable>(cocktails: T[], query: string) {
  const term = query.trim().toLowerCase();
  if (!term) return cocktails;

  return cocktails.filter((cocktail) => cocktailSearchText(cocktail).toLowerCase().includes(term));
}

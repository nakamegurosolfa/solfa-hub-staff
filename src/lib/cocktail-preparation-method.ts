export const COCKTAIL_PREPARATION_METHODS = ["Build", "Stir", "Shake"] as const;

export type CocktailPreparationMethod = (typeof COCKTAIL_PREPARATION_METHODS)[number];

export const COCKTAIL_PREPARATION_METHOD_LABELS: Record<CocktailPreparationMethod, string> = {
  Build: "ビルド",
  Stir: "ステア",
  Shake: "シェイク",
};

const PREPARATION_METHOD_ALIASES: Record<string, CocktailPreparationMethod> = {
  build: "Build",
  stir: "Stir",
  shake: "Shake",
  ビルド: "Build",
  ステア: "Stir",
  シェイク: "Shake",
};

export function normalizePreparationMethod(
  value?: string | null,
): CocktailPreparationMethod | undefined {
  if (!value?.trim()) return undefined;

  const trimmed = value.trim();
  return (
    PREPARATION_METHOD_ALIASES[trimmed] ??
    PREPARATION_METHOD_ALIASES[trimmed.toLowerCase()] ??
    PREPARATION_METHOD_ALIASES[trimmed.replace(/\s/g, "")]
  );
}

export function isValidPreparationMethod(
  value?: string | null,
): value is CocktailPreparationMethod {
  return normalizePreparationMethod(value) !== undefined;
}

export function formatPreparationMethodLabel(method?: CocktailPreparationMethod | ""): string {
  if (!method) return "";
  return COCKTAIL_PREPARATION_METHOD_LABELS[method];
}

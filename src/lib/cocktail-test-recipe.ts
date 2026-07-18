import { splitCocktailRecipeSections } from "@/lib/cocktail-recipe-sections";
import type { CocktailDetail } from "@/lib/notion-types";
import {
  COCKTAIL_PREPARATION_METHODS,
  isValidPreparationMethod,
  type CocktailPreparationMethod,
} from "@/lib/cocktail-preparation-method";

export { COCKTAIL_PREPARATION_METHODS };
export type { CocktailPreparationMethod };

export type CocktailTestRecipeLineKind = "ml" | "fixed" | "name_only";

export type CocktailTestRecipeLine = {
  raw: string;
  ingredientName: string;
  kind: CocktailTestRecipeLineKind;
  mlAmount?: string;
  fixedSuffix?: string;
  liqueurSplit?: boolean;
};

export type CocktailTestUserLineAnswer = {
  ingredientName: string;
  mlAmount?: string;
};

export type CocktailTestUserAnswer = {
  price: string;
  method: CocktailPreparationMethod | "";
  lines: CocktailTestUserLineAnswer[];
};

export type CocktailTestIncorrectReason =
  | "ingredient_name"
  | "amount"
  | "price"
  | "method"
  | "missing_input";

export type CocktailTestIngredientIssueKind = "missing" | "extra" | "wrong_amount" | "duplicate";

export type CocktailTestIngredientIssue = {
  kind: CocktailTestIngredientIssueKind;
  label: string;
};

export type CocktailTestGradeResult = {
  isCorrect: boolean;
  reasons: CocktailTestIncorrectReason[];
  ingredientIssues: CocktailTestIngredientIssue[];
};

const FIXED_SUFFIXES = [
  "1dash",
  "2dash",
  "1tsp",
  "2tsp",
  "3滴",
  "適量",
  "少量",
  "満たす",
  "半分",
  "少し",
  "UP",
] as const;

type ComparableIngredient = {
  name: string;
  amount: number | null;
  unit: string | null;
  displayLabel: string;
};

const LIQUEUR_SUFFIX = "リキュール";

export function isLiqueurIngredientName(name: string): boolean {
  return name.endsWith(LIQUEUR_SUFFIX) && name.length > LIQUEUR_SUFFIX.length;
}

export function resolveIngredientName(
  line: CocktailTestRecipeLine,
  userInput: string,
): string {
  const trimmed = userInput.trim();
  if (!line.liqueurSplit) return trimmed;
  if (trimmed.endsWith(LIQUEUR_SUFFIX)) return trimmed;
  return `${trimmed}${LIQUEUR_SUFFIX}`;
}

export function formatUserIngredientDisplay(
  line: CocktailTestRecipeLine,
  userLine: CocktailTestUserLineAnswer,
): string {
  const name = resolveIngredientName(line, userLine.ingredientName);
  if (line.kind === "ml" && userLine.mlAmount?.trim()) {
    return `${name} ${userLine.mlAmount.trim()}ml`;
  }
  return name;
}

export function normalizeIngredientName(value: string): string {
  return value
    .replace(/\u3000/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[Ａ-Ｚａ-ｚ]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .toLowerCase();
}

export function parsePriceNumber(price?: string): number | null {
  if (!price?.trim()) return null;
  return normalizeNumericInput(price);
}

export function normalizeNumericInput(value: string): number | null {
  const normalized = value
    .replace(/\u3000/g, "")
    .replace(/[０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .replace(/[,\s¥￥円mlMLｍｌ]/g, "")
    .trim();

  if (!normalized) return null;

  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric : null;
}

function withLiqueurSplit(line: CocktailTestRecipeLine): CocktailTestRecipeLine {
  if (!isLiqueurIngredientName(line.ingredientName)) {
    return line;
  }

  return { ...line, liqueurSplit: true };
}

export function parseCocktailRecipeLine(raw: string): CocktailTestRecipeLine {
  const trimmed = raw.trim();

  const mlMatch =
    trimmed.match(/^(.+?)\s*(\d+(?:\.\d+)?)\s*ml\s*$/i) ??
    trimmed.match(/^(.+?)(\d+(?:\.\d+)?)\s*ml$/i);
  if (mlMatch) {
    return withLiqueurSplit({
      raw: trimmed,
      ingredientName: mlMatch[1].trim(),
      kind: "ml",
      mlAmount: mlMatch[2].trim(),
    });
  }

  for (const suffix of FIXED_SUFFIXES) {
    const escaped = suffix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const spaced = trimmed.match(new RegExp(`^(.+?)\\s+${escaped}$`, "i"));
    if (spaced) {
      return withLiqueurSplit({
        raw: trimmed,
        ingredientName: spaced[1].trim(),
        kind: "fixed",
        fixedSuffix: suffix,
      });
    }

    const compact = trimmed.match(new RegExp(`^(.+?)${escaped}$`, "i"));
    if (compact && compact[1].trim()) {
      return withLiqueurSplit({
        raw: trimmed,
        ingredientName: compact[1].trim(),
        kind: "fixed",
        fixedSuffix: suffix,
      });
    }
  }

  return withLiqueurSplit({
    raw: trimmed,
    ingredientName: trimmed,
    kind: "name_only",
  });
}

export function extractRecipeLinesFromDetail(detail: CocktailDetail): CocktailTestRecipeLine[] {
  const sections = splitCocktailRecipeSections(detail.blocks);
  return sections.recipe
    .flatMap((block) => block.richText.map((item) => item.plain_text).join("").trim())
    .filter(Boolean)
    .map(parseCocktailRecipeLine);
}

export function isCocktailTestable(detail: CocktailDetail): boolean {
  return (
    parsePriceNumber(detail.price) !== null &&
    extractRecipeLinesFromDetail(detail).length > 0 &&
    isValidPreparationMethod(detail.preparationMethod)
  );
}

export function validateCocktailTestAnswerInput(
  recipeLines: CocktailTestRecipeLine[],
  answer: CocktailTestUserAnswer,
): string | null {
  if (!answer.price.trim()) {
    return "価格を入力してください。";
  }

  if (answer.lines.length !== recipeLines.length) {
    return "すべての材料行を入力してください。";
  }

  for (let index = 0; index < recipeLines.length; index += 1) {
    const line = recipeLines[index];
    const userLine = answer.lines[index];

    if (!userLine?.ingredientName.trim()) {
      return line.liqueurSplit
        ? `材料${index + 1}行目のリキュール名を入力してください。`
        : `材料${index + 1}行目の材料名を入力してください。`;
    }

    if (line.kind === "ml" && !userLine.mlAmount?.trim()) {
      return `材料${index + 1}行目のml量を入力してください。`;
    }
  }

  if (!answer.method) {
    return "作り方を選択してください。";
  }

  return null;
}

function buildCorrectIngredient(line: CocktailTestRecipeLine): ComparableIngredient {
  const name = normalizeIngredientName(line.ingredientName);

  if (line.kind === "ml") {
    return {
      name,
      amount: normalizeNumericInput(line.mlAmount ?? ""),
      unit: "ml",
      displayLabel: `${line.ingredientName} ${line.mlAmount}ml`,
    };
  }

  return {
    name,
    amount: null,
    unit: null,
    displayLabel: line.ingredientName,
  };
}

function buildAnswerIngredient(
  line: CocktailTestRecipeLine,
  userLine: CocktailTestUserLineAnswer,
): ComparableIngredient {
  const resolvedName = resolveIngredientName(line, userLine.ingredientName);
  const name = normalizeIngredientName(resolvedName);

  if (line.kind === "ml") {
    const amount = normalizeNumericInput(userLine.mlAmount ?? "");
    return {
      name,
      amount,
      unit: "ml",
      displayLabel:
        amount !== null ? `${resolvedName} ${amount}ml` : resolvedName,
    };
  }

  return {
    name,
    amount: null,
    unit: null,
    displayLabel: resolvedName,
  };
}

function ingredientsEqual(a: ComparableIngredient, b: ComparableIngredient): boolean {
  return a.name === b.name && a.amount === b.amount && a.unit === b.unit;
}

function matchIngredients(
  correct: ComparableIngredient[],
  answer: ComparableIngredient[],
): { missing: ComparableIngredient[]; extra: ComparableIngredient[] } {
  const remainingCorrect = [...correct];
  const extra: ComparableIngredient[] = [];

  for (const item of answer) {
    const matchIndex = remainingCorrect.findIndex((candidate) => ingredientsEqual(candidate, item));
    if (matchIndex >= 0) {
      remainingCorrect.splice(matchIndex, 1);
    } else {
      extra.push(item);
    }
  }

  return { missing: remainingCorrect, extra };
}

function analyzeIngredientIssues(
  correct: ComparableIngredient[],
  answer: ComparableIngredient[],
): CocktailTestIngredientIssue[] {
  const { missing, extra } = matchIngredients(correct, answer);
  if (missing.length === 0 && extra.length === 0) {
    return [];
  }

  const issues: CocktailTestIngredientIssue[] = [];
  const remainingMissing = [...missing];
  const remainingExtra = [...extra];

  for (let missingIndex = remainingMissing.length - 1; missingIndex >= 0; missingIndex -= 1) {
    const missingItem = remainingMissing[missingIndex];
    if (missingItem.unit !== "ml" || missingItem.amount === null) continue;

    const extraIndex = remainingExtra.findIndex(
      (item) =>
        item.unit === "ml" &&
        item.amount !== null &&
        item.name === missingItem.name &&
        item.amount !== missingItem.amount,
    );
    if (extraIndex < 0) continue;

    const wrongItem = remainingExtra[extraIndex];
    issues.push({
      kind: "wrong_amount",
      label: `${missingItem.displayLabel} — 正解 ${missingItem.amount}ml / 入力 ${wrongItem.amount}ml`,
    });
    remainingMissing.splice(missingIndex, 1);
    remainingExtra.splice(extraIndex, 1);
  }

  for (const missingItem of remainingMissing) {
    issues.push({
      kind: "missing",
      label: `不足: ${missingItem.displayLabel}`,
    });
  }

  for (const extraItem of remainingExtra) {
    const isDuplicate = correct.some((item) => ingredientsEqual(item, extraItem));
    issues.push({
      kind: isDuplicate ? "duplicate" : "extra",
      label: isDuplicate ? `重複: ${extraItem.displayLabel}` : `余分: ${extraItem.displayLabel}`,
    });
  }

  return issues;
}

export function gradeCocktailTestAnswer(
  recipeLines: CocktailTestRecipeLine[],
  correctPrice: string | undefined,
  correctMethod: CocktailPreparationMethod | undefined,
  answer: CocktailTestUserAnswer,
): CocktailTestGradeResult {
  const reasons = new Set<CocktailTestIncorrectReason>();

  const validationMessage = validateCocktailTestAnswerInput(recipeLines, answer);
  if (validationMessage) {
    return {
      isCorrect: false,
      reasons: ["missing_input"],
      ingredientIssues: [],
    };
  }

  const userPrice = normalizeNumericInput(answer.price);
  const correctPriceNumber = parsePriceNumber(correctPrice);
  if (userPrice === null || correctPriceNumber === null || userPrice !== correctPriceNumber) {
    reasons.add("price");
  }

  if (!isValidPreparationMethod(correctMethod) || answer.method !== correctMethod) {
    reasons.add("method");
  }

  const correctIngredients = recipeLines.map(buildCorrectIngredient);
  const answerIngredients = recipeLines.map((line, index) =>
    buildAnswerIngredient(line, answer.lines[index]),
  );
  const ingredientIssues = analyzeIngredientIssues(correctIngredients, answerIngredients);

  if (ingredientIssues.length > 0) {
    for (const issue of ingredientIssues) {
      if (issue.kind === "wrong_amount") {
        reasons.add("amount");
      } else {
        reasons.add("ingredient_name");
      }
    }
  }

  return {
    isCorrect: reasons.size === 0,
    reasons: [...reasons],
    ingredientIssues,
  };
}

export function describeIncorrectReasons(result: CocktailTestGradeResult): string[] {
  if (result.reasons.includes("missing_input")) {
    return ["未入力の項目があります。"];
  }

  const messages: string[] = [];

  if (result.reasons.includes("price")) {
    messages.push("価格に誤りがあります");
  }

  if (result.reasons.includes("method")) {
    messages.push("作り方に誤りがあります");
  }

  for (const issue of result.ingredientIssues) {
    messages.push(issue.label);
  }

  return [...new Set(messages)];
}

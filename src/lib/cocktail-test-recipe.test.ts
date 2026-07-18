import { describe, expect, it } from "vitest";

import {
  gradeCocktailTestAnswer,
  normalizeNumericInput,
  parseCocktailRecipeLine,
  validateCocktailTestAnswerInput,
} from "@/lib/cocktail-test-recipe";

const TEST_METHOD = "Shake" as const;

describe("cocktail-test-recipe", () => {
  it("parses ml, liqueur split, and fixed suffix lines", () => {
    expect(parseCocktailRecipeLine("カシスリキュール 30ml")).toEqual({
      raw: "カシスリキュール 30ml",
      ingredientName: "カシスリキュール",
      kind: "ml",
      mlAmount: "30",
      liqueurSplit: true,
    });

    expect(parseCocktailRecipeLine("オレンジジュース UP")).toEqual({
      raw: "オレンジジュース UP",
      ingredientName: "オレンジジュース",
      kind: "fixed",
      fixedSuffix: "UP",
    });
  });

  it("normalizes numeric answers", () => {
    expect(normalizeNumericInput("７００")).toBe(700);
    expect(normalizeNumericInput("1,000円")).toBe(1000);
    expect(normalizeNumericInput("30ml")).toBe(30);
  });

  it("grades matching answers regardless of row order", () => {
    const lines = [
      parseCocktailRecipeLine("ライムジュース 15ml"),
      parseCocktailRecipeLine("コアントロー 15ml"),
      parseCocktailRecipeLine("シェイク"),
      parseCocktailRecipeLine("カットレモン"),
    ];

    const correct = gradeCocktailTestAnswer(lines, "¥700", TEST_METHOD, {
      price: "700",
      method: TEST_METHOD,
      lines: [
        { ingredientName: "コアントロー", mlAmount: "15" },
        { ingredientName: "ライムジュース", mlAmount: "15" },
        { ingredientName: "カットレモン" },
        { ingredientName: "シェイク" },
      ],
    });

    expect(correct.isCorrect).toBe(true);
  });

  it("grades liqueur prefix answers", () => {
    const lines = [
      parseCocktailRecipeLine("アップルリキュール 40ml"),
      parseCocktailRecipeLine("オレンジジュース UP"),
    ];

    const correct = gradeCocktailTestAnswer(lines, "¥700", "Build", {
      price: "700",
      method: "Build",
      lines: [
        { ingredientName: "アップル", mlAmount: "40" },
        { ingredientName: "オレンジジュース" },
      ],
    });

    expect(correct.isCorrect).toBe(true);
  });

  it("accepts answers in the same order", () => {
    const lines = [
      parseCocktailRecipeLine("カシスリキュール 30ml"),
      parseCocktailRecipeLine("オレンジジュース UP"),
    ];

    const correct = gradeCocktailTestAnswer(lines, "¥700", TEST_METHOD, {
      price: "700",
      method: TEST_METHOD,
      lines: [
        { ingredientName: "カシス", mlAmount: "30" },
        { ingredientName: "オレンジジュース" },
      ],
    });

    expect(correct.isCorrect).toBe(true);
  });

  it("detects missing, extra, duplicate, amount, method, and price mistakes", () => {
    const lines = [
      parseCocktailRecipeLine("ライムジュース 15ml"),
      parseCocktailRecipeLine("コアントロー 15ml"),
      parseCocktailRecipeLine("シェイク"),
    ];

    const missing = gradeCocktailTestAnswer(lines, "¥700", TEST_METHOD, {
      price: "700",
      method: TEST_METHOD,
      lines: [
        { ingredientName: "ライムジュース", mlAmount: "15" },
        { ingredientName: "コアントロー", mlAmount: "15" },
        { ingredientName: "カットレモン" },
      ],
    });
    expect(missing.isCorrect).toBe(false);
    expect(missing.ingredientIssues.some((issue) => issue.kind === "missing")).toBe(true);
    expect(missing.ingredientIssues.some((issue) => issue.kind === "extra")).toBe(true);

    const duplicate = gradeCocktailTestAnswer(lines, "¥700", TEST_METHOD, {
      price: "700",
      method: TEST_METHOD,
      lines: [
        { ingredientName: "ライムジュース", mlAmount: "15" },
        { ingredientName: "ライムジュース", mlAmount: "15" },
        { ingredientName: "コアントロー", mlAmount: "15" },
      ],
    });
    expect(duplicate.isCorrect).toBe(false);
    expect(duplicate.ingredientIssues.some((issue) => issue.kind === "duplicate")).toBe(true);

    const wrongAmount = gradeCocktailTestAnswer(lines, "¥700", TEST_METHOD, {
      price: "700",
      method: TEST_METHOD,
      lines: [
        { ingredientName: "ライムジュース", mlAmount: "30" },
        { ingredientName: "コアントロー", mlAmount: "15" },
        { ingredientName: "シェイク" },
      ],
    });
    expect(wrongAmount.isCorrect).toBe(false);
    expect(wrongAmount.ingredientIssues.some((issue) => issue.kind === "wrong_amount")).toBe(true);

    const wrongMethod = gradeCocktailTestAnswer(lines, "¥700", "Build", {
      price: "700",
      method: "Stir",
      lines: [
        { ingredientName: "ライムジュース", mlAmount: "15" },
        { ingredientName: "コアントロー", mlAmount: "15" },
        { ingredientName: "シェイク" },
      ],
    });
    expect(wrongMethod.isCorrect).toBe(false);
    expect(wrongMethod.reasons).toContain("method");

    const wrongPrice = gradeCocktailTestAnswer(lines, "¥700", TEST_METHOD, {
      price: "800",
      method: TEST_METHOD,
      lines: [
        { ingredientName: "ライムジュース", mlAmount: "15" },
        { ingredientName: "コアントロー", mlAmount: "15" },
        { ingredientName: "シェイク" },
      ],
    });
    expect(wrongPrice.isCorrect).toBe(false);
    expect(wrongPrice.reasons).toContain("price");
  });

  it("requires all fields before grading", () => {
    const lines = [parseCocktailRecipeLine("カシスリキュール 30ml")];
    expect(
      validateCocktailTestAnswerInput(lines, {
        price: "700",
        method: "",
        lines: [{ ingredientName: "カシス" }],
      }),
    ).toContain("ml量");

    expect(
      validateCocktailTestAnswerInput(lines, {
        price: "700",
        method: "",
        lines: [{ ingredientName: "カシス", mlAmount: "30" }],
      }),
    ).toContain("作り方");
  });
});

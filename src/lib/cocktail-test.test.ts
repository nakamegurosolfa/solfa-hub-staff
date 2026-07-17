import { describe, expect, it } from "vitest";

import type { CocktailSummary } from "@/lib/notion-types";
import {
  filterCocktailsByRanks,
  normalizeLearningRank,
  selectTestCocktails,
  shuffleArray,
} from "@/lib/cocktail-test";

function mockCocktail(id: string, learningPriority?: string): CocktailSummary {
  return {
    id,
    name: id,
    employeeOnly: false,
    limitedTime: false,
    ingredientTags: [],
    recommended: false,
    learningPriority,
  };
}

describe("cocktail-test", () => {
  it("normalizes learning priority rank labels", () => {
    expect(normalizeLearningRank("S")).toBe("S");
    expect(normalizeLearningRank("Sランク")).toBe("S");
    expect(normalizeLearningRank(" s ")).toBe("S");
    expect(normalizeLearningRank("aランク")).toBe("A");
    expect(normalizeLearningRank("")).toBeNull();
    expect(normalizeLearningRank("E")).toBeNull();
  });

  it("filters cocktails by selected ranks without duplicates", () => {
    const cocktails = [
      mockCocktail("1", "S"),
      mockCocktail("2", "Cランク"),
      mockCocktail("3", "D"),
      mockCocktail("1", "S"),
      mockCocktail("4"),
    ];

    const filtered = filterCocktailsByRanks(cocktails, ["S", "C"]);
    expect(filtered.map((item) => item.id)).toEqual(["1", "2"]);
  });

  it("selects up to the requested question count", () => {
    const cocktails = Array.from({ length: 25 }, (_, index) => mockCocktail(String(index), "B"));

    const selected = selectTestCocktails(cocktails, ["B"], "10");
    expect(selected).toHaveLength(10);
    expect(new Set(selected.map((item) => item.id)).size).toBe(10);
  });

  it("uses all available cocktails when fewer than the requested count", () => {
    const cocktails = [mockCocktail("1", "A"), mockCocktail("2", "A")];
    const selected = selectTestCocktails(cocktails, ["A"], "20");
    expect(selected).toHaveLength(2);
  });

  it("does not mutate the source array when shuffling", () => {
    const source = [1, 2, 3];
    const shuffled = shuffleArray(source);
    expect(source).toEqual([1, 2, 3]);
    expect(shuffled.sort()).toEqual([1, 2, 3]);
  });
});

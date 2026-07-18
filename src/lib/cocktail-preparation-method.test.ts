import { describe, expect, it } from "vitest";

import {
  formatPreparationMethodLabel,
  normalizePreparationMethod,
} from "@/lib/cocktail-preparation-method";

describe("cocktail-preparation-method", () => {
  it("normalizes Japanese and English aliases", () => {
    expect(normalizePreparationMethod("ビルド")).toBe("Build");
    expect(normalizePreparationMethod("ステア")).toBe("Stir");
    expect(normalizePreparationMethod("シェイク")).toBe("Shake");
    expect(normalizePreparationMethod("Build")).toBe("Build");
    expect(normalizePreparationMethod("stir")).toBe("Stir");
    expect(normalizePreparationMethod("SHAKE")).toBe("Shake");
  });

  it("returns undefined for unknown or empty values", () => {
    expect(normalizePreparationMethod("")).toBeUndefined();
    expect(normalizePreparationMethod("ミックス")).toBeUndefined();
  });

  it("formats canonical methods as Japanese labels", () => {
    expect(formatPreparationMethodLabel("Build")).toBe("ビルド");
    expect(formatPreparationMethodLabel("Stir")).toBe("ステア");
    expect(formatPreparationMethodLabel("Shake")).toBe("シェイク");
  });
});

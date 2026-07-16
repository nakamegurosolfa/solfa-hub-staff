import { describe, expect, it } from "vitest";

import { formatReleaseDate, formatUpdateDate } from "@/lib/update-history";

describe("update-history formatters", () => {
  it("formats release date key as Japanese label", () => {
    expect(formatReleaseDate("2026-07-15")).toBe("2026年7月15日");
  });

  it("formats ISO timestamp for Notion update badges", () => {
    expect(formatUpdateDate("2026-07-13T15:00:00.000Z")).toBe("7/14");
  });
});

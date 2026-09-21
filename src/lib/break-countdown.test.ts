import { describe, expect, it } from "vitest";

import { getBreakExpectedEndAtLabel, resolveBreakStartInstant } from "@/lib/break-countdown";
import { buildIsoFromTokyoDateAndTime } from "@/lib/tokyo-time";

describe("break expected end time", () => {
  it("calculates end time 15 minutes after break start", () => {
    const businessDate = "2026-07-13";

    expect(getBreakExpectedEndAtLabel(businessDate, "14:32")).toBe("14:47");
    expect(getBreakExpectedEndAtLabel(businessDate, "21:55")).toBe("22:10");
  });

  it("handles overnight end times", () => {
    const businessDate = "2026-07-13";

    expect(getBreakExpectedEndAtLabel(businessDate, "23:55")).toBe("00:10");
  });

  it("keeps the same end time after 15 minutes have passed", () => {
    const businessDate = "2026-07-13";
    const startAt = "14:32";
    const start = new Date(buildIsoFromTokyoDateAndTime(businessDate, startAt)!);
    const now = new Date(start.getTime() + 20 * 60 * 1000);

    expect(getBreakExpectedEndAtLabel(businessDate, startAt, now)).toBe("14:47");
  });

  it("resolves active overnight break start on the same business date", () => {
    const businessDate = "2026-07-13";
    const startAt = "23:50";
    const now = new Date(buildIsoFromTokyoDateAndTime("2026-07-14", "00:04")!);

    expect(getBreakExpectedEndAtLabel(businessDate, startAt, now)).toBe("00:05");
    expect(resolveBreakStartInstant(businessDate, startAt, now)?.toISOString()).toBe(
      buildIsoFromTokyoDateAndTime(businessDate, startAt),
    );
  });
});

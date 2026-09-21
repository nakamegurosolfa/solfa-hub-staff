import { describe, expect, it } from "vitest";

import {
  formatBreakCountdownLabel,
  getBreakCountdownRemainingSeconds,
  resolveBreakStartInstant,
} from "@/lib/break-countdown";
import { buildIsoFromTokyoDateAndTime } from "@/lib/tokyo-time";

describe("break countdown", () => {
  it("formats remaining seconds as MM:SS", () => {
    expect(formatBreakCountdownLabel(900)).toBe("15:00");
    expect(formatBreakCountdownLabel(899)).toBe("14:59");
    expect(formatBreakCountdownLabel(61)).toBe("01:01");
    expect(formatBreakCountdownLabel(0)).toBe("00:00");
    expect(formatBreakCountdownLabel(-10)).toBe("00:00");
  });

  it("starts at 15:00 when break just started", () => {
    const businessDate = "2026-07-13";
    const startAt = "14:00";
    const now = new Date(buildIsoFromTokyoDateAndTime(businessDate, startAt)!);

    expect(getBreakCountdownRemainingSeconds(businessDate, startAt, now)).toBe(900);
  });

  it("decreases based on elapsed time since break start", () => {
    const businessDate = "2026-07-13";
    const startAt = "14:00";
    const start = new Date(buildIsoFromTokyoDateAndTime(businessDate, startAt)!);
    const now = new Date(start.getTime() + 5 * 60 * 1000 + 1000);

    expect(getBreakCountdownRemainingSeconds(businessDate, startAt, now)).toBe(599);
  });

  it("stops at 00:00 after 15 minutes", () => {
    const businessDate = "2026-07-13";
    const startAt = "14:00";
    const start = new Date(buildIsoFromTokyoDateAndTime(businessDate, startAt)!);
    const now = new Date(start.getTime() + 20 * 60 * 1000);

    expect(getBreakCountdownRemainingSeconds(businessDate, startAt, now)).toBe(0);
  });

  it("handles overnight active breaks on the same business date", () => {
    const businessDate = "2026-07-13";
    const startAt = "23:50";
    const now = new Date(buildIsoFromTokyoDateAndTime("2026-07-14", "00:04")!);

    expect(getBreakCountdownRemainingSeconds(businessDate, startAt, now)).toBe(60);
    expect(resolveBreakStartInstant(businessDate, startAt, now)?.toISOString()).toBe(
      buildIsoFromTokyoDateAndTime(businessDate, startAt),
    );
  });
});

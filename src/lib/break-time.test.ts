import { describe, expect, it } from "vitest";

import {
  getBreakDurationMinutes,
  getShortageMinutes,
  getTotalCompletedMinutes,
  isValidHhmm,
  normalizeHhmm,
} from "@/lib/break-time";

describe("break-time HH:mm calculations", () => {
  it("validates and normalizes HH:mm", () => {
    expect(isValidHhmm("01:30")).toBe(true);
    expect(normalizeHhmm("1:30")).toBe("01:30");
    expect(isValidHhmm("25:00")).toBe(false);
    expect(isValidHhmm(null)).toBe(false);
  });

  it("calculates same-day break duration", () => {
    expect(getBreakDurationMinutes({ startAt: "01:30", endAt: "02:00" })).toBe(30);
    expect(getBreakDurationMinutes({ startAt: "14:00", endAt: "15:00" })).toBe(60);
  });

  it("calculates overnight break 23:30–00:15 as 45 minutes", () => {
    expect(getBreakDurationMinutes({ startAt: "23:30", endAt: "00:15" })).toBe(45);
  });

  it("calculates overnight break 23:00–02:00 as 180 minutes", () => {
    expect(getBreakDurationMinutes({ startAt: "23:00", endAt: "02:00" })).toBe(180);
  });

  it("returns zero for incomplete entries", () => {
    expect(getBreakDurationMinutes({ startAt: "10:00", endAt: null })).toBe(0);
    expect(getBreakDurationMinutes({ startAt: null, endAt: "10:00" })).toBe(0);
  });

  it("calculates total completed and shortage minutes", () => {
    const breaks = [
      { startAt: "01:30", endAt: "02:00" },
      { startAt: "14:00", endAt: "14:30" },
      { startAt: null, endAt: null },
      { startAt: null, endAt: null },
    ];
    expect(getTotalCompletedMinutes(breaks)).toBe(60);
    expect(getShortageMinutes(60, breaks)).toBe(0);
    expect(getShortageMinutes(90, breaks)).toBe(30);
  });
});

import { describe, expect, it } from "vitest";

import {
  buildEndIsoFromTokyo,
  buildIsoFromTokyoDateAndTime,
  formatIsoTimeInTokyo,
  formatIsoTimeInputInTokyo,
  formatTokyoBusinessDateShortLabel,
  formatTokyoDateKey,
  formatTokyoSentAtLabel,
  formatTokyoTimeHhmm,
  shiftTokyoDateKey,
} from "@/lib/tokyo-time";
import { getBreakDurationMinutes } from "@/lib/break-time";

describe("tokyo-time storage (UTC runtime)", () => {
  it("stores 14:00 JST as 05:00Z and displays 14:00", () => {
    const iso = buildIsoFromTokyoDateAndTime("2026-07-13", "14:00");
    expect(iso).toBe("2026-07-13T05:00:00.000Z");
    expect(formatIsoTimeInTokyo(iso)).toBe("14:00");
    expect(formatIsoTimeInputInTokyo(iso)).toBe("14:00");
  });

  it("calculates overnight break 23:00–02:00 as 180 minutes (HH:mm)", () => {
    expect(getBreakDurationMinutes({ startAt: "23:00", endAt: "02:00" })).toBe(180);
  });

  it("rolls end time to next JST day when end is earlier than start (ISO builder)", () => {
    const startIso = buildIsoFromTokyoDateAndTime("2026-07-13", "23:30");
    const endIso = buildEndIsoFromTokyo(startIso!, "00:15");

    expect(shiftTokyoDateKey("2026-07-13", 1)).toBe("2026-07-14");
    expect(endIso).toBe(buildIsoFromTokyoDateAndTime("2026-07-14", "00:15"));
    expect(getBreakDurationMinutes({ startAt: "23:30", endAt: "00:15" })).toBe(45);
  });

  it("formats sent-at in Japan time", () => {
    expect(formatTokyoSentAtLabel(new Date("2026-07-13T06:20:00.000Z"))).toBe("2026年7月13日 15:20");
  });

  it("uses Japan date for business date key near midnight UTC", () => {
    // 2026-07-13 08:30 JST = 2026-07-12 23:30 UTC
    expect(formatTokyoDateKey(new Date("2026-07-12T23:30:00.000Z"))).toBe("2026-07-13");
    expect(formatTokyoBusinessDateShortLabel("2026-07-13")).toBe("2026年7月13日");
  });

  it("formats wall-clock time from ISO regardless of server timezone", () => {
    expect(formatTokyoTimeHhmm(new Date("2026-07-13T06:20:00.000Z"))).toBe("15:20");
    expect(formatTokyoTimeHhmm(new Date("2026-07-13T07:05:00.000Z"))).toBe("16:05");
  });
});

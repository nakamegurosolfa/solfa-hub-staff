import { describe, expect, it } from "vitest";

import { getBreakDurationMinutes } from "@/lib/break-management";
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

describe("tokyo-time storage (UTC runtime)", () => {
  it("stores 14:00 JST as 05:00Z and displays 14:00", () => {
    const iso = buildIsoFromTokyoDateAndTime("2026-07-13", "14:00");
    expect(iso).toBe("2026-07-13T05:00:00.000Z");
    expect(formatIsoTimeInTokyo(iso)).toBe("14:00");
    expect(formatIsoTimeInputInTokyo(iso)).toBe("14:00");
  });

  it("calculates overnight break 23:00–02:00 as 180 minutes", () => {
    const startIso = buildIsoFromTokyoDateAndTime("2026-07-13", "23:00");
    const endIso = buildEndIsoFromTokyo(startIso!, "02:00");

    expect(startIso).toBe("2026-07-13T14:00:00.000Z");
    expect(endIso).toBe("2026-07-13T17:00:00.000Z");
    expect(formatIsoTimeInTokyo(startIso)).toBe("23:00");
    expect(formatIsoTimeInTokyo(endIso)).toBe("02:00");
    expect(getBreakDurationMinutes({ startAt: startIso, endAt: endIso })).toBe(180);
  });

  it("rolls end time to next JST day when end is earlier than start", () => {
    const startIso = buildIsoFromTokyoDateAndTime("2026-07-13", "23:30");
    const endIso = buildEndIsoFromTokyo(startIso!, "00:15");

    expect(shiftTokyoDateKey("2026-07-13", 1)).toBe("2026-07-14");
    expect(endIso).toBe(buildIsoFromTokyoDateAndTime("2026-07-14", "00:15"));
    expect(getBreakDurationMinutes({ startAt: startIso, endAt: endIso })).toBe(45);
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

import { describe, expect, it } from "vitest";

import type { StaffMember } from "@/lib/break-management";
import {
  buildBreakReportEmailBody,
  formatBreakSlotForReport,
  formatSentAtLabel,
} from "@/lib/break-report-text";
import {
  buildIsoFromTokyoDateAndTime,
  formatIsoTimeInTokyo,
  formatTokyoSentAtLabel,
} from "@/lib/tokyo-time";

const BUSINESS_DATE = "2026-07-14";
const START_ISO = buildIsoFromTokyoDateAndTime(BUSINESS_DATE, "00:50");
const END_ISO = buildIsoFromTokyoDateAndTime(BUSINESS_DATE, "01:50");
const SENT_AT_ISO = "2026-07-13T15:49:00.000Z";

function formatUtcWallClockBug(iso: string): string {
  const date = new Date(iso);
  return `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
}

function formatUtcSentAtBug(iso: string): string {
  const date = new Date(iso);
  return `${date.getUTCFullYear()}年${date.getUTCMonth() + 1}月${date.getUTCDate()}日 ${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
}

describe("break report email timezone (Asia/Tokyo)", () => {
  it("stores midnight break as UTC ISO but displays entered JST wall clock", () => {
    expect(START_ISO).toBe("2026-07-13T15:50:00.000Z");
    expect(END_ISO).toBe("2026-07-13T16:50:00.000Z");
    expect(formatIsoTimeInTokyo(START_ISO)).toBe("00:50");
    expect(formatIsoTimeInTokyo(END_ISO)).toBe("01:50");
  });

  it("does not show raw UTC components from stored ISO (regression: 15:50 display bug)", () => {
    expect(formatUtcWallClockBug(START_ISO!)).toBe("15:50");
    expect(formatUtcWallClockBug(END_ISO!)).toBe("16:50");
    expect(formatBreakSlotForReport({ startAt: START_ISO, endAt: END_ISO })).toBe(
      "00:50〜01:50（60分）",
    );
  });

  it("formats sent-at on UTC server runtime as JST (2026年7月14日 00:49)", () => {
    expect(formatUtcSentAtBug(SENT_AT_ISO)).toBe("2026年7月13日 15:49");
    expect(formatTokyoSentAtLabel(new Date(SENT_AT_ISO))).toBe("2026年7月14日 00:49");
    expect(formatSentAtLabel(new Date(SENT_AT_ISO))).toBe("2026年7月14日 00:49");
  });

  it("produces final Resend text with entered break times and JST sent-at", () => {
    const staff: StaffMember[] = [
      {
        id: "1",
        name: "テスト太郎",
        requiredMinutes: 60,
        breaks: [
          { startAt: START_ISO, endAt: END_ISO },
          { startAt: null, endAt: null },
          { startAt: null, endAt: null },
          { startAt: null, endAt: null },
        ],
      },
    ];

    const text = buildBreakReportEmailBody(BUSINESS_DATE, staff, new Date(SENT_AT_ISO));

    expect(text).toContain("休憩①：00:50〜01:50（60分）");
    expect(text).toContain("送信日時：2026年7月14日 00:49");
    expect(text).not.toContain("15:50");
    expect(text).not.toContain("送信日時：2026年7月13日 15:49");
  });
});

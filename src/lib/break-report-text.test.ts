import { describe, expect, it } from "vitest";

import type { StaffMember } from "@/lib/break-management";
import {
  buildBreakReportEmailBody,
  formatBreakSlotForReport,
  formatSentAtLabel,
} from "@/lib/break-report-text";
import { formatIsoTimeInTokyo, formatTokyoSentAtLabel, formatTokyoTimeHhmm } from "@/lib/tokyo-time";

const START_ISO = "2026-07-13T06:20:00.000Z";
const END_ISO = "2026-07-13T07:05:00.000Z";
const SENT_AT_ISO = "2026-07-13T06:20:00.000Z";

describe("tokyo-time", () => {
  it("formats ISO 2026-07-13T06:20:00.000Z as 15:20", () => {
    expect(formatTokyoTimeHhmm(new Date(START_ISO))).toBe("15:20");
    expect(formatIsoTimeInTokyo(START_ISO)).toBe("15:20");
  });

  it("formats ISO 2026-07-13T07:05:00.000Z as 16:05", () => {
    expect(formatTokyoTimeHhmm(new Date(END_ISO))).toBe("16:05");
    expect(formatIsoTimeInTokyo(END_ISO)).toBe("16:05");
  });

  it("formats sent-at 2026-07-13T06:20:00.000Z as 2026年7月13日 15:20", () => {
    expect(formatTokyoSentAtLabel(new Date(SENT_AT_ISO))).toBe("2026年7月13日 15:20");
    expect(formatSentAtLabel(new Date(SENT_AT_ISO))).toBe("2026年7月13日 15:20");
  });
});

describe("break report email body (Resend text)", () => {
  it("shows break slot as 15:20〜16:05", () => {
    expect(
      formatBreakSlotForReport({
        startAt: START_ISO,
        endAt: END_ISO,
      }),
    ).toBe("15:20〜16:05（45分）");
  });

  it("produces final Resend text with JST break times and sent-at", () => {
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

    const text = buildBreakReportEmailBody("2026-07-13", staff, new Date(SENT_AT_ISO));

    expect(text).toContain("休憩①：15:20〜16:05（45分）");
    expect(text).toContain("送信日時：2026年7月13日 15:20");
  });
});

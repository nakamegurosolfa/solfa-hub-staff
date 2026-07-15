import { describe, expect, it } from "vitest";

import type { StaffMember } from "@/lib/break-management";
import {
  buildBreakReportEmailBody,
  formatBreakSlotForReport,
  formatSentAtLabel,
} from "@/lib/break-report-text";
import { formatTokyoSentAtLabel } from "@/lib/tokyo-time";

const BUSINESS_DATE = "2026-07-14";
const SENT_AT_ISO = "2026-07-13T15:49:00.000Z";

describe("break report email (HH:mm text)", () => {
  it("formats break slot from HH:mm text", () => {
    expect(formatBreakSlotForReport({ startAt: "00:50", endAt: "01:50" })).toBe(
      "00:50〜01:50（60分）",
    );
  });

  it("formats sent-at on UTC server runtime as JST (2026年7月14日 00:49)", () => {
    expect(formatTokyoSentAtLabel(new Date(SENT_AT_ISO))).toBe("2026年7月14日 00:49");
    expect(formatSentAtLabel(new Date(SENT_AT_ISO))).toBe("2026年7月14日 00:49");
  });

  it("produces final Resend text with entered break times and JST sent-at", () => {
    const staff: StaffMember[] = [
      {
        id: "1",
        name: "テスト太郎",
        businessDate: BUSINESS_DATE,
        requiredMinutes: 60,
        completedMinutes: 60,
        shortageMinutes: 0,
        createdAt: "",
        updatedAt: "",
        breaks: [
          { startAt: "00:50", endAt: "01:50" },
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

import { describe, expect, it } from "vitest";

import type { StaffMember } from "@/lib/break-management";
import {
  buildBreakReportEmailBody,
  formatBreakSlotForReport,
  formatSentAtLabel,
} from "@/lib/break-report-text";

// JST 14:00–15:00 on 2026-07-13 (stored as UTC ISO from browser in Japan)
const BREAK_START_ISO = "2026-07-13T05:00:00.000Z";
const BREAK_END_ISO = "2026-07-13T06:00:00.000Z";
// JST 15:09 on 2026-07-13
const SENT_AT_ISO = "2026-07-13T06:09:00.000Z";

describe("break report timezone (Asia/Tokyo)", () => {
  it("shows break times as entered (14:00–15:00) regardless of server timezone", () => {
    const slot = formatBreakSlotForReport({
      startAt: BREAK_START_ISO,
      endAt: BREAK_END_ISO,
    });

    expect(slot).toBe("14:00〜15:00（60分）");
  });

  it("shows sent-at time in Japan time (15:09)", () => {
    expect(formatSentAtLabel(new Date(SENT_AT_ISO))).toBe("2026年7月13日 15:09");
  });

  it("includes correct break times and sent-at in email body", () => {
    const staff: StaffMember[] = [
      {
        id: "1",
        name: "テスト太郎",
        requiredMinutes: 60,
        breaks: [
          { startAt: BREAK_START_ISO, endAt: BREAK_END_ISO },
          { startAt: null, endAt: null },
          { startAt: null, endAt: null },
          { startAt: null, endAt: null },
        ],
      },
    ];

    const body = buildBreakReportEmailBody("2026-07-13", staff, new Date(SENT_AT_ISO));

    expect(body).toContain("休憩①：14:00〜15:00（60分）");
    expect(body).toContain("送信日時：2026年7月13日 15:09");
  });
});

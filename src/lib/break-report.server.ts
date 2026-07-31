import { getRequestIP } from "@tanstack/react-start/server";
import { z } from "zod";

import {
  BREAK_SLOT_COUNT,
  type BreakEntry,
  type RequiredBreakMinutes,
  type StaffMember,
} from "@/lib/break-management";
import {
  buildBreakReportEmailBody,
  buildBreakReportEmailHtmlBody,
  buildBreakReportEmailSubject,
  BREAK_REPORT_FORMAT_VERSION,
} from "@/lib/break-report-text";
import { getRuntimeEnv } from "@/lib/notion-env";
import { formatTokyoSentAtLabel } from "@/lib/tokyo-time";
import { isValidHhmm } from "@/lib/break-time";

const MAX_STAFF_COUNT = 100;
const MAX_NAME_LENGTH = 50;
const DUPLICATE_SEND_WINDOW_MS = 30_000;

const breakEntrySchema = z.object({
  startAt: z.string().nullable(),
  endAt: z.string().nullable(),
});

const breakReportStaffSchema = z.object({
  name: z.string().trim().min(1).max(MAX_NAME_LENGTH),
  requiredMinutes: z.union([z.literal(45), z.literal(60)]),
  breaks: z.array(breakEntrySchema).length(BREAK_SLOT_COUNT),
});

export const breakReportInputSchema = z.object({
  businessDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  staff: z.array(breakReportStaffSchema).min(1).max(MAX_STAFF_COUNT),
});

export type BreakReportInput = z.infer<typeof breakReportInputSchema>;

type BreakReportResult =
  | { success: true as const }
  | { success: false as const; error: string };

const recentSendStore = new Map<string, number>();

function sanitizeDisplayName(name: string): string {
  return name.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, MAX_NAME_LENGTH);
}

function readResendApiKey() {
  const key = getRuntimeEnv("RESEND_API_KEY");
  if (!key) {
    throw new Error("RESEND_API_KEY is not configured.");
  }
  return key;
}

function readBreakReportToEmail() {
  const email = getRuntimeEnv("BREAK_REPORT_TO");
  if (!email) {
    throw new Error("BREAK_REPORT_TO is not configured.");
  }
  return email;
}

function readResendFromEmail() {
  const email = getRuntimeEnv("RESEND_FROM");
  if (!email) {
    throw new Error("RESEND_FROM is not configured.");
  }
  return email;
}

function assertValidHhmm(value: string | null) {
  if (value === null) return;
  if (!isValidHhmm(value)) {
    throw new Error("Invalid break time.");
  }
}

function toStaffMember(payload: BreakReportInput["staff"][number]): StaffMember {
  return {
    id: "report",
    name: sanitizeDisplayName(payload.name),
    requiredMinutes: payload.requiredMinutes as RequiredBreakMinutes,
    breaks: payload.breaks.map(
      (entry): BreakEntry => ({
        startAt: entry.startAt,
        endAt: entry.endAt,
      }),
    ),
  };
}

function checkDuplicateSend(businessDate: string) {
  const ip = getRequestIP({ xForwardedFor: true }) ?? "unknown";
  const key = `${ip}:${businessDate}`;
  const lastSentAt = recentSendStore.get(key);
  if (lastSentAt && Date.now() - lastSentAt < DUPLICATE_SEND_WINDOW_MS) {
    return true;
  }
  return false;
}

function recordSuccessfulSend(businessDate: string) {
  const ip = getRequestIP({ xForwardedFor: true }) ?? "unknown";
  recentSendStore.set(`${ip}:${businessDate}`, Date.now());
}

export async function sendBreakReportEmail(input: BreakReportInput): Promise<BreakReportResult> {
  console.log("[break-report] env check", {
    RESEND_API_KEY: Boolean(process.env.RESEND_API_KEY),
    RESEND_FROM: Boolean(process.env.RESEND_FROM),
    BREAK_REPORT_TO: Boolean(process.env.BREAK_REPORT_TO),
  });

  try {
    const parsed = breakReportInputSchema.parse(input);
    if (checkDuplicateSend(parsed.businessDate)) {
      console.error("[break-report] duplicate send blocked", { businessDate: parsed.businessDate });
      return { success: false, error: "メール送信に失敗しました。" };
    }

    for (const member of parsed.staff) {
      for (const entry of member.breaks) {
        assertValidHhmm(entry.startAt);
        assertValidHhmm(entry.endAt);
      }
    }

    const staff = parsed.staff.map(toStaffMember);
    const sentAt = new Date();
    const subject = buildBreakReportEmailSubject(parsed.businessDate);
    const text = buildBreakReportEmailBody(parsed.businessDate, staff, sentAt);
    const html = buildBreakReportEmailHtmlBody(parsed.businessDate, staff, sentAt);

    const resendPayload = {
      from: readResendFromEmail(),
      to: [readBreakReportToEmail()],
      subject,
      text,
      html,
    };

    const firstBreak = staff[0]?.breaks[0];
    console.log("[break-report] Resend outbound payload", {
      formatVersion: BREAK_REPORT_FORMAT_VERSION,
      serverFn: "sendBreakReport",
      sentAtIso: sentAt.toISOString(),
      sentAtFormatted: formatTokyoSentAtLabel(sentAt),
      firstBreakStart: firstBreak?.startAt ?? null,
      firstBreakEnd: firstBreak?.endAt ?? null,
      subject,
      text,
      payload: resendPayload,
    });
    console.log("[break-report] Resend text body:\n", text);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${readResendApiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resendPayload),
    });

    const responseBody = await response.text();
    console.log("HERE", {
      file: "src/lib/break-report.server.ts",
      function: "sendBreakReportEmail",
    });
    console.log("[break-report] Resend response", {
      status: response.status,
      ok: response.ok,
      body: responseBody,
    });

    if (!response.ok) {
      return { success: false, error: "メール送信に失敗しました。" };
    }

    let result: { id?: string };
    try {
      result = JSON.parse(responseBody) as { id?: string };
    } catch (parseError) {
      console.error("[break-report] failed to parse Resend JSON", parseError);
      return { success: false, error: "メール送信に失敗しました。" };
    }

    if (!result.id) {
      return { success: false, error: "メール送信に失敗しました。" };
    }

    recordSuccessfulSend(parsed.businessDate);
    return { success: true };
  } catch (error) {
    console.error("[break-report] send error", error);
    if (error instanceof Response) {
      return { success: false, error: "メール送信に失敗しました。" };
    }
    return { success: false, error: "メール送信に失敗しました。" };
  }
}

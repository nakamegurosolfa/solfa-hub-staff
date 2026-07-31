import {
  BREAK_SLOT_COUNT,
  type BreakEntry,
  type StaffMember,
  formatTimeLabel,
  getBreakDurationMinutes,
  getShortageMinutes,
  getTotalCompletedMinutes,
} from "@/lib/break-management";
import { isLateNightPremiumBreak } from "@/lib/break-time";
import { formatTokyoBusinessDateShortLabel, formatTokyoSentAtLabel } from "@/lib/tokyo-time";

const SLOT_LABELS = ["①", "②", "③", "④"] as const;
const LATE_NIGHT_BREAK_COLOR = "#dc2626";

export function formatBusinessDateShortLabel(dateKey: string): string {
  return formatTokyoBusinessDateShortLabel(dateKey);
}

export function formatSentAtLabel(date: Date): string {
  return formatTokyoSentAtLabel(date);
}

export function formatBreakSlotForReport(entry: BreakEntry): string {
  const hasStart = Boolean(entry.startAt);
  const hasEnd = Boolean(entry.endAt);

  if (!hasStart && !hasEnd) return "未記録";
  if (hasStart && !hasEnd) return "終了未入力";
  if (!hasStart && hasEnd) return "開始未入力";

  const start = formatTimeLabel(entry.startAt);
  const end = formatTimeLabel(entry.endAt);
  const minutes = getBreakDurationMinutes(entry);
  if (start === "—" || end === "—" || minutes <= 0) return "未記録";
  return `${start}〜${end}（${minutes}分）`;
}

function staffHasAnyBreakRecord(staff: StaffMember): boolean {
  return staff.breaks.some((entry) => entry.startAt || entry.endAt);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatBreakSlotLine(staff: StaffMember, index: number): string {
  return `休憩${SLOT_LABELS[index]}：${formatBreakSlotForReport(staff.breaks[index])}`;
}

function formatBreakSlotLineHtml(staff: StaffMember, index: number): string {
  const entry = staff.breaks[index];
  const line = formatBreakSlotLine(staff, index);
  if (!isLateNightPremiumBreak(entry)) {
    return escapeHtml(line);
  }
  return `<span style="color:${LATE_NIGHT_BREAK_COLOR}">${escapeHtml(line)}</span>`;
}

function formatStaffSection(staff: StaffMember): string {
  const lines: string[] = [];
  lines.push(`■ ${staff.name}`);
  lines.push(`必要休憩時間：${staff.requiredMinutes}分`);

  if (!staffHasAnyBreakRecord(staff)) {
    lines.push("休憩記録なし");
  } else {
    for (let index = 0; index < BREAK_SLOT_COUNT; index += 1) {
      lines.push(formatBreakSlotLine(staff, index));
    }
  }

  lines.push(`取得休憩時間：${getTotalCompletedMinutes(staff)}分`);
  lines.push(`休憩不足時間：${getShortageMinutes(staff)}分`);
  return lines.join("\n");
}

function formatStaffSectionHtml(staff: StaffMember): string {
  const lines: string[] = [];
  lines.push(`■ ${escapeHtml(staff.name)}`);
  lines.push(`必要休憩時間：${staff.requiredMinutes}分`);

  if (!staffHasAnyBreakRecord(staff)) {
    lines.push("休憩記録なし");
  } else {
    for (let index = 0; index < BREAK_SLOT_COUNT; index += 1) {
      lines.push(formatBreakSlotLineHtml(staff, index));
    }
  }

  lines.push(`取得休憩時間：${getTotalCompletedMinutes(staff)}分`);
  lines.push(`休憩不足時間：${getShortageMinutes(staff)}分`);
  return lines.join("<br>");
}

export const BREAK_REPORT_FORMAT_VERSION = "jst-v6-late-night-html";

export function buildBreakReportEmailSubject(businessDate: string): string {
  return `【solfa 休憩管理】${formatBusinessDateShortLabel(businessDate)}営業分`;
}

export function buildBreakReportEmailBody(
  businessDate: string,
  staff: StaffMember[],
  sentAt: Date,
): string {
  const sections = staff.map((member) => formatStaffSection(member));
  const body = [
    `営業日：${formatBusinessDateShortLabel(businessDate)}`,
    "",
    ...sections.flatMap((section, index) =>
      index < sections.length - 1 ? [section, ""] : [section],
    ),
    "",
    `スタッフ数：${staff.length}名`,
    `送信日時：${formatSentAtLabel(sentAt)}`,
  ];
  return body.join("\n");
}

export function buildBreakReportEmailHtmlBody(
  businessDate: string,
  staff: StaffMember[],
  sentAt: Date,
): string {
  const sections = staff.map((member) => formatStaffSectionHtml(member));
  const body = [
    `営業日：${escapeHtml(formatBusinessDateShortLabel(businessDate))}`,
    "",
    ...sections.flatMap((section, index) =>
      index < sections.length - 1 ? [section, ""] : [section],
    ),
    "",
    `スタッフ数：${staff.length}名`,
    `送信日時：${escapeHtml(formatSentAtLabel(sentAt))}`,
  ];
  return `<div style="font-family:sans-serif;font-size:14px;line-height:1.6;color:#111;">${body.join("<br>")}</div>`;
}

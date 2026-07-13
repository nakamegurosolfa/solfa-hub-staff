import {
  BREAK_SLOT_COUNT,
  type BreakEntry,
  type StaffMember,
  getBreakDurationMinutes,
  getShortageMinutes,
  getTotalCompletedMinutes,
  parseDateKey,
} from "@/lib/break-management";
import { formatIsoTimeInTokyo, formatTokyoSentAtLabel } from "@/lib/tokyo-time";

const SLOT_LABELS = ["①", "②", "③", "④"] as const;

export function formatBusinessDateShortLabel(dateKey: string): string {
  const date = parseDateKey(dateKey);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
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

  const start = formatIsoTimeInTokyo(entry.startAt);
  const end = formatIsoTimeInTokyo(entry.endAt);
  const minutes = getBreakDurationMinutes(entry);
  if (start === "—" || end === "—" || minutes <= 0) return "未記録";
  return `${start}〜${end}（${minutes}分）`;
}

function staffHasAnyBreakRecord(staff: StaffMember): boolean {
  return staff.breaks.some((entry) => entry.startAt || entry.endAt);
}

function formatStaffSection(staff: StaffMember): string {
  const lines: string[] = [];
  lines.push(`■ ${staff.name}`);
  lines.push(`必要休憩時間：${staff.requiredMinutes}分`);

  if (!staffHasAnyBreakRecord(staff)) {
    lines.push("休憩記録なし");
  } else {
    for (let index = 0; index < BREAK_SLOT_COUNT; index += 1) {
      lines.push(`休憩${SLOT_LABELS[index]}：${formatBreakSlotForReport(staff.breaks[index])}`);
    }
  }

  lines.push(`取得休憩時間：${getTotalCompletedMinutes(staff)}分`);
  lines.push(`休憩不足時間：${getShortageMinutes(staff)}分`);
  return lines.join("\n");
}

export const BREAK_REPORT_FORMAT_VERSION = "jst-v2-utc-offset";

export function buildBreakReportEmailSubject(businessDate: string): string {
  return `【solfa 休憩管理】${formatBusinessDateShortLabel(businessDate)}営業分`;
}

export function buildBreakReportEmailBody(businessDate: string, staff: StaffMember[], sentAt: Date): string {
  const sections = staff.map((member) => formatStaffSection(member));
  const body = [
    `営業日：${formatBusinessDateShortLabel(businessDate)}`,
    "",
    ...sections.flatMap((section, index) => (index < sections.length - 1 ? [section, ""] : [section])),
    "",
    `スタッフ数：${staff.length}名`,
    `送信日時：${formatSentAtLabel(sentAt)}`,
  ];
  return body.join("\n");
}

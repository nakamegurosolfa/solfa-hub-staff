import {
  BREAK_SLOT_COUNT,
  type StaffMember,
  getBreakDurationMinutes,
} from "@/lib/break-management";
import { isValidHhmm } from "@/lib/break-time";

const SLOT_LABELS = ["①", "②", "③", "④"] as const;

export type BreakInspectionIssue = {
  staffName: string;
  message: string;
};

function hasCompletedBreak(staff: StaffMember): boolean {
  return staff.breaks.some(
    (entry) => entry.startAt && entry.endAt && getBreakDurationMinutes(entry) > 0,
  );
}

export function inspectDayIssues(staff: StaffMember[]): BreakInspectionIssue[] {
  const issues: BreakInspectionIssue[] = [];

  for (const member of staff) {
    for (let index = 0; index < BREAK_SLOT_COUNT; index += 1) {
      const entry = member.breaks[index];
      const slotLabel = `休憩${SLOT_LABELS[index]}`;

      if (entry.startAt && !isValidHhmm(entry.startAt)) {
        issues.push({ staffName: member.name, message: `${slotLabel}の開始時刻が不正です` });
      }
      if (entry.endAt && !isValidHhmm(entry.endAt)) {
        issues.push({ staffName: member.name, message: `${slotLabel}の終了時刻が不正です` });
      }
      if (entry.startAt && !entry.endAt) {
        issues.push({ staffName: member.name, message: `${slotLabel}の終了時刻が未入力` });
      }
      if (!entry.startAt && entry.endAt) {
        issues.push({ staffName: member.name, message: `${slotLabel}の開始未入力` });
      }
    }

    if (!hasCompletedBreak(member)) {
      issues.push({ staffName: member.name, message: "完了済みの休憩記録がありません" });
    }
  }

  return issues;
}

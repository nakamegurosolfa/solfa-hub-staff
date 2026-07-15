import {
  formatTokyoBusinessDateLabel,
  formatTokyoDateKey,
  shiftTokyoDateKey,
} from "@/lib/tokyo-time";

export {
  BREAK_SLOT_COUNT,
  type BreakEntry,
  type BreakStaffMember,
  type RequiredBreakMinutes,
  createEmptyBreakEntries,
} from "@/lib/breaks-types";

export type { BreakStaffMember as StaffMember } from "@/lib/breaks-types";

import type { BreakEntry, BreakStaffMember } from "@/lib/breaks-types";
import {
  formatHhmmInputValue,
  formatHhmmLabel,
  getBreakDurationMinutes as calcBreakDurationMinutes,
  getShortageMinutes as calcShortageMinutes,
  getTotalCompletedMinutes as calcTotalCompletedMinutes,
  isStaffOnBreak as calcIsStaffOnBreak,
  isValidHhmm,
  normalizeHhmm,
} from "@/lib/break-time";

export { isValidHhmm, normalizeHhmm, calcBreakDurationMinutes as getBreakDurationMinutes };

export function formatTimeLabel(hhmm: string | null): string {
  return formatHhmmLabel(hhmm);
}

export function formatTimeInputValue(hhmm: string | null): string {
  return formatHhmmInputValue(hhmm);
}

export function todayBusinessDate(): string {
  return formatTokyoDateKey(new Date());
}

export function shiftBusinessDate(dateKey: string, days: number): string {
  return shiftTokyoDateKey(dateKey, days);
}

export function formatBusinessDateLabel(dateKey: string): string {
  return formatTokyoBusinessDateLabel(dateKey);
}

export function formatMinutesLabel(minutes: number): string {
  return `${minutes}分`;
}

export function getTotalCompletedMinutes(
  staff: BreakStaffMember | { breaks: BreakEntry[] },
): number {
  return calcTotalCompletedMinutes(staff.breaks);
}

export function getShortageMinutes(staff: BreakStaffMember): number {
  return calcShortageMinutes(staff.requiredMinutes, staff.breaks);
}

export function isStaffOnBreak(staff: BreakStaffMember | { breaks: BreakEntry[] }): boolean {
  return calcIsStaffOnBreak(staff.breaks);
}

export type BreakReportStaffPayload = {
  name: string;
  requiredMinutes: BreakStaffMember["requiredMinutes"];
  breaks: BreakEntry[];
};

export function toBreakReportPayload(staff: BreakStaffMember[]): BreakReportStaffPayload[] {
  return staff.map((member) => ({
    name: member.name,
    requiredMinutes: member.requiredMinutes,
    breaks: member.breaks.map((entry) => ({
      startAt: entry.startAt,
      endAt: entry.endAt,
    })),
  }));
}

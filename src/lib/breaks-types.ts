export const BREAK_SLOT_COUNT = 4;

export type RequiredBreakMinutes = 45 | 60;

export type BreakEntry = {
  startAt: string | null;
  endAt: string | null;
};

export type BreakStaffMember = {
  id: string;
  name: string;
  businessDate: string;
  requiredMinutes: RequiredBreakMinutes;
  breaks: BreakEntry[];
  completedMinutes: number;
  shortageMinutes: number;
  createdAt: string;
  updatedAt: string;
};

export const BREAK_PROPERTY_NAMES = {
  recordName: "名前",
  staffName: "スタッフ名",
  businessDate: "営業日",
  requiredMinutes: "必要休憩時間",
  break1Start: "休憩①開始",
  break1End: "休憩①終了",
  break2Start: "休憩②開始",
  break2End: "休憩②終了",
  break3Start: "休憩③開始",
  break3End: "休憩③終了",
  break4Start: "休憩④開始",
  break4End: "休憩④終了",
  completedMinutes: "取得休憩時間",
  shortageMinutes: "休憩不足時間",
} as const;

export const BREAK_SLOT_PROPERTY_KEYS = [
  { start: BREAK_PROPERTY_NAMES.break1Start, end: BREAK_PROPERTY_NAMES.break1End },
  { start: BREAK_PROPERTY_NAMES.break2Start, end: BREAK_PROPERTY_NAMES.break2End },
  { start: BREAK_PROPERTY_NAMES.break3Start, end: BREAK_PROPERTY_NAMES.break3End },
  { start: BREAK_PROPERTY_NAMES.break4Start, end: BREAK_PROPERTY_NAMES.break4End },
] as const;

export type BreakStaffInput = {
  businessDate: string;
  name: string;
  requiredMinutes: RequiredBreakMinutes;
};

export type BreakStaffUpdateInput = {
  breaks: BreakEntry[];
};

export function createEmptyBreakEntries(): BreakEntry[] {
  return Array.from({ length: BREAK_SLOT_COUNT }, () => ({
    startAt: null,
    endAt: null,
  }));
}

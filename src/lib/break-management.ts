import {
  buildEndIsoFromTokyo,
  buildIsoFromTokyoDateAndTime,
  formatIsoTimeInTokyo,
  formatIsoTimeInputInTokyo,
  formatTokyoBusinessDateLabel,
  formatTokyoDateKey,
  shiftTokyoDateKey,
} from "@/lib/tokyo-time";

export const BREAK_SLOT_COUNT = 4;
export const BREAKS_STORAGE_KEY = "solfa-break-management";
export const BREAKS_EVENT = "solfa-break-management-change";

export type RequiredBreakMinutes = 45 | 60;

export type BreakEntry = {
  startAt: string | null;
  endAt: string | null;
};

export type StaffMember = {
  id: string;
  name: string;
  requiredMinutes: RequiredBreakMinutes;
  breaks: BreakEntry[];
};

type DayRecord = {
  staff: StaffMember[];
};

type BreakStorage = Record<string, DayRecord>;

function readStorage(): BreakStorage {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(BREAKS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as BreakStorage;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStorage(data: BreakStorage) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BREAKS_STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event(BREAKS_EVENT));
}

export function createEmptyBreaks(): BreakEntry[] {
  return Array.from({ length: BREAK_SLOT_COUNT }, () => ({
    startAt: null,
    endAt: null,
  }));
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

export function formatTimeLabel(iso: string | null): string {
  return formatIsoTimeInTokyo(iso);
}

export function formatTimeInputValue(iso: string | null): string {
  return formatIsoTimeInputInTokyo(iso);
}

export function getBreakDurationMinutes(entry: BreakEntry): number {
  if (!entry.startAt || !entry.endAt) return 0;
  const start = new Date(entry.startAt);
  const end = new Date(entry.endAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  const diffMs = end.getTime() - start.getTime();
  if (diffMs <= 0) return 0;
  return Math.round(diffMs / 60_000);
}

export function getTotalCompletedMinutes(staff: StaffMember): number {
  return staff.breaks.reduce((sum, entry) => sum + getBreakDurationMinutes(entry), 0);
}

export function getShortageMinutes(staff: StaffMember): number {
  const shortage = staff.requiredMinutes - getTotalCompletedMinutes(staff);
  return Math.max(0, shortage);
}

export function isStaffOnBreak(staff: StaffMember): boolean {
  return staff.breaks.some((entry) => entry.startAt && !entry.endAt);
}

export function formatMinutesLabel(minutes: number): string {
  return `${minutes}分`;
}

export function getStaffForDay(businessDate: string): StaffMember[] {
  const data = readStorage();
  return data[businessDate]?.staff ?? [];
}

function updateDay(businessDate: string, updater: (day: DayRecord) => DayRecord) {
  const data = readStorage();
  const current = data[businessDate] ?? { staff: [] };
  data[businessDate] = updater(current);
  writeStorage(data);
}

export function addStaffMember(
  businessDate: string,
  input: { name: string; requiredMinutes: RequiredBreakMinutes },
): StaffMember {
  const staff: StaffMember = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    requiredMinutes: input.requiredMinutes,
    breaks: createEmptyBreaks(),
  };
  updateDay(businessDate, (day) => ({ staff: [...day.staff, staff] }));
  return staff;
}

export function removeStaffMember(businessDate: string, staffId: string) {
  updateDay(businessDate, (day) => ({
    staff: day.staff.filter((member) => member.id !== staffId),
  }));
}

export function getStaffMember(businessDate: string, staffId: string): StaffMember | null {
  return getStaffForDay(businessDate).find((member) => member.id === staffId) ?? null;
}

function updateStaffMember(
  businessDate: string,
  staffId: string,
  updater: (member: StaffMember) => StaffMember,
) {
  updateDay(businessDate, (day) => ({
    staff: day.staff.map((member) => (member.id === staffId ? updater(member) : member)),
  }));
}

export function setBreakStart(businessDate: string, staffId: string, breakIndex: number) {
  const now = new Date().toISOString();
  updateStaffMember(businessDate, staffId, (member) => {
    const breaks = [...member.breaks];
    breaks[breakIndex] = { startAt: now, endAt: null };
    return { ...member, breaks };
  });
}

export function setBreakEnd(businessDate: string, staffId: string, breakIndex: number) {
  const now = new Date().toISOString();
  updateStaffMember(businessDate, staffId, (member) => {
    const breaks = [...member.breaks];
    const current = breaks[breakIndex];
    if (!current?.startAt) return member;
    breaks[breakIndex] = { ...current, endAt: now };
    return { ...member, breaks };
  });
}

export function updateBreakStartTime(
  businessDate: string,
  staffId: string,
  breakIndex: number,
  hhmm: string,
) {
  const iso = buildIsoFromTokyoDateAndTime(businessDate, hhmm);
  if (!iso) return;
  updateStaffMember(businessDate, staffId, (member) => {
    const breaks = [...member.breaks];
    const current = breaks[breakIndex];
    let endAt = current.endAt;
    if (endAt) {
      const rebuiltEnd = buildEndIsoFromTokyo(iso, formatTimeInputValue(endAt));
      endAt = rebuiltEnd;
    }
    breaks[breakIndex] = { startAt: iso, endAt };
    return { ...member, breaks };
  });
}

export function updateBreakEndTime(
  businessDate: string,
  staffId: string,
  breakIndex: number,
  hhmm: string,
) {
  updateStaffMember(businessDate, staffId, (member) => {
    const breaks = [...member.breaks];
    const current = breaks[breakIndex];
    if (!current?.startAt) return member;
    const endIso = buildEndIsoFromTokyo(current.startAt, hhmm);
    if (!endIso) return member;
    breaks[breakIndex] = { ...current, endAt: endIso };
    return { ...member, breaks };
  });
}

export function deleteBusinessDay(businessDate: string) {
  const data = readStorage();
  if (!(businessDate in data)) return;
  delete data[businessDate];
  writeStorage(data);
}

export type BreakReportStaffPayload = {
  name: string;
  requiredMinutes: RequiredBreakMinutes;
  breaks: BreakEntry[];
};

export function toBreakReportPayload(staff: StaffMember[]): BreakReportStaffPayload[] {
  return staff.map((member) => ({
    name: member.name,
    requiredMinutes: member.requiredMinutes,
    breaks: member.breaks.map((entry) => ({
      startAt: entry.startAt,
      endAt: entry.endAt,
    })),
  }));
}

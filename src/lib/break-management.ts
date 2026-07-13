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

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function todayBusinessDate(): string {
  return formatDateKey(new Date());
}

export function shiftBusinessDate(dateKey: string, days: number): string {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + days);
  return formatDateKey(date);
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"] as const;

export function formatBusinessDateLabel(dateKey: string): string {
  const date = parseDateKey(dateKey);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日（${WEEKDAYS[date.getDay()]}）`;
}

export function formatTimeLabel(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function formatTimeInputValue(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function buildIsoFromDateAndTime(dateKey: string, hhmm: string): string | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  const base = parseDateKey(dateKey);
  base.setHours(hours, minutes, 0, 0);
  return base.toISOString();
}

export function buildEndIso(startIso: string, endHhmm: string): string | null {
  const start = new Date(startIso);
  if (Number.isNaN(start.getTime())) return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(endHhmm.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  const end = new Date(start);
  end.setHours(hours, minutes, 0, 0);
  if (end.getTime() <= start.getTime()) {
    end.setDate(end.getDate() + 1);
  }
  return end.toISOString();
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
  const iso = buildIsoFromDateAndTime(businessDate, hhmm);
  if (!iso) return;
  updateStaffMember(businessDate, staffId, (member) => {
    const breaks = [...member.breaks];
    const current = breaks[breakIndex];
    let endAt = current.endAt;
    if (endAt) {
      const rebuiltEnd = buildEndIso(iso, formatTimeInputValue(endAt));
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
    const endIso = buildEndIso(current.startAt, hhmm);
    if (!endIso) return member;
    breaks[breakIndex] = { ...current, endAt: endIso };
    return { ...member, breaks };
  });
}

import { useCallback, useEffect, useState } from "react";
import {
  BREAKS_EVENT,
  type RequiredBreakMinutes,
  type StaffMember,
  addStaffMember,
  getStaffForDay,
  getStaffMember,
  removeStaffMember,
  setBreakEnd,
  setBreakStart,
  updateBreakEndTime,
  updateBreakStartTime,
} from "@/lib/break-management";

export function useBreakStaffList(businessDate: string) {
  const [staff, setStaff] = useState<StaffMember[]>([]);

  const refresh = useCallback(() => {
    setStaff(getStaffForDay(businessDate));
  }, [businessDate]);

  useEffect(() => {
    refresh();
    window.addEventListener(BREAKS_EVENT, refresh);
    return () => window.removeEventListener(BREAKS_EVENT, refresh);
  }, [refresh]);

  const addStaff = useCallback(
    (input: { name: string; requiredMinutes: RequiredBreakMinutes }) => {
      addStaffMember(businessDate, input);
      refresh();
    },
    [businessDate, refresh],
  );

  const removeStaff = useCallback(
    (staffId: string) => {
      removeStaffMember(businessDate, staffId);
      refresh();
    },
    [businessDate, refresh],
  );

  return { staff, addStaff, removeStaff, refresh };
}

export function useBreakStaffDetail(businessDate: string, staffId: string) {
  const [staff, setStaff] = useState<StaffMember | null>(null);

  const refresh = useCallback(() => {
    setStaff(getStaffMember(businessDate, staffId));
  }, [businessDate, staffId]);

  useEffect(() => {
    refresh();
    window.addEventListener(BREAKS_EVENT, refresh);
    return () => window.removeEventListener(BREAKS_EVENT, refresh);
  }, [refresh]);

  const startBreak = useCallback(
    (breakIndex: number) => {
      setBreakStart(businessDate, staffId, breakIndex);
      refresh();
    },
    [businessDate, staffId, refresh],
  );

  const endBreak = useCallback(
    (breakIndex: number) => {
      setBreakEnd(businessDate, staffId, breakIndex);
      refresh();
    },
    [businessDate, staffId, refresh],
  );

  const editStartTime = useCallback(
    (breakIndex: number, hhmm: string) => {
      updateBreakStartTime(businessDate, staffId, breakIndex, hhmm);
      refresh();
    },
    [businessDate, staffId, refresh],
  );

  const editEndTime = useCallback(
    (breakIndex: number, hhmm: string) => {
      updateBreakEndTime(businessDate, staffId, breakIndex, hhmm);
      refresh();
    },
    [businessDate, staffId, refresh],
  );

  const removeStaff = useCallback(() => {
    removeStaffMember(businessDate, staffId);
    refresh();
  }, [businessDate, staffId, refresh]);

  return {
    staff,
    startBreak,
    endBreak,
    editStartTime,
    editEndTime,
    removeStaff,
    refresh,
  };
}

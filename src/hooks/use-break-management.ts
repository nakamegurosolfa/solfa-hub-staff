import { useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatTokyoTimeHhmm } from "@/lib/tokyo-time";

import {
  createBreakStaff,
  deleteBreakStaff,
  fetchBreakStaff,
  fetchBreakStaffList,
  updateBreakStaff,
} from "@/lib/breaks-functions";
import type { BreakEntry, RequiredBreakMinutes, StaffMember } from "@/lib/break-management";
import { normalizeHhmm } from "@/lib/break-management";

export type BreakSaveStatus = "idle" | "loading" | "saving" | "saved" | "error";

const BREAKS_QUERY_KEY = (businessDate: string) => ["breaks", businessDate] as const;
const BREAK_STAFF_QUERY_KEY = (staffId: string) => ["break-staff", staffId] as const;
const AUTO_REFRESH_MS = 45_000;
const SAVED_DISPLAY_MS = 2_000;

function currentTokyoHhmm(): string {
  return formatTokyoTimeHhmm(new Date());
}

function applyBreakMutation(
  breaks: BreakEntry[],
  breakIndex: number,
  updater: (entry: BreakEntry) => BreakEntry,
): BreakEntry[] {
  return breaks.map((entry, index) => (index === breakIndex ? updater(entry) : entry));
}

export function useBreakStaffList(businessDate: string) {
  const queryClient = useQueryClient();
  const [saveStatus, setSaveStatus] = useState<BreakSaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: BREAKS_QUERY_KEY(businessDate),
    queryFn: () => fetchBreakStaffList({ data: businessDate }),
    refetchInterval: AUTO_REFRESH_MS,
  });

  const refresh = useCallback(async () => {
    setSaveStatus("loading");
    setSaveError(null);
    try {
      await queryClient.invalidateQueries({ queryKey: BREAKS_QUERY_KEY(businessDate) });
      setSaveStatus("idle");
    } catch {
      setSaveStatus("error");
      setSaveError("データの取得に失敗しました。");
    }
  }, [businessDate, queryClient]);

  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === "visible") {
        void queryClient.invalidateQueries({ queryKey: BREAKS_QUERY_KEY(businessDate) });
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [businessDate, queryClient]);

  const addStaff = useCallback(
    async (input: { name: string; requiredMinutes: RequiredBreakMinutes }) => {
      const trimmed = input.name.trim();
      if (!trimmed) return false;
      setSaveStatus("saving");
      setSaveError(null);
      try {
        await createBreakStaff({
          data: {
            businessDate,
            name: trimmed,
            requiredMinutes: input.requiredMinutes,
          },
        });
        await queryClient.invalidateQueries({ queryKey: BREAKS_QUERY_KEY(businessDate) });
        setSaveStatus("saved");
        window.setTimeout(() => setSaveStatus("idle"), SAVED_DISPLAY_MS);
        return true;
      } catch (error) {
        setSaveStatus("error");
        setSaveError(error instanceof Error ? error.message : "スタッフの追加に失敗しました。");
        return false;
      }
    },
    [businessDate, queryClient],
  );

  const removeStaff = useCallback(
    async (staffId: string) => {
      setSaveStatus("saving");
      setSaveError(null);
      try {
        await deleteBreakStaff({ data: staffId });
        await queryClient.invalidateQueries({ queryKey: BREAKS_QUERY_KEY(businessDate) });
        setSaveStatus("saved");
        window.setTimeout(() => setSaveStatus("idle"), SAVED_DISPLAY_MS);
      } catch {
        setSaveStatus("error");
        setSaveError("スタッフの削除に失敗しました。");
      }
    },
    [businessDate, queryClient],
  );

  return {
    staff: query.data ?? [],
    loading: query.isLoading,
    refreshing: query.isFetching && !query.isLoading,
    saveStatus,
    saveError,
    addStaff,
    removeStaff,
    refresh,
  };
}

export function useBreakStaffDetail(businessDate: string, staffId: string) {
  const queryClient = useQueryClient();
  const [saveStatus, setSaveStatus] = useState<BreakSaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: BREAK_STAFF_QUERY_KEY(staffId),
    queryFn: () => fetchBreakStaff({ data: staffId }),
    refetchInterval: AUTO_REFRESH_MS,
  });

  const staff = query.data ?? null;

  const refresh = useCallback(async () => {
    setSaveStatus("loading");
    setSaveError(null);
    try {
      await queryClient.invalidateQueries({ queryKey: BREAK_STAFF_QUERY_KEY(staffId) });
      await queryClient.invalidateQueries({ queryKey: BREAKS_QUERY_KEY(businessDate) });
      setSaveStatus("idle");
    } catch {
      setSaveStatus("error");
      setSaveError("データの取得に失敗しました。");
    }
  }, [businessDate, queryClient, staffId]);

  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === "visible") {
        void queryClient.invalidateQueries({ queryKey: BREAK_STAFF_QUERY_KEY(staffId) });
        void queryClient.invalidateQueries({ queryKey: BREAKS_QUERY_KEY(businessDate) });
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [businessDate, queryClient, staffId]);

  const persistBreaks = useCallback(
    async (nextBreaks: BreakEntry[]) => {
      setSaveStatus("saving");
      setSaveError(null);
      try {
        const updated = await updateBreakStaff({
          data: {
            staffId,
            breaks: nextBreaks,
          },
        });
        queryClient.setQueryData(BREAK_STAFF_QUERY_KEY(staffId), updated);
        await queryClient.invalidateQueries({ queryKey: BREAKS_QUERY_KEY(businessDate) });
        setSaveStatus("saved");
        window.setTimeout(() => setSaveStatus("idle"), SAVED_DISPLAY_MS);
      } catch {
        setSaveStatus("error");
        setSaveError("保存に失敗しました。");
      }
    },
    [businessDate, queryClient, staffId],
  );

  const startBreak = useCallback(
    async (breakIndex: number) => {
      if (!staff) return;
      const now = currentTokyoHhmm();
      const nextBreaks = applyBreakMutation(staff.breaks, breakIndex, () => ({
        startAt: now,
        endAt: null,
      }));
      await persistBreaks(nextBreaks);
    },
    [persistBreaks, staff],
  );

  const endBreak = useCallback(
    async (breakIndex: number) => {
      if (!staff) return;
      const current = staff.breaks[breakIndex];
      if (!current?.startAt) return;
      const now = currentTokyoHhmm();
      const nextBreaks = applyBreakMutation(staff.breaks, breakIndex, (entry) => ({
        ...entry,
        endAt: now,
      }));
      await persistBreaks(nextBreaks);
    },
    [persistBreaks, staff],
  );

  const editStartTime = useCallback(
    async (breakIndex: number, hhmm: string) => {
      if (!staff) return;
      const normalized = normalizeHhmm(hhmm);
      if (!normalized) return;
      const nextBreaks = applyBreakMutation(staff.breaks, breakIndex, (entry) => ({
        ...entry,
        startAt: normalized,
      }));
      await persistBreaks(nextBreaks);
    },
    [persistBreaks, staff],
  );

  const editEndTime = useCallback(
    async (breakIndex: number, hhmm: string) => {
      if (!staff) return;
      const current = staff.breaks[breakIndex];
      if (!current?.startAt) return;
      const normalized = normalizeHhmm(hhmm);
      if (!normalized) return;
      const nextBreaks = applyBreakMutation(staff.breaks, breakIndex, (entry) => ({
        ...entry,
        endAt: normalized,
      }));
      await persistBreaks(nextBreaks);
    },
    [persistBreaks, staff],
  );

  const removeStaff = useCallback(async () => {
    setSaveStatus("saving");
    setSaveError(null);
    try {
      await deleteBreakStaff({ data: staffId });
      await queryClient.invalidateQueries({ queryKey: BREAKS_QUERY_KEY(businessDate) });
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
      setSaveError("スタッフの削除に失敗しました。");
    }
  }, [businessDate, queryClient, staffId]);

  return {
    staff,
    loading: query.isLoading,
    saveStatus,
    saveError,
    startBreak,
    endBreak,
    editStartTime,
    editEndTime,
    removeStaff,
    refresh,
  };
}

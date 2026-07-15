import { useCallback, useState } from "react";

import { archiveBreakBusinessDay, fetchBreakStaffList } from "@/lib/breaks-functions";
import { sendBreakReport } from "@/lib/break-functions";
import { toBreakReportPayload } from "@/lib/break-management";

export function useCloseBusinessDay(businessDate: string, onDeleted: () => void) {
  const [sending, setSending] = useState(false);

  const closeAndSend = useCallback(async () => {
    setSending(true);
    try {
      const staff = await fetchBreakStaffList({ data: businessDate });
      if (staff.length === 0) {
        return { success: false as const, error: "送信対象のスタッフがいません。" };
      }

      const result = await sendBreakReport({
        data: {
          businessDate,
          staff: toBreakReportPayload(staff),
        },
      });

      if (!result.success) {
        return { success: false as const, error: result.error };
      }

      await archiveBreakBusinessDay({ data: businessDate });
      onDeleted();
      return { success: true as const };
    } catch {
      return { success: false as const, error: "メール送信に失敗しました。" };
    } finally {
      setSending(false);
    }
  }, [businessDate, onDeleted]);

  return { sending, closeAndSend };
}

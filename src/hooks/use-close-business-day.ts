import { useCallback, useState } from "react";

import { sendBreakReport } from "@/lib/break-functions";
import {
  type StaffMember,
  deleteBusinessDay,
  toBreakReportPayload,
} from "@/lib/break-management";

export function useCloseBusinessDay(businessDate: string, onDeleted: () => void) {
  const [sending, setSending] = useState(false);

  const closeAndSend = useCallback(
    async (staff: StaffMember[]) => {
      setSending(true);
      try {
        const result = await sendBreakReport({
          data: {
            businessDate,
            staff: toBreakReportPayload(staff),
          },
        });

        if (!result.success) {
          return { success: false as const, error: result.error };
        }

        deleteBusinessDay(businessDate);
        onDeleted();
        return { success: true as const };
      } catch {
        return { success: false as const, error: "メール送信に失敗しました。" };
      } finally {
        setSending(false);
      }
    },
    [businessDate, onDeleted],
  );

  return { sending, closeAndSend };
}

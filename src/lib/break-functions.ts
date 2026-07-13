import { createServerFn } from "@tanstack/react-start";

import { requireAppAuth } from "@/lib/auth.server";
import { breakReportInputSchema, sendBreakReportEmail } from "@/lib/break-report.server";

export const sendBreakReport = createServerFn({ method: "POST" })
  .validator(breakReportInputSchema)
  .handler(async ({ data }) => {
    await requireAppAuth();
    return sendBreakReportEmail(data);
  });

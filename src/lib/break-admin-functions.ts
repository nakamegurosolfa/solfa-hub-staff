import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  establishBreakAdminSession,
  verifyBreakAdminPassword,
} from "@/lib/break-admin-auth.server";
import { requireAppAuth } from "@/lib/auth.server";

export const verifyBreakAdminPasswordFn = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string() }))
  .handler(async ({ data }) => {
    await requireAppAuth();
    const result = verifyBreakAdminPassword(data.password);
    if (result.success) {
      await establishBreakAdminSession();
    }
    return result;
  });

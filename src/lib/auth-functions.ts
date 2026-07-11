import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  clearAuthCookies,
  getAuthStatus,
  loginWithAppPassword,
  loginWithEmployeePassword,
} from "@/lib/auth.server";

export const fetchAuthStatus = createServerFn({ method: "GET" }).handler(async () => getAuthStatus());

export const loginApp = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string().min(1) }))
  .handler(async ({ data }) => loginWithAppPassword(data.password));

export const loginEmployee = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string().min(1) }))
  .handler(async ({ data }) => loginWithEmployeePassword(data.password));

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  clearAuthCookies();
  return { success: true as const };
});

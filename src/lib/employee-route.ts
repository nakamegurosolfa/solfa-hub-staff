import { redirect } from "@tanstack/react-router";

import type { AuthStatus } from "@/lib/auth.server";

export function redirectToEmployeeLoginIfNeeded(
  auth: AuthStatus,
  employeeOnly: boolean,
  redirectPath: string,
) {
  if (employeeOnly && !auth.employeeAuthenticated) {
    throw redirect({ to: "/employee-login", search: { redirect: redirectPath } });
  }
}

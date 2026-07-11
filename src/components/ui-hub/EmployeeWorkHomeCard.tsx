import { Link, useRouteContext } from "@tanstack/react-router";
import { Briefcase, ChevronRight, Lock } from "lucide-react";

import { EmployeeOnlyBadge } from "@/components/auth/PasswordGateScreen";
import { EMPLOYEE_WORK_PATH } from "@/data/app-sections";

const EMPLOYEE_WORK_COLOR = "#E8A838";

export function EmployeeWorkHomeCard() {
  const { auth } = useRouteContext({ from: "__root__" });
  const needsEmployeeAuth = !auth.employeeAuthenticated;

  return (
    <Link
      to={needsEmployeeAuth ? "/employee-login" : EMPLOYEE_WORK_PATH}
      search={needsEmployeeAuth ? { redirect: EMPLOYEE_WORK_PATH } : undefined}
      className="tap grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-3xl border border-border bg-[var(--color-surface)] px-5 py-5 hover:bg-[var(--color-surface-2)]"
    >
      <span
        className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl"
        style={{ backgroundColor: EMPLOYEE_WORK_COLOR + "1F", color: EMPLOYEE_WORK_COLOR }}
        aria-hidden
      >
        <Briefcase className="h-7 w-7" strokeWidth={1.6} />
      </span>

      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-2">
          <span className="block truncate text-[17px] font-semibold tracking-tight">社員業務</span>
          <EmployeeOnlyBadge />
        </span>
        <span className="mt-1 block truncate text-[13px] text-muted-foreground">
          事務処理・各種管理
        </span>
      </span>

      <span className="flex shrink-0 items-center gap-1 text-muted-foreground">
        <Lock className="h-4 w-4" aria-hidden />
        <ChevronRight className="h-5 w-5" />
      </span>
    </Link>
  );
}

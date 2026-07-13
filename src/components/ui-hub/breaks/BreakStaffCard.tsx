import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import {
  formatMinutesLabel,
  getShortageMinutes,
  getTotalCompletedMinutes,
  isStaffOnBreak,
  type StaffMember,
} from "@/lib/break-management";

type BreakStaffCardProps = {
  staff: StaffMember;
  businessDate: string;
};

export function BreakStaffCard({ staff, businessDate }: BreakStaffCardProps) {
  const total = getTotalCompletedMinutes(staff);
  const shortage = getShortageMinutes(staff);
  const onBreak = isStaffOnBreak(staff);

  return (
    <Link
      to="/breaks/$staffId"
      params={{ staffId: staff.id }}
      search={{ date: businessDate }}
      className="tap grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-4 hover:bg-[var(--color-surface-2)]"
    >
      <span className="min-w-0">
        <span className="flex items-center gap-2">
          <span className="block truncate text-base font-semibold">{staff.name}</span>
          {onBreak ? (
            <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
              休憩中
            </span>
          ) : null}
        </span>
        <span className="mt-1 block text-sm text-muted-foreground">
          合計休憩 {formatMinutesLabel(total)} ・ 不足 {formatMinutesLabel(shortage)}
        </span>
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
    </Link>
  );
}

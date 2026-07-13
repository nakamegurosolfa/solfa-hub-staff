import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { BreakSlotRow } from "@/components/ui-hub/breaks/BreakSlotRow";
import { useBreakStaffDetail } from "@/hooks/use-break-management";
import { appPageTitle } from "@/data/app-sections";
import {
  formatMinutesLabel,
  getShortageMinutes,
  getTotalCompletedMinutes,
  todayBusinessDate,
} from "@/lib/break-management";

const breakDetailSearchSchema = z.object({
  date: z.string().optional(),
});

export const Route = createFileRoute("/breaks/$staffId")({
  validateSearch: breakDetailSearchSchema,
  head: () => ({ meta: [{ title: appPageTitle("スタッフ詳細 — 休憩管理") }] }),
  component: BreakStaffDetailPage,
});

function BreakStaffDetailPage() {
  const { staffId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const businessDate = search.date ?? todayBusinessDate();
  const { staff, startBreak, endBreak, editStartTime, editEndTime, removeStaff } =
    useBreakStaffDetail(businessDate, staffId);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!staff) {
    return (
      <AppShell>
        <Link
          to="/breaks"
          search={{ date: businessDate }}
          className="tap mb-4 inline-flex items-center gap-1 text-sm font-medium text-primary"
        >
          <span aria-hidden>‹</span> 休憩管理
        </Link>
        <PageHeader title="スタッフ詳細" />
        <p className="rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-8 text-center text-sm text-muted-foreground">
          スタッフが見つかりませんでした。
        </p>
      </AppShell>
    );
  }

  const total = getTotalCompletedMinutes(staff);
  const shortage = getShortageMinutes(staff);

  const handleDelete = () => {
    removeStaff();
    setDeleteOpen(false);
    navigate({ to: "/breaks", search: { date: businessDate } });
  };

  return (
    <AppShell>
      <Link
        to="/breaks"
        search={{ date: businessDate }}
        className="tap mb-4 inline-flex items-center gap-1 text-sm font-medium text-primary"
      >
        <span aria-hidden>‹</span> 休憩管理
      </Link>
      <PageHeader title={staff.name} subtitle={`必要休憩 ${formatMinutesLabel(staff.requiredMinutes)}`} />

      <div className="space-y-3">
        <div className="rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">合計休憩時間</p>
              <p className="mt-1 font-semibold">{formatMinutesLabel(total)}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">休憩不足時間</p>
              <p className="mt-1 font-semibold">{formatMinutesLabel(shortage)}</p>
            </div>
          </div>
        </div>

        {staff.breaks.map((entry, index) => (
          <BreakSlotRow
            key={index}
            index={index}
            entry={entry}
            onStart={() => startBreak(index)}
            onEnd={() => endBreak(index)}
            onEditStart={(hhmm) => editStartTime(index, hhmm)}
            onEditEnd={(hhmm) => editEndTime(index, hhmm)}
          />
        ))}

        <Button
          type="button"
          variant="outline"
          className="w-full border-destructive/40 text-destructive hover:bg-destructive/10"
          onClick={() => setDeleteOpen(true)}
        >
          この営業日から削除
        </Button>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>スタッフを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              {staff.name} をこの営業日（{businessDate}）の記録から削除します。この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>削除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

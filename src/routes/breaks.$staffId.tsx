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
import { BreakAdminAuthDialog } from "@/components/ui-hub/breaks/BreakAdminAuthDialog";
import { BreakSlotRow } from "@/components/ui-hub/breaks/BreakSlotRow";
import { BreakSyncStatus } from "@/components/ui-hub/breaks/BreakSyncStatus";
import { useBreakStaffDetail } from "@/hooks/use-break-management";
import { appPageTitle } from "@/data/app-sections";
import { verifyBreakAdminPasswordFn } from "@/lib/break-admin-functions";
import {
  isBreakAdminAuthenticated,
  setBreakAdminAuthenticated,
} from "@/lib/break-admin-session";
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
  const {
    staff,
    loading,
    saveStatus,
    saveError,
    startBreak,
    endBreak,
    editStartTime,
    editEndTime,
    removeStaff,
    refresh,
  } = useBreakStaffDetail(businessDate, staffId);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [manualCorrectionEnabled, setManualCorrectionEnabled] = useState(false);

  if (loading && !staff) {
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
          読み込み中…
        </p>
      </AppShell>
    );
  }

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
  const isSaving = saveStatus === "saving";
  const hasCorrectableBreaks = staff.breaks.some((entry) => entry.startAt || entry.endAt);

  const handleRequestManualCorrection = () => {
    if (isBreakAdminAuthenticated()) {
      setManualCorrectionEnabled(true);
      return;
    }

    setAuthDialogOpen(true);
  };

  const handleAuthSuccess = () => {
    setBreakAdminAuthenticated();
    setManualCorrectionEnabled(true);
  };

  const handleAuthenticate = async (password: string) => verifyBreakAdminPasswordFn({ data: { password } });

  const handleDelete = async () => {
    setDeleting(true);
    await removeStaff();
    setDeleting(false);
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
      <PageHeader
        title={staff.name}
        subtitle={`必要休憩 ${formatMinutesLabel(staff.requiredMinutes)}`}
      />

      <div className="space-y-3">
        <BreakSyncStatus saveStatus={saveStatus} saveError={saveError} onRefresh={refresh} />

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

        {hasCorrectableBreaks && !manualCorrectionEnabled ? (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleRequestManualCorrection}
            disabled={isSaving}
          >
            手入力補正
          </Button>
        ) : null}

        {staff.breaks.map((entry, index) => (
          <BreakSlotRow
            key={index}
            index={index}
            entry={entry}
            disabled={isSaving}
            manualCorrectionEnabled={manualCorrectionEnabled}
            onStart={() => void startBreak(index)}
            onEnd={() => void endBreak(index)}
            onEditStart={(hhmm) => void editStartTime(index, hhmm)}
            onEditEnd={(hhmm) => void editEndTime(index, hhmm)}
          />
        ))}

        <Button
          type="button"
          variant="outline"
          className="w-full border-destructive/40 text-destructive hover:bg-destructive/10"
          onClick={() => setDeleteOpen(true)}
          disabled={isSaving || deleting}
        >
          この営業日から削除
        </Button>
      </div>

      <BreakAdminAuthDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        onAuthenticate={handleAuthenticate}
        onSuccess={handleAuthSuccess}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>スタッフを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              {staff.name} をこの営業日（{businessDate}
              ）の記録から削除します。この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleDelete()} disabled={deleting}>
              {deleting ? "削除中…" : "削除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

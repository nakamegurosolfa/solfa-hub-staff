import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { AppShell, BackLink, PageHeader } from "@/components/layout/AppShell";
import { BreakAddStaffDialog } from "@/components/ui-hub/breaks/BreakAddStaffDialog";
import {
  BreakCloseDayDialog,
  type BreakCloseDialogPhase,
} from "@/components/ui-hub/breaks/BreakCloseDayDialog";
import { BreakStaffCard } from "@/components/ui-hub/breaks/BreakStaffCard";
import { BreakSyncStatus } from "@/components/ui-hub/breaks/BreakSyncStatus";
import { BusinessDayNav } from "@/components/ui-hub/breaks/BusinessDayNav";
import { appPageTitle } from "@/data/app-sections";
import { useCloseBusinessDay } from "@/hooks/use-close-business-day";
import { useBreakStaffList } from "@/hooks/use-break-management";
import { fetchBreakStaffList } from "@/lib/breaks-functions";
import { inspectDayIssues } from "@/lib/break-report-inspection";
import { todayBusinessDate } from "@/lib/break-management";

const breakSearchSchema = z.object({
  date: z.string().optional(),
});

export const Route = createFileRoute("/breaks/")({
  validateSearch: breakSearchSchema,
  head: () => ({ meta: [{ title: appPageTitle("休憩管理") }] }),
  component: BreaksIndexPage,
});

function BreaksIndexPage() {
  const search = Route.useSearch();
  const [businessDate, setBusinessDate] = useState(search.date ?? todayBusinessDate());
  const [addOpen, setAddOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [closePhase, setClosePhase] = useState<BreakCloseDialogPhase>("confirm");
  const [closeIssues, setCloseIssues] = useState(() => inspectDayIssues([]));
  const { staff, loading, refreshing, saveStatus, saveError, addStaff, refresh } =
    useBreakStaffList(businessDate);
  const { sending, closeAndSend } = useCloseBusinessDay(businessDate, refresh);

  useEffect(() => {
    void refresh();
  }, [businessDate, refresh]);

  const openCloseDialog = useCallback(async () => {
    const latest = await fetchBreakStaffList({ data: businessDate });
    await refresh();
    const issues = inspectDayIssues(latest);
    setCloseIssues(issues);
    setClosePhase(issues.length > 0 ? "issues" : "confirm");
    setCloseOpen(true);
  }, [businessDate, refresh]);

  const handleSend = useCallback(async () => {
    const result = await closeAndSend();
    if (result.success) {
      setClosePhase("success");
      return;
    }
    setClosePhase("error");
  }, [closeAndSend]);

  const handleRetry = useCallback(async () => {
    await handleSend();
  }, [handleSend]);

  const handleAddStaff = useCallback(
    async (input: Parameters<typeof addStaff>[0]) => addStaff(input),
    [addStaff],
  );

  return (
    <AppShell>
      <BackLink to="/" label="ホーム" />
      <PageHeader
        title="休憩管理"
        subtitle="休憩時間の記録・確認"
        action={
          <button
            type="button"
            className="tap grid h-11 w-11 place-items-center rounded-2xl border border-border bg-[var(--color-surface)] text-primary hover:bg-[var(--color-surface-2)]"
            onClick={() => setAddOpen(true)}
            aria-label="スタッフを追加"
            disabled={saveStatus === "saving"}
          >
            <Plus className="h-5 w-5" />
          </button>
        }
      />

      <div className="space-y-4 pb-8">
        <BusinessDayNav businessDate={businessDate} onChange={setBusinessDate} />
        <BreakSyncStatus
          saveStatus={loading ? "loading" : saveStatus}
          saveError={saveError}
          refreshing={refreshing}
          onRefresh={refresh}
        />

        {loading ? (
          <p className="rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-8 text-center text-sm text-muted-foreground">
            読み込み中…
          </p>
        ) : staff.length === 0 ? (
          <p className="rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-8 text-center text-sm text-muted-foreground">
            スタッフが登録されていません。
            <br />
            右上の＋ボタンから追加してください。
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {staff.map((member) => (
              <BreakStaffCard key={member.id} staff={member} businessDate={businessDate} />
            ))}
          </div>
        )}

        <div className="pt-2">
          <button
            type="button"
            className="tap w-full rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-4 text-sm font-semibold text-foreground hover:bg-[var(--color-surface-2)] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={staff.length === 0 || sending || loading}
            onClick={() => void openCloseDialog()}
          >
            営業を締める
          </button>
        </div>
      </div>

      <BreakAddStaffDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdd={handleAddStaff}
        saving={saveStatus === "saving"}
      />
      <BreakCloseDayDialog
        open={closeOpen}
        onOpenChange={setCloseOpen}
        businessDate={businessDate}
        staffCount={staff.length}
        issues={closeIssues}
        phase={closePhase}
        sending={sending}
        onConfirmSend={handleSend}
        onRetry={handleRetry}
      />
    </AppShell>
  );
}

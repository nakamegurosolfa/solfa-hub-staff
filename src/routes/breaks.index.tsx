import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useCallback, useState } from "react";
import { z } from "zod";
import { AppShell, BackLink, PageHeader } from "@/components/layout/AppShell";
import { BreakAddStaffDialog } from "@/components/ui-hub/breaks/BreakAddStaffDialog";
import {
  BreakCloseDayDialog,
  type BreakCloseDialogPhase,
} from "@/components/ui-hub/breaks/BreakCloseDayDialog";
import { BreakStaffCard } from "@/components/ui-hub/breaks/BreakStaffCard";
import { BusinessDayNav } from "@/components/ui-hub/breaks/BusinessDayNav";
import { useCloseBusinessDay } from "@/hooks/use-close-business-day";
import { useBreakStaffList } from "@/hooks/use-break-management";
import { inspectDayIssues } from "@/lib/break-report-inspection";
import { todayBusinessDate } from "@/lib/break-management";

const breakSearchSchema = z.object({
  date: z.string().optional(),
});

export const Route = createFileRoute("/breaks/")({
  validateSearch: breakSearchSchema,
  head: () => ({ meta: [{ title: "休憩管理 — solfa MANUAL APP" }] }),
  component: BreaksIndexPage,
});

function BreaksIndexPage() {
  const search = Route.useSearch();
  const [businessDate, setBusinessDate] = useState(search.date ?? todayBusinessDate());
  const [addOpen, setAddOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [closePhase, setClosePhase] = useState<BreakCloseDialogPhase>("confirm");
  const [closeIssues, setCloseIssues] = useState(() => inspectDayIssues([]));
  const { staff, addStaff, refresh } = useBreakStaffList(businessDate);
  const { sending, closeAndSend } = useCloseBusinessDay(businessDate, refresh);

  const openCloseDialog = useCallback(() => {
    const issues = inspectDayIssues(staff);
    setCloseIssues(issues);
    setClosePhase(issues.length > 0 ? "issues" : "confirm");
    setCloseOpen(true);
  }, [staff]);

  const handleSend = useCallback(async () => {
    const result = await closeAndSend(staff);
    if (result.success) {
      setClosePhase("success");
      return;
    }
    setClosePhase("error");
  }, [closeAndSend, staff]);

  const handleRetry = useCallback(async () => {
    await handleSend();
  }, [handleSend]);

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
          >
            <Plus className="h-5 w-5" />
          </button>
        }
      />

      <div className="space-y-4 pb-8">
        <BusinessDayNav businessDate={businessDate} onChange={setBusinessDate} />

        {staff.length === 0 ? (
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
            disabled={staff.length === 0 || sending}
            onClick={openCloseDialog}
          >
            営業を締める
          </button>
        </div>
      </div>

      <BreakAddStaffDialog open={addOpen} onOpenChange={setAddOpen} onAdd={addStaff} />
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

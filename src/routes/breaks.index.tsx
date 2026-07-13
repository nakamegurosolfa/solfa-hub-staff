import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { AppShell, BackLink, PageHeader } from "@/components/layout/AppShell";
import { BreakAddStaffDialog } from "@/components/ui-hub/breaks/BreakAddStaffDialog";
import { BreakStaffCard } from "@/components/ui-hub/breaks/BreakStaffCard";
import { BusinessDayNav } from "@/components/ui-hub/breaks/BusinessDayNav";
import { useBreakStaffList } from "@/hooks/use-break-management";
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
  const { staff, addStaff } = useBreakStaffList(businessDate);

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

      <div className="space-y-4">
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
      </div>

      <BreakAddStaffDialog open={addOpen} onOpenChange={setAddOpen} onAdd={addStaff} />
    </AppShell>
  );
}

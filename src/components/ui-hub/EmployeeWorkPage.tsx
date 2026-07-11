import { AppShell, BackLink, PageHeader } from "@/components/layout/AppShell";
import { EmployeeWorkCard } from "@/components/ui-hub/EmployeeWorkCard";
import { SectionLabel } from "@/components/ui-hub/ListCard";
import { EMPLOYEE_WORK_LABEL } from "@/data/app-sections";
import { groupManualsByCategory } from "@/lib/manual-groups";
import type { ManualSummary } from "@/lib/notion-types";

const EMPLOYEE_WORK_SUBTITLE = "事務処理・各種管理";

export function EmployeeWorkPage({ items }: { items: ManualSummary[] }) {
  const groups = groupManualsByCategory(items);

  return (
    <AppShell>
      <BackLink to="/" label="ホーム" />
      <PageHeader title={EMPLOYEE_WORK_LABEL} subtitle={EMPLOYEE_WORK_SUBTITLE} />

      {groups.length === 0 ? (
        <p className="rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-6 text-center text-sm text-muted-foreground">
          社員業務マニュアルが見つかりません。
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <section key={group.category}>
              <SectionLabel>{group.category}</SectionLabel>
              <div className="flex flex-col gap-3">
                {group.items.map((item) => (
                  <EmployeeWorkCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </AppShell>
  );
}

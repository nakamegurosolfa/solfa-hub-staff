import { createFileRoute } from "@tanstack/react-router";

import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { EmployeeWorkPage } from "@/components/ui-hub/EmployeeWorkPage";
import { EMPLOYEE_WORK_LABEL, EMPLOYEE_WORK_PATH } from "@/data/app-sections";
import { fetchEmployeeWorkIndex } from "@/lib/notion-functions";
import { redirectToEmployeeLoginIfNeeded } from "@/lib/employee-route";

export const Route = createFileRoute("/employee-work/")({
  staleTime: 0,
  beforeLoad: ({ context }) => {
    redirectToEmployeeLoginIfNeeded(context.auth, true, EMPLOYEE_WORK_PATH);
  },
  loader: () => fetchEmployeeWorkIndex(),
  head: () => ({ meta: [{ title: appPageTitle(EMPLOYEE_WORK_LABEL) }] }),
  component: EmployeeWorkIndex,
  errorComponent: () => (
    <AppShell>
      <PageHeader title={EMPLOYEE_WORK_LABEL} />
      <p className="rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-6 text-center text-sm leading-relaxed text-muted-foreground">
        社員業務の読み込みに失敗しました。
        <br />
        Notion の「社員業務」データベースを Integration に接続し、
        <code className="text-foreground/80">NOTION_EMPLOYEE_WORK_DATABASE_ID</code> が正しいか確認してください。
      </p>
    </AppShell>
  ),
});

function EmployeeWorkIndex() {
  const items = Route.useLoaderData();
  return <EmployeeWorkPage items={items} />;
}

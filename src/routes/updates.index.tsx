import { createFileRoute } from "@tanstack/react-router";
import { AppShell, BackLink, PageHeader } from "@/components/layout/AppShell";
import { UpdateHistoryList } from "@/components/ui-hub/UpdateHistoryList";
import { UPDATE_HISTORY_ENTRIES } from "@/data/update-history-entries";
import { APP_VERSION, appPageTitle } from "@/data/app-sections";

export const Route = createFileRoute("/updates/")({
  head: () => ({ meta: [{ title: appPageTitle("更新履歴") }] }),
  component: UpdatesPage,
});

function UpdatesPage() {
  return (
    <AppShell>
      <BackLink to="/" label="ホーム" />
      <PageHeader title="更新履歴" subtitle="アプリの更新内容" version={APP_VERSION} />
      <UpdateHistoryList entries={UPDATE_HISTORY_ENTRIES} />
    </AppShell>
  );
}

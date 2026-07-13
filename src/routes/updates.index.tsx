import { createFileRoute } from "@tanstack/react-router";
import { AppShell, BackLink, PageHeader } from "@/components/layout/AppShell";
import { UpdateHistoryList } from "@/components/ui-hub/UpdateHistoryList";
import { APP_VERSION, appPageTitle } from "@/data/app-sections";
import { fetchUpdateHistory } from "@/lib/notion-functions";

export const Route = createFileRoute("/updates/")({
  loader: () => fetchUpdateHistory(),
  head: () => ({ meta: [{ title: appPageTitle("更新履歴") }] }),
  component: UpdatesPage,
  errorComponent: () => (
    <AppShell>
      <BackLink to="/" label="ホーム" />
      <PageHeader title="更新履歴" subtitle="最近追加・更新された内容" version={APP_VERSION} />
      <p className="text-muted-foreground">更新履歴の読み込みに失敗しました。</p>
    </AppShell>
  ),
});

function UpdatesPage() {
  const updates = Route.useLoaderData();

  return (
    <AppShell>
      <BackLink to="/" label="ホーム" />
      <PageHeader title="更新履歴" subtitle="最近追加・更新された内容" version={APP_VERSION} />
      <UpdateHistoryList items={updates} />
    </AppShell>
  );
}

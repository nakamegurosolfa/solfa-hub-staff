import { createFileRoute } from "@tanstack/react-router";
import { AppShell, BackLink, PageHeader } from "@/components/layout/AppShell";
import { UpdateHistoryList } from "@/components/ui-hub/UpdateHistoryList";
import { fetchUpdateHistory } from "@/lib/notion-functions";

export const Route = createFileRoute("/updates/")({
  loader: () => fetchUpdateHistory(),
  head: () => ({ meta: [{ title: "更新履歴 — solfa MANUAL APP" }] }),
  component: UpdatesPage,
  errorComponent: () => (
    <AppShell>
      <BackLink to="/" label="ホーム" />
      <PageHeader title="更新履歴" subtitle="最近追加・更新された内容" />
      <p className="text-muted-foreground">更新履歴の読み込みに失敗しました。</p>
    </AppShell>
  ),
});

function UpdatesPage() {
  const updates = Route.useLoaderData();

  return (
    <AppShell>
      <BackLink to="/" label="ホーム" />
      <PageHeader title="更新履歴" subtitle="最近追加・更新された内容" />
      <UpdateHistoryList items={updates} />
    </AppShell>
  );
}

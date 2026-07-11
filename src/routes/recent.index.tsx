import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { SavedPageList } from "@/components/ui-hub/SavedPageList";
import { useRecentPages } from "@/hooks/use-page-library";

export const Route = createFileRoute("/recent/")({
  head: () => ({ meta: [{ title: "最近 — solfa MANUAL APP" }] }),
  component: RecentPage,
});

function RecentPage() {
  const recentPages = useRecentPages();

  return (
    <AppShell>
      <PageHeader title="最近" subtitle="最近閲覧したページ" />
      <SavedPageList
        items={recentPages}
        emptyTitle="まだ閲覧履歴はありません。"
        emptyDescription="ページを開くとここに表示されます。"
      />
    </AppShell>
  );
}

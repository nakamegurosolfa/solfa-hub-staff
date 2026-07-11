import { createFileRoute } from "@tanstack/react-router";
import { AppShell, BackLink, PageHeader } from "@/components/layout/AppShell";
import { QaList } from "@/components/ui-hub/QaList";
import { fetchQaIndex } from "@/lib/notion-functions";
import { groupQaByCategory } from "@/lib/qa-groups";

export const Route = createFileRoute("/qa/")({
  loader: () => fetchQaIndex(),
  head: () => ({ meta: [{ title: "Q&A — solfa MANUAL APP" }] }),
  component: QaPage,
  errorComponent: () => (
    <AppShell>
      <BackLink to="/" label="ホーム" />
      <PageHeader title="Q&A" subtitle="こういう時はどうしたらいい？" />
      <p className="rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-6 text-center text-sm leading-relaxed text-muted-foreground">
        Q&Aの読み込みに失敗しました。
        <br />
        Notion の「業務マニュアル」データベースを Integration に接続し、
        <code className="text-foreground/80">NOTION_MANUAL_DATABASE_ID</code> が正しいか確認してください。
      </p>
    </AppShell>
  ),
});

function QaPage() {
  const items = Route.useLoaderData();
  const groups = groupQaByCategory(items);

  return (
    <AppShell>
      <BackLink to="/" label="ホーム" />
      <PageHeader title="Q&A" subtitle="こういう時はどうしたらいい？" />
      <QaList groups={groups} />
    </AppShell>
  );
}

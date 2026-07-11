import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { ManualCard } from "@/components/ui-hub/ManualCard";
import { SectionLabel } from "@/components/ui-hub/ListCard";
import { fetchManualIndex } from "@/lib/notion-functions";
import { groupManualsByCategory } from "@/lib/manual-groups";

export const Route = createFileRoute("/manuals/")({
  loader: () => fetchManualIndex(),
  head: () => ({ meta: [{ title: "業務マニュアル — solfa MANUAL APP" }] }),
  component: ManualsIndex,
  errorComponent: () => (
    <AppShell>
      <PageHeader title="業務マニュアル" subtitle="営業・受付・バー・清掃" />
      <p className="rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-6 text-center text-sm leading-relaxed text-muted-foreground">
        業務マニュアルの読み込みに失敗しました。
        <br />
        Notion の「業務マニュアル」データベースを Integration に接続し、
        <code className="text-foreground/80">NOTION_MANUAL_DATABASE_ID</code> が正しいか確認してください。
      </p>
    </AppShell>
  ),
});

function ManualsIndex() {
  const manuals = Route.useLoaderData();
  const groups = groupManualsByCategory(manuals);

  return (
    <AppShell>
      <PageHeader title="業務マニュアル" subtitle="営業・受付・バー・清掃" />

      {groups.length === 0 ? (
        <p className="rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-6 text-center text-sm text-muted-foreground">
          マニュアルが見つかりません。
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <section key={group.category}>
              <SectionLabel>{group.category}</SectionLabel>
              <div className="flex flex-col gap-3">
                {group.items.map((manual) => (
                  <ManualCard key={manual.id} manual={manual} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </AppShell>
  );
}

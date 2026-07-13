import { createFileRoute, notFound } from "@tanstack/react-router";
import { AppShell, BackLink } from "@/components/layout/AppShell";
import { DetailPageHeader } from "@/components/ui-hub/DetailPageHeader";
import { NotionContent } from "@/components/ui-hub/NotionContent";
import { appPageTitle, sectionLabels } from "@/data/app-sections";
import { requiresEmployeeAuth } from "@/lib/employee-access";
import { fetchManualPage, fetchPageAccessMetadata } from "@/lib/notion-functions";
import { redirectToEmployeeLoginIfNeeded } from "@/lib/employee-route";
import { filterManualNotionBlocks } from "@/lib/notion-manual-content";
import { makePageId } from "@/lib/page-library";
import { formatUpdateDate } from "@/lib/update-history";

const MANUAL_ACCENT = "#B58BFF";

function MetaRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-[15px] font-medium">{value}</span>
    </div>
  );
}

export const Route = createFileRoute("/manuals/$id")({
  staleTime: 0,
  beforeLoad: async ({ params, context }) => {
    const access = await fetchPageAccessMetadata({ data: params.id });
    if (!access) {
      throw notFound();
    }

    redirectToEmployeeLoginIfNeeded(
      context.auth,
      requiresEmployeeAuth(access.title, access.category),
      `/manuals/${params.id}`,
    );
  },
  loader: async ({ params }) => {
    const manual = await fetchManualPage({ data: params.id });
    return { manual };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? appPageTitle(`${loaderData.manual.title} — 業務マニュアル`) : appPageTitle("業務マニュアル") }],
  }),
  component: ManualDetail,
  notFoundComponent: () => (
    <AppShell>
      <BackLink to="/manuals" label="業務マニュアル" />
      <p className="text-muted-foreground">マニュアルが見つかりません。</p>
    </AppShell>
  ),
  errorComponent: () => (
    <AppShell>
      <BackLink to="/manuals" label="業務マニュアル" />
      <p className="text-muted-foreground">マニュアルの読み込みに失敗しました。</p>
    </AppShell>
  ),
});

function ManualDetail() {
  const { manual } = Route.useLoaderData();
  const savedPage = {
    id: makePageId("/manuals/$id", { id: manual.id }),
    title: manual.title,
    subtitle: sectionLabels.manuals,
    to: "/manuals/$id",
    params: { id: manual.id },
  };
  const updatedLabel = manual.updatedAt ? formatUpdateDate(manual.updatedAt) : undefined;

  return (
    <AppShell>
      <BackLink to="/manuals" label="業務マニュアル" />

      <DetailPageHeader page={savedPage} title={manual.title} />

      <section className="card-surface p-5">
        <MetaRow label="カテゴリ" value={manual.category} />
        <MetaRow label="更新日" value={updatedLabel} />
      </section>

      {manual.searchTags.length > 0 ? (
        <section className="card-surface mt-4 p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">検索タグ</h2>
          <div className="flex flex-wrap gap-2">
            {manual.searchTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-[var(--color-surface-2)] px-3 py-1 text-[13px] text-foreground/90"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      <NotionContent blocks={filterManualNotionBlocks(manual.blocks)} accent={MANUAL_ACCENT} />
    </AppShell>
  );
}

import { createFileRoute, notFound } from "@tanstack/react-router";
import { AppShell, BackLink } from "@/components/layout/AppShell";
import { DetailPageHeader } from "@/components/ui-hub/DetailPageHeader";
import { NotionContent } from "@/components/ui-hub/NotionContent";
import { EMPLOYEE_WORK_LABEL, EMPLOYEE_WORK_PATH } from "@/data/app-sections";
import { fetchEmployeeWorkPage } from "@/lib/notion-functions";
import { redirectToEmployeeLoginIfNeeded } from "@/lib/employee-route";
import { filterManualNotionBlocks } from "@/lib/notion-manual-content";
import { makePageId } from "@/lib/page-library";
import { formatUpdateDate } from "@/lib/update-history";

const EMPLOYEE_WORK_ACCENT = "#E8A838";

function MetaRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-[15px] font-medium">{value}</span>
    </div>
  );
}

export const Route = createFileRoute("/employee-work/$id")({
  staleTime: 0,
  beforeLoad: ({ params, context }) => {
    redirectToEmployeeLoginIfNeeded(context.auth, true, `/employee-work/${params.id}`);
  },
  loader: async ({ params }) => {
    try {
      const page = await fetchEmployeeWorkPage({ data: params.id });
      return { page };
    } catch {
      throw notFound();
    }
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? appPageTitle(`${loaderData.page.title} — ${EMPLOYEE_WORK_LABEL}`) : appPageTitle(EMPLOYEE_WORK_LABEL) }],
  }),
  component: EmployeeWorkDetail,
  notFoundComponent: () => (
    <AppShell>
      <BackLink to={EMPLOYEE_WORK_PATH} label={EMPLOYEE_WORK_LABEL} />
      <p className="text-muted-foreground">社員業務マニュアルが見つかりません。</p>
    </AppShell>
  ),
  errorComponent: () => (
    <AppShell>
      <BackLink to={EMPLOYEE_WORK_PATH} label={EMPLOYEE_WORK_LABEL} />
      <p className="text-muted-foreground">社員業務マニュアルの読み込みに失敗しました。</p>
    </AppShell>
  ),
});

function EmployeeWorkDetail() {
  const { page } = Route.useLoaderData();
  const savedPage = {
    id: makePageId("/employee-work/$id", { id: page.id }),
    title: page.title,
    subtitle: EMPLOYEE_WORK_LABEL,
    to: "/employee-work/$id",
    params: { id: page.id },
  };
  const updatedLabel = page.updatedAt ? formatUpdateDate(page.updatedAt) : undefined;

  return (
    <AppShell>
      <BackLink to={EMPLOYEE_WORK_PATH} label={EMPLOYEE_WORK_LABEL} />

      <DetailPageHeader page={savedPage} title={page.title} />

      <section className="card-surface p-5">
        <MetaRow label="カテゴリ" value={page.category} />
        <MetaRow label="更新日" value={updatedLabel} />
      </section>

      {page.searchTags.length > 0 ? (
        <section className="card-surface mt-4 p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">検索タグ</h2>
          <div className="flex flex-wrap gap-2">
            {page.searchTags.map((tag) => (
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

      <NotionContent blocks={filterManualNotionBlocks(page.blocks)} accent={EMPLOYEE_WORK_ACCENT} />
    </AppShell>
  );
}

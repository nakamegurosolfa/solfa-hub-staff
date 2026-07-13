import { createFileRoute, notFound } from "@tanstack/react-router";
import { AppShell, BackLink } from "@/components/layout/AppShell";
import { DetailPageHeader } from "@/components/ui-hub/DetailPageHeader";
import { NotionContent } from "@/components/ui-hub/NotionContent";
import { appPageTitle, sectionLabels } from "@/data/app-sections";
import { fetchAboutIndex, fetchManualPage } from "@/lib/notion-functions";
import { redirectToEmployeeLoginIfNeeded } from "@/lib/employee-route";
import { sameNotionId } from "@/lib/notion";
import { makePageId } from "@/lib/page-library";

const ABOUT_ACCENT = "#FFB86B";

export const Route = createFileRoute("/about/$id")({
  loader: async ({ params, context }) => {
    const { pages } = await fetchAboutIndex();
    const summary = pages.find((page) => sameNotionId(page.id, params.id));
    if (!summary) {
      throw notFound();
    }

    redirectToEmployeeLoginIfNeeded(context.auth, summary.employeeOnly, `/about/${params.id}`);

    const page = await fetchManualPage({ data: params.id });
    return { page };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? appPageTitle(`${loaderData.page.title} — solfaとは`) : appPageTitle("solfaとは") }],
  }),
  component: AboutDetail,
  notFoundComponent: () => (
    <AppShell>
      <BackLink to="/about" label="solfaとは" />
      <p className="text-muted-foreground">ページが見つかりません。</p>
    </AppShell>
  ),
  errorComponent: () => (
    <AppShell>
      <BackLink to="/about" label="solfaとは" />
      <p className="text-muted-foreground">ページの読み込みに失敗しました。</p>
    </AppShell>
  ),
});

function AboutDetail() {
  const { page } = Route.useLoaderData();
  const savedPage = {
    id: makePageId("/about/$id", { id: page.id }),
    title: page.title,
    subtitle: sectionLabels.about,
    to: "/about/$id",
    params: { id: page.id },
  };

  return (
    <AppShell>
      <BackLink to="/about" label="solfaとは" />
      <DetailPageHeader page={savedPage} title={page.title} />
      <NotionContent blocks={page.blocks} accent={ABOUT_ACCENT} />
    </AppShell>
  );
}

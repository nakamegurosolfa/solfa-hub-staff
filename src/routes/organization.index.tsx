import { createFileRoute } from "@tanstack/react-router";
import { AppShell, BackLink } from "@/components/layout/AppShell";
import { DetailPageHeader } from "@/components/ui-hub/DetailPageHeader";
import { NotionContent } from "@/components/ui-hub/NotionContent";
import { sectionLabels } from "@/data/app-sections";
import { fetchOrganizationAccessMetadata, fetchOrganizationPage } from "@/lib/notion-functions";
import { redirectToEmployeeLoginIfNeeded } from "@/lib/employee-route";
import { makePageId } from "@/lib/page-library";

const ORG_ACCENT = "#6B9FFF";

export const Route = createFileRoute("/organization/")({
  loader: async ({ context }) => {
    const access = await fetchOrganizationAccessMetadata();
    redirectToEmployeeLoginIfNeeded(context.auth, access.employeeOnly, "/organization");
    return fetchOrganizationPage();
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.title} — 会社組織図` : "会社組織図 — solfa MANUAL APP" }],
  }),
  component: OrganizationPage,
  errorComponent: () => (
    <AppShell>
      <BackLink to="/" label="ホーム" />
      <p className="text-muted-foreground">会社組織図の読み込みに失敗しました。</p>
    </AppShell>
  ),
});

function OrganizationPage() {
  const page = Route.useLoaderData();
  const savedPage = {
    id: makePageId("/organization"),
    title: page.title,
    subtitle: sectionLabels.organization,
    to: "/organization",
  };

  return (
    <AppShell>
      <BackLink to="/" label="ホーム" />
      <DetailPageHeader page={savedPage} title={page.title} />
      <NotionContent blocks={page.blocks} accent={ORG_ACCENT} />
    </AppShell>
  );
}

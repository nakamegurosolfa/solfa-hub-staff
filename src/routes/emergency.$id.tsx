import { createFileRoute, notFound } from "@tanstack/react-router";
import { AppShell, BackLink } from "@/components/layout/AppShell";
import { ArticleView } from "@/components/ui-hub/ArticleView";
import { emergencyCategories } from "@/data/content";

export const Route = createFileRoute("/emergency/$id")({
  loader: ({ params }) => {
    const article = emergencyCategories.find((a) => a.id === params.id);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.article.title} — Emergency` : "Emergency — solfa HUB" }],
  }),
  component: () => {
    const { article } = Route.useLoaderData();
    return (
      <AppShell>
        <BackLink to="/emergency" label="Emergency" />
        <ArticleView article={article} accent="var(--color-emergency)" />
      </AppShell>
    );
  },
  notFoundComponent: () => (
    <AppShell>
      <BackLink to="/emergency" label="Emergency" />
      <p className="text-muted-foreground">Protocol not found.</p>
    </AppShell>
  ),
  errorComponent: () => (
    <AppShell>
      <BackLink to="/emergency" label="Emergency" />
      <p className="text-muted-foreground">Couldn't load this page.</p>
    </AppShell>
  ),
});

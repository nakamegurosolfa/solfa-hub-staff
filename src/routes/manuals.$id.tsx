import { createFileRoute, notFound } from "@tanstack/react-router";
import { AppShell, BackLink } from "@/components/layout/AppShell";
import { ArticleView } from "@/components/ui-hub/ArticleView";
import { manualCategories } from "@/data/content";

export const Route = createFileRoute("/manuals/$id")({
  loader: ({ params }) => {
    const article = manualCategories.find((a) => a.id === params.id);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.article.title} — Manuals` : "Manual — solfa HUB" }],
  }),
  component: () => {
    const { article } = Route.useLoaderData();
    return (
      <AppShell>
        <BackLink to="/manuals" label="Manuals" />
        <ArticleView article={article} accent="#B58BFF" />
      </AppShell>
    );
  },
  notFoundComponent: () => (
    <AppShell>
      <BackLink to="/manuals" label="Manuals" />
      <p className="text-muted-foreground">Manual not found.</p>
    </AppShell>
  ),
  errorComponent: () => (
    <AppShell>
      <BackLink to="/manuals" label="Manuals" />
      <p className="text-muted-foreground">Couldn't load this manual.</p>
    </AppShell>
  ),
});

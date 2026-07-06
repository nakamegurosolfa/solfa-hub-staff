import { createFileRoute, notFound } from "@tanstack/react-router";
import { AppShell, BackLink } from "@/components/layout/AppShell";
import { ArticleView } from "@/components/ui-hub/ArticleView";
import { equipmentCategories } from "@/data/content";

export const Route = createFileRoute("/equipment/$id")({
  loader: ({ params }) => {
    const article = equipmentCategories.find((a) => a.id === params.id);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.article.title} — Equipment` : "Equipment — solfa HUB" }],
  }),
  component: () => {
    const { article } = Route.useLoaderData();
    return (
      <AppShell>
        <BackLink to="/equipment" label="Equipment" />
        <ArticleView article={article} accent="#4DD6A6" />
      </AppShell>
    );
  },
  notFoundComponent: () => (
    <AppShell>
      <BackLink to="/equipment" label="Equipment" />
      <p className="text-muted-foreground">Equipment not found.</p>
    </AppShell>
  ),
  errorComponent: () => (
    <AppShell>
      <BackLink to="/equipment" label="Equipment" />
      <p className="text-muted-foreground">Couldn't load this page.</p>
    </AppShell>
  ),
});

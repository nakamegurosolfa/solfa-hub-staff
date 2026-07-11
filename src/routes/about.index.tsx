import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { CategoryCard } from "@/components/ui-hub/CategoryCard";
import { aboutCategories } from "@/data/app-sections";
import { fetchAboutIndex } from "@/lib/notion-functions";

export const Route = createFileRoute("/about/")({
  loader: () => fetchAboutIndex(),
  head: () => ({ meta: [{ title: "solfaとは — solfa MANUAL APP" }] }),
  component: AboutIndex,
});

function AboutIndex() {
  const { pages } = Route.useLoaderData();

  return (
    <AppShell>
      <PageHeader title="solfaとは" subtitle="店舗紹介・コンセプト・大切にしている考え方" />
      <div className="mt-6 flex flex-col gap-3">
        {pages.map((page) => (
          <CategoryCard
            key={page.id}
            to="/about/$id"
            params={{ id: page.id }}
            emoji={page.emoji}
            title={page.title}
            description={page.description}
            color="#FFB86B"
            employeeOnly={page.employeeOnly}
          />
        ))}
        {aboutCategories.map((category) => (
          <CategoryCard
            key={category.id}
            to="/about/category/$id"
            params={{ id: category.id }}
            emoji={category.emoji}
            title={category.title}
            description={category.description}
            color={category.color}
          />
        ))}
      </div>
    </AppShell>
  );
}

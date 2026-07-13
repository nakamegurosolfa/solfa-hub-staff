import { createFileRoute, notFound } from "@tanstack/react-router";
import { CategoryPlaceholder } from "@/components/ui-hub/CategoryPlaceholder";
import { sectionLabels, shopRulesCategories } from "@/data/app-sections";
import { makePageId } from "@/lib/page-library";

function findCategory(id: string) {
  return shopRulesCategories.find((category) => category.id === id);
}

export const Route = createFileRoute("/rules/category/$id")({
  loader: ({ params }) => {
    const category = findCategory(params.id);
    if (!category) throw notFound();
    return { category };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? appPageTitle(`${loaderData.category.title} — 店のルール`) : appPageTitle("店のルール") }],
  }),
  component: RulesCategoryDetail,
});

function RulesCategoryDetail() {
  const { category } = Route.useLoaderData();
  return (
    <CategoryPlaceholder
      backTo="/rules"
      backLabel="店のルール"
      title={category.title}
      subtitle={category.description}
      page={{
        id: makePageId("/rules/category/$id", { id: category.id }),
        title: category.title,
        subtitle: sectionLabels.rules,
        to: "/rules/category/$id",
        params: { id: category.id },
      }}
    />
  );
}

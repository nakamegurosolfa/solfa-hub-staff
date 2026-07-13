import { createFileRoute, notFound } from "@tanstack/react-router";
import { CategoryPlaceholder } from "@/components/ui-hub/CategoryPlaceholder";
import { aboutCategories, sectionLabels } from "@/data/app-sections";
import { makePageId } from "@/lib/page-library";

function findCategory(id: string) {
  return aboutCategories.find((category) => category.id === id);
}

export const Route = createFileRoute("/about/category/$id")({
  loader: ({ params }) => {
    const category = findCategory(params.id);
    if (!category) throw notFound();
    return { category };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? appPageTitle(`${loaderData.category.title} — solfaとは`) : appPageTitle("solfaとは") }],
  }),
  component: AboutCategoryDetail,
});

function AboutCategoryDetail() {
  const { category } = Route.useLoaderData();
  return (
    <CategoryPlaceholder
      backTo="/about"
      backLabel="solfaとは"
      title={category.title}
      subtitle={category.description}
      page={{
        id: makePageId("/about/category/$id", { id: category.id }),
        title: category.title,
        subtitle: sectionLabels.about,
        to: "/about/category/$id",
        params: { id: category.id },
      }}
    />
  );
}

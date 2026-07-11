import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { CategoryCard } from "@/components/ui-hub/CategoryCard";
import { shopRulesCategories } from "@/data/app-sections";

export const Route = createFileRoute("/rules/")({
  component: RulesIndex,
  head: () => ({ meta: [{ title: "店のルール — solfa MANUAL APP" }] }),
});

function RulesIndex() {
  return (
    <AppShell>
      <PageHeader title="店のルール" subtitle="接客・身だしなみ・禁止事項・その他店舗ルール" />
      <div className="mt-6 flex flex-col gap-3">
        {shopRulesCategories.map((category) => (
          <CategoryCard
            key={category.id}
            to="/rules/category/$id"
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

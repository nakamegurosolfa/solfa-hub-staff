import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { AppShell, BackLink } from "@/components/layout/AppShell";
import { CocktailRecipeSections } from "@/components/ui-hub/CocktailRecipeSections";
import { CocktailValueBadge } from "@/components/ui-hub/CocktailMetaBadges";
import { DetailPageHeader } from "@/components/ui-hub/DetailPageHeader";
import { sectionLabels } from "@/data/app-sections";
import { formatDifficulty } from "@/lib/cocktail-difficulty";
import { fetchCocktailIndex, fetchCocktailPage } from "@/lib/notion-functions";
import { redirectToEmployeeLoginIfNeeded } from "@/lib/employee-route";
import { sameNotionId } from "@/lib/notion";
import { makePageId } from "@/lib/page-library";

const COCKTAIL_ACCENT = "var(--color-primary)";

function MetaBadgeRow({
  label,
  value,
  kind,
}: {
  label: string;
  value?: string;
  kind: "learningPriority" | "orderFrequency";
}) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <CocktailValueBadge value={value} kind={kind} size="detail" />
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-[15px] font-medium">{value}</span>
    </div>
  );
}

export const Route = createFileRoute("/cocktails/$id")({
  loader: async ({ params, context }) => {
    const cocktails = await fetchCocktailIndex();
    const summary = cocktails.find((cocktail) => sameNotionId(cocktail.id, params.id));
    if (!summary) {
      throw notFound();
    }

    redirectToEmployeeLoginIfNeeded(context.auth, summary.employeeOnly, `/cocktails/${params.id}`);

    const cocktail = await fetchCocktailPage({ data: params.id });
    return { cocktail };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.cocktail.name} — カクテルレシピ` : "カクテルレシピ" }],
  }),
  component: CocktailDetail,
  notFoundComponent: () => (
    <AppShell>
      <BackLink to="/cocktails" label="カクテルレシピ" />
      <p className="text-muted-foreground">カクテルが見つかりません。</p>
    </AppShell>
  ),
  errorComponent: () => (
    <AppShell>
      <BackLink to="/cocktails" label="カクテルレシピ" />
      <p className="text-muted-foreground">カクテルの読み込みに失敗しました。</p>
    </AppShell>
  ),
});

function CocktailDetail() {
  const { cocktail } = Route.useLoaderData();
  const savedPage = {
    id: makePageId("/cocktails/$id", { id: cocktail.id }),
    title: cocktail.name,
    subtitle: sectionLabels.cocktails,
    to: "/cocktails/$id",
    params: { id: cocktail.id },
  };

  return (
    <AppShell>
      <BackLink to="/cocktails" label="カクテルレシピ" />

      <DetailPageHeader
        page={savedPage}
        title={cocktail.name}
        meta={
          cocktail.recommended ? (
            <span className="inline-flex rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">
              おすすめ
            </span>
          ) : undefined
        }
      />

      <section className="card-surface p-5">
        <MetaBadgeRow label="習得優先度" value={cocktail.learningPriority} kind="learningPriority" />
        <MetaBadgeRow label="注文頻度" value={cocktail.orderFrequency} kind="orderFrequency" />
        <MetaRow label="価格" value={cocktail.price} />
        <MetaRow label="カテゴリ" value={cocktail.category} />
        <MetaRow label="グラス" value={cocktail.glass} />
        <MetaRow label="氷" value={cocktail.ice} />
        <MetaRow label="難易度" value={formatDifficulty(cocktail.difficulty)} />
      </section>

      {cocktail.ingredientTags.length > 0 ? (
        <section className="card-surface mt-4 p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">材料タグ</h2>
          <div className="flex flex-wrap gap-2">
            {cocktail.ingredientTags.map((tag) => (
              <Link
                key={tag}
                to="/cocktails"
                search={{ q: tag }}
                className="tap rounded-full border border-border bg-[var(--color-surface-2)] px-3 py-1 text-[13px] text-foreground/90 transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
              >
                {tag}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <CocktailRecipeSections blocks={cocktail.blocks} accent={COCKTAIL_ACCENT} />

      {cocktail.imageUrl ? (
        <section className="card-surface mt-4 p-5">
          <h2 className="mb-4 text-sm font-semibold tracking-tight text-foreground">📷 完成イメージ</h2>
          <figure className="overflow-hidden rounded-2xl border border-border">
            <img src={cocktail.imageUrl} alt={`${cocktail.name}の完成イメージ`} className="aspect-[4/3] w-full object-cover" />
          </figure>
        </section>
      ) : null}
    </AppShell>
  );
}

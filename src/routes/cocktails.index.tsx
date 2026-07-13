import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { CocktailCard } from "@/components/ui-hub/CocktailCard";
import { SectionLabel } from "@/components/ui-hub/ListCard";
import { SearchBox } from "@/components/ui-hub/SearchBox";
import { APP_NAME, appPageTitle } from "@/data/app-sections";
import { filterCocktails } from "@/lib/cocktail-search";
import { fetchCocktailIndex } from "@/lib/notion-functions";

const cocktailSearchSchema = z.object({
  q: z.string().optional(),
});

export const Route = createFileRoute("/cocktails/")({
  validateSearch: cocktailSearchSchema,
  loader: () => fetchCocktailIndex(),
  head: () => ({ meta: [{ title: appPageTitle("カクテルレシピ") }] }),
  component: CocktailsIndex,
  errorComponent: () => (
    <AppShell>
      <PageHeader title="カクテルレシピ" subtitle="ドリンクレシピ・材料・作り方" />
      <p className="rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-6 text-center text-sm leading-relaxed text-muted-foreground">
        カクテルレシピの読み込みに失敗しました。
        <br />
        Notion の「カクテルレシピ」データベースを Integration「{APP_NAME}」に接続し、
        <code className="text-foreground/80">NOTION_COCKTAIL_DATABASE_ID</code> が正しいか確認してください。
      </p>
    </AppShell>
  ),
});

function CocktailsIndex() {
  const cocktails = Route.useLoaderData();
  const search = Route.useSearch();
  const [query, setQuery] = useState(search.q ?? "");

  useEffect(() => {
    setQuery(search.q ?? "");
  }, [search.q]);

  const filtered = useMemo(() => filterCocktails(cocktails, query), [cocktails, query]);
  const limited = useMemo(() => filtered.filter((cocktail) => cocktail.limitedTime), [filtered]);
  const regular = useMemo(() => filtered.filter((cocktail) => !cocktail.limitedTime), [filtered]);

  return (
    <AppShell>
      <PageHeader title="カクテルレシピ" subtitle="ドリンクレシピ・材料・作り方" />

      <SearchBox
        value={query}
        onChange={setQuery}
        placeholder="カクテル名・材料・グラス・氷などで検索"
      />

      <div className="mt-6 flex flex-col gap-6">
        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-6 text-center text-sm text-muted-foreground">
            {query.trim() ? `「${query}」に一致するカクテルはありません。` : "カクテルレシピが見つかりません。"}
          </p>
        ) : (
          <>
            {limited.length > 0 && (
              <section>
                <SectionLabel>🎉 期間限定</SectionLabel>
                <div className="flex flex-col gap-3">
                  {limited.map((cocktail) => (
                    <CocktailCard key={cocktail.id} cocktail={cocktail} />
                  ))}
                </div>
              </section>
            )}
            {regular.length > 0 && (
              <div className="flex flex-col gap-3">
                {regular.map((cocktail) => (
                  <CocktailCard key={cocktail.id} cocktail={cocktail} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}

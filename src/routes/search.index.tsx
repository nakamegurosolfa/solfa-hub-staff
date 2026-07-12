import { createFileRoute, useNavigate, useRouteContext } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { SearchBar } from "@/components/ui-hub/SearchBar";
import { SearchResultsList } from "@/components/ui-hub/SearchResultsList";
import { SEARCH_PLACEHOLDER } from "@/data/app-sections";
import { fetchSearchIndex } from "@/lib/notion-functions";
import { filterSearchIndex } from "@/lib/search-index";

const searchPageSchema = z.object({
  q: z.string().optional(),
});

export const Route = createFileRoute("/search/")({
  validateSearch: searchPageSchema,
  loader: () => fetchSearchIndex(),
  head: () => ({ meta: [{ title: "検索 — solfa MANUAL APP" }] }),
  component: SearchPage,
});

function SearchPage() {
  const searchIndex = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { auth } = useRouteContext({ from: "__root__" });
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState(search.q ?? "");

  useEffect(() => {
    setQ(search.q ?? "");
  }, [search.q]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const runSearch = (term: string) => {
    const next = term.trim();
    if (!next) return;
    setQ(next);
    navigate({ to: "/search", search: { q: next }, replace: true });
  };

  const trimmedQuery = q.trim();
  const results = useMemo(() => {
    if (!trimmedQuery) return null;
    return filterSearchIndex(searchIndex, trimmedQuery);
  }, [q, searchIndex, trimmedQuery]);

  return (
    <AppShell>
      <PageHeader title="検索" subtitle="カクテル・マニュアル・ルールなど横断検索" />

      <SearchBar
        value={q}
        onChange={setQ}
        placeholder={SEARCH_PLACEHOLDER}
        autoFocus
        inputRef={inputRef}
        onSubmit={runSearch}
      />

      {results ? (
        <div className="mt-6">
          <SearchResultsList
            results={results}
            employeeAuthenticated={auth.employeeAuthenticated}
            emptyMessage={`「${trimmedQuery}」に一致する項目はありません。`}
          />
        </div>
      ) : (
        <p className="mt-6 rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-6 text-center text-sm text-muted-foreground">
          キーワードを入力して検索してください。
        </p>
      )}
    </AppShell>
  );
}

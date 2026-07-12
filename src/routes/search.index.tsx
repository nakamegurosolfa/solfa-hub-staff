import { createFileRoute, useNavigate, useRouteContext } from "@tanstack/react-router";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
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
  const [query, setQuery] = useState(search.q ?? "");
  const deferredQuery = useDeferredValue(query.trim());
  const isFiltering = query.trim() !== deferredQuery;

  useEffect(() => {
    setQuery(search.q ?? "");
  }, [search.q]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const syncSearchUrl = (term: string) => {
    const next = term.trim();
    navigate({
      to: "/search",
      search: next ? { q: next } : {},
      replace: true,
    });
  };

  const handleSubmit = (term: string) => {
    setQuery(term);
    syncSearchUrl(term);
  };

  const results = useMemo(() => {
    if (!deferredQuery) return null;
    return filterSearchIndex(searchIndex, deferredQuery);
  }, [deferredQuery, searchIndex]);

  return (
    <AppShell>
      <PageHeader title="検索" subtitle="カクテル・マニュアル・Q&A・社員業務を横断検索" />

      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder={SEARCH_PLACEHOLDER}
        autoFocus
        inputRef={inputRef}
        onSubmit={handleSubmit}
      />

      {results ? (
        <div className={`mt-6 ${isFiltering ? "opacity-80" : ""}`}>
          <SearchResultsList results={results} employeeAuthenticated={auth.employeeAuthenticated} />
        </div>
      ) : (
        <p className="mt-6 rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-6 text-center text-sm text-muted-foreground">
          キーワードを入力して検索してください。
        </p>
      )}
    </AppShell>
  );
}

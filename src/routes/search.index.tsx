import { createFileRoute, useNavigate, useRouteContext } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { EmployeeOnlyBadge } from "@/components/auth/PasswordGateScreen";
import { SearchBar } from "@/components/ui-hub/SearchBar";
import { ListCard, SectionLabel } from "@/components/ui-hub/ListCard";
import { SEARCH_PLACEHOLDER } from "@/data/app-sections";
import { filterSearchIndex, type SearchHit } from "@/lib/search-index";
import { fetchSearchIndex } from "@/lib/notion-functions";

const searchPageSchema = z.object({
  q: z.string().optional(),
});

function resultRedirectPath(result: SearchHit) {
  if (result.to === "/organization") return "/organization";
  if (result.params?.id) {
    return result.to.replace("$id", result.params.id);
  }
  return result.to;
}

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

  const results = useMemo(() => {
    const term = q.trim();
    if (!term) return null;
    return filterSearchIndex(searchIndex, term);
  }, [q, searchIndex]);

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
        <>
          <SectionLabel>{results.length}件の結果</SectionLabel>
          <div className="flex flex-col gap-2">
            {results.length === 0 ? (
              <p className="rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-6 text-center text-sm text-muted-foreground">
                「{q}」に一致する項目はありません。
              </p>
            ) : (
              results.map((result) => {
                const needsEmployeeAuth = result.employeeOnly && !auth.employeeAuthenticated;
                return (
                  <ListCard
                    key={result.id}
                    to={needsEmployeeAuth ? "/employee-login" : result.to}
                    params={needsEmployeeAuth ? undefined : result.params}
                    search={needsEmployeeAuth ? { redirect: resultRedirectPath(result) } : undefined}
                    title={result.title}
                    subtitle={result.subtitle}
                    trailing={result.employeeOnly ? <EmployeeOnlyBadge /> : undefined}
                  />
                );
              })
            )}
          </div>
        </>
      ) : (
        <p className="mt-6 rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-6 text-center text-sm text-muted-foreground">
          キーワードを入力して検索してください。
        </p>
      )}
    </AppShell>
  );
}

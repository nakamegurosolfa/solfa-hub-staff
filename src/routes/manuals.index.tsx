import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { ManualCard } from "@/components/ui-hub/ManualCard";
import { ManualSearchResultCard } from "@/components/ui-hub/ManualSearchResultCard";
import { SectionLabel } from "@/components/ui-hub/ListCard";
import { SearchBox } from "@/components/ui-hub/SearchBox";
import { fetchManualIndex } from "@/lib/notion-functions";
import { groupManualsByCategory } from "@/lib/manual-groups";
import type { ManualSummary } from "@/lib/notion-types";
import { buildManualSearchHits, manualAnchorId } from "@/lib/manual-search";

const HIGHLIGHT_DURATION_MS = 2000;

export const Route = createFileRoute("/manuals/")({
  loader: () => fetchManualIndex(),
  head: () => ({ meta: [{ title: "業務マニュアル — solfa MANUAL APP" }] }),
  component: ManualsIndex,
  errorComponent: () => (
    <AppShell>
      <PageHeader title="業務マニュアル" subtitle="営業・受付・バー・清掃" />
      <p className="rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-6 text-center text-sm leading-relaxed text-muted-foreground">
        業務マニュアルの読み込みに失敗しました。
        <br />
        Notion の「業務マニュアル」データベースを Integration に接続し、
        <code className="text-foreground/80">NOTION_MANUAL_DATABASE_ID</code> が正しいか確認してください。
      </p>
    </AppShell>
  ),
});

function ManualsIndex() {
  const loaderManuals = Route.useLoaderData();
  const manuals = useMemo(
    () => (Array.isArray(loaderManuals) ? loaderManuals : []) as ManualSummary[],
    [loaderManuals],
  );
  const [query, setQuery] = useState("");
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const highlightTimerRef = useRef<number | null>(null);

  const trimmedQuery = query.trim();
  const isSearching = trimmedQuery.length > 0;

  const searchHits = useMemo(
    () => (isSearching ? buildManualSearchHits(manuals, trimmedQuery) : []),
    [isSearching, manuals, trimmedQuery],
  );
  const filtered = useMemo(() => searchHits.map((hit) => hit.item), [searchHits]);
  const groups = useMemo(
    () => groupManualsByCategory(isSearching ? filtered : manuals),
    [filtered, isSearching, manuals],
  );

  useEffect(() => {
    return () => {
      if (highlightTimerRef.current !== null && typeof window !== "undefined") {
        window.clearTimeout(highlightTimerRef.current);
      }
    };
  }, []);

  const handleQueryChange = useCallback((value: string) => {
    setQuery(typeof value === "string" ? value : "");
  }, []);

  const scrollToManual = useCallback((manualId: string) => {
    if (typeof window === "undefined" || !manualId) return;

    const target = document.getElementById(manualAnchorId(manualId));
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "center" });

    if (highlightTimerRef.current !== null) {
      window.clearTimeout(highlightTimerRef.current);
    }

    setHighlightedId(manualId);
    highlightTimerRef.current = window.setTimeout(() => {
      setHighlightedId(null);
      highlightTimerRef.current = null;
    }, HIGHLIGHT_DURATION_MS);
  }, []);

  return (
    <AppShell>
      <PageHeader title="業務マニュアル" subtitle="営業・受付・バー・清掃" />

      <SearchBox value={query} onChange={handleQueryChange} placeholder="検索タグで絞り込み" />

      <div className="mt-6 flex flex-col gap-6">
        {isSearching ? (
          searchHits.length === 0 ? (
            <p className="rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-6 text-center text-sm text-muted-foreground">
              該当する業務マニュアルがありません
            </p>
          ) : (
            <>
              <section>
                <SectionLabel>検索結果</SectionLabel>
                <div className="flex flex-col gap-3">
                  {searchHits.map((hit) => (
                    <ManualSearchResultCard
                      key={hit.item.id}
                      manual={hit.item}
                      excerpt={hit.matchingTag}
                      onSelect={scrollToManual}
                    />
                  ))}
                </div>
              </section>

              <section>
                <SectionLabel>マニュアル一覧</SectionLabel>
                <div className="flex flex-col gap-6">
                  {groupManualsByCategory(filtered).map((group) => (
                    <div key={group.category}>
                      <h3 className="mb-2 px-1 text-xs font-semibold tracking-wider text-muted-foreground/80">
                        {group.category}
                      </h3>
                      <div className="flex flex-col gap-3">
                        {group.items.map((manual) => (
                          <div
                            key={manual.id}
                            id={manualAnchorId(manual.id)}
                            className={`scroll-mt-24 rounded-3xl transition-[box-shadow,background-color] duration-500 ${
                              highlightedId === manual.id
                                ? "bg-primary/10 ring-2 ring-primary/50"
                                : "ring-2 ring-transparent"
                            }`}
                          >
                            <ManualCard manual={manual} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )
        ) : groups.length === 0 ? (
          <p className="rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-6 text-center text-sm text-muted-foreground">
            マニュアルが見つかりません。
          </p>
        ) : (
          groups.map((group) => (
            <section key={group.category}>
              <SectionLabel>{group.category}</SectionLabel>
              <div className="flex flex-col gap-3">
                {group.items.map((manual) => (
                  <ManualCard key={manual.id} manual={manual} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </AppShell>
  );
}

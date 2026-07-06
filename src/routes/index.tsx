import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { GlassWater, BookOpen, Wrench, AlertTriangle, Clock, ChevronRight } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { SearchBar } from "@/components/ui-hub/SearchBar";
import { ListCard, SectionLabel } from "@/components/ui-hub/ListCard";
import { cocktails } from "@/data/cocktails";
import { manualCategories, equipmentCategories, emergencyCategories } from "@/data/content";

export const Route = createFileRoute("/")({
  component: Home,
});

const sections = [
  {
    to: "/cocktails",
    emoji: "🍸",
    title: "カクテル",
    description: "レシピと材料",
    icon: GlassWater,
    color: "var(--color-primary)",
  },
  {
    to: "/manuals",
    emoji: "📖",
    title: "マニュアル",
    description: "業務手順とルール",
    icon: BookOpen,
    color: "#B58BFF",
  },
  {
    to: "/equipment",
    emoji: "🔧",
    title: "機材",
    description: "操作とトラブル対応",
    icon: Wrench,
    color: "#4DD6A6",
  },
  {
    to: "/emergency",
    emoji: "🚨",
    title: "緊急対応",
    description: "非常時のプロトコル",
    icon: AlertTriangle,
    color: "var(--color-emergency)",
  },
] as const;

function Home() {
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return null;
    const hits: { to: string; params?: Record<string, string>; title: string; subtitle: string }[] = [];
    cocktails.forEach((c) => {
      if (c.name.toLowerCase().includes(term) || c.ingredients.join(" ").toLowerCase().includes(term))
        hits.push({ to: "/cocktails/$id", params: { id: c.id }, title: c.name, subtitle: "カクテル" });
    });
    (
      [
        ["/manuals/$id", manualCategories, "マニュアル"],
        ["/equipment/$id", equipmentCategories, "機材"],
        ["/emergency/$id", emergencyCategories, "緊急対応"],
      ] as const
    ).forEach(([to, list, tag]) => {
      list.forEach((a) => {
        if (a.title.toLowerCase().includes(term) || a.summary?.toLowerCase().includes(term))
          hits.push({ to, params: { id: a.id }, title: a.title, subtitle: tag });
      });
    });
    return hits;
  }, [q]);

  const recent = [
    { to: "/cocktails/$id", params: { id: "highball" }, title: "Japanese Highball", subtitle: "カクテル" },
    { to: "/manuals/$id", params: { id: "before-opening" }, title: "Before Opening", subtitle: "マニュアル" },
    { to: "/equipment/$id", params: { id: "dj-mixer" }, title: "DJ Mixer", subtitle: "機材" },
  ];

  return (
    <AppShell>
      <PageHeader title="solfa HUB" subtitle="お疲れさまです。今夜も安全に。" />

      <SearchBar value={q} onChange={setQ} placeholder="カクテル・マニュアル・機材を検索" />

      {results ? (
        <>
          <SectionLabel>{results.length}件の結果</SectionLabel>
          <div className="flex flex-col gap-2">
            {results.length === 0 ? (
              <p className="rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-6 text-center text-sm text-muted-foreground">
                「{q}」に一致する項目はありません。
              </p>
            ) : (
              results.map((r, i) => (
                <ListCard key={i} to={r.to} params={r.params} title={r.title} subtitle={r.subtitle} />
              ))
            )}
          </div>
        </>
      ) : (
        <>
          <div className="mt-6 flex flex-col gap-3">
            {sections.map((s) => (
              <Link
                key={s.to}
                to={s.to}
                className="tap grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-3xl border border-border bg-[var(--color-surface)] px-5 py-5 hover:bg-[var(--color-surface-2)]"
              >
                <span
                  className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl"
                  style={{ backgroundColor: s.color + "1F" }}
                  aria-hidden
                >
                  {s.emoji}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[17px] font-semibold tracking-tight">
                    {s.title}
                  </span>
                  <span className="mt-1 block truncate text-[13px] text-muted-foreground">
                    {s.description}
                  </span>
                </span>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>

          <SectionLabel>最近使った項目</SectionLabel>
          <div className="flex flex-col gap-2">
            {recent.map((r) => (
              <ListCard
                key={r.params.id}
                to={r.to}
                params={r.params}
                title={r.title}
                subtitle={r.subtitle}
                icon={Clock}
                iconColor="var(--color-muted-foreground)"
              />
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}

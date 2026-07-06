import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { GlassWater, BookOpen, Wrench, AlertTriangle, Clock } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { SearchBar } from "@/components/ui-hub/SearchBar";
import { ListCard, SectionLabel } from "@/components/ui-hub/ListCard";
import { cocktails } from "@/data/cocktails";
import { manualCategories, equipmentCategories, emergencyCategories } from "@/data/content";

export const Route = createFileRoute("/")({
  component: Home,
});

const sections = [
  { to: "/cocktails", title: "Cocktails", subtitle: "Recipes & specs", icon: GlassWater, color: "var(--color-primary)" },
  { to: "/manuals", title: "Manuals", subtitle: "Service playbooks", icon: BookOpen, color: "#B58BFF" },
  { to: "/equipment", title: "Equipment", subtitle: "Gear & troubleshooting", icon: Wrench, color: "#4DD6A6" },
  { to: "/emergency", title: "Emergency", subtitle: "Critical protocols", icon: AlertTriangle, color: "var(--color-emergency)" },
] as const;

function Home() {
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return null;
    const hits: { to: string; params?: Record<string, string>; title: string; subtitle: string }[] = [];
    cocktails.forEach((c) => {
      if (c.name.toLowerCase().includes(term) || c.ingredients.join(" ").toLowerCase().includes(term))
        hits.push({ to: "/cocktails/$id", params: { id: c.id }, title: c.name, subtitle: "Cocktail" });
    });
    [
      ["/manuals/$id", manualCategories, "Manual"],
      ["/equipment/$id", equipmentCategories, "Equipment"],
      ["/emergency/$id", emergencyCategories, "Emergency"],
    ].forEach(([to, list, tag]) => {
      (list as { id: string; title: string; summary?: string }[]).forEach((a) => {
        if (a.title.toLowerCase().includes(term) || a.summary?.toLowerCase().includes(term))
          hits.push({ to: to as string, params: { id: a.id }, title: a.title, subtitle: tag as string });
      });
    });
    return hits;
  }, [q]);

  const recent = [
    { to: "/cocktails/$id", params: { id: "highball" }, title: "Japanese Highball", subtitle: "Cocktail" },
    { to: "/manuals/$id", params: { id: "before-opening" }, title: "Before Opening", subtitle: "Manual" },
    { to: "/equipment/$id", params: { id: "dj-mixer" }, title: "DJ Mixer", subtitle: "Equipment" },
  ];

  return (
    <AppShell>
      <PageHeader title="solfa HUB" subtitle="Good evening — ready for service." />

      <SearchBar value={q} onChange={setQ} placeholder="Search cocktails, manuals, gear…" />

      {results ? (
        <>
          <SectionLabel>{results.length} result{results.length === 1 ? "" : "s"}</SectionLabel>
          <div className="flex flex-col gap-2">
            {results.length === 0 ? (
              <p className="rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-6 text-center text-sm text-muted-foreground">
                Nothing matched “{q}”.
              </p>
            ) : (
              results.map((r, i) => (
                <ListCard key={i} to={r.to as never} params={r.params as never} title={r.title} subtitle={r.subtitle} />
              ))
            )}
          </div>
        </>
      ) : (
        <>
          <SectionLabel>Recent</SectionLabel>
          <div className="flex flex-col gap-2">
            {recent.map((r) => (
              <ListCard
                key={r.params.id}
                to={r.to as never}
                params={r.params as never}
                title={r.title}
                subtitle={r.subtitle}
                icon={Clock}
                iconColor="var(--color-muted-foreground)"
              />
            ))}
          </div>

          <SectionLabel>Browse</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            {sections.map((s) => (
              <Link
                key={s.to}
                to={s.to}
                className="tap flex flex-col justify-between rounded-2xl border border-border bg-[var(--color-surface)] p-4 aspect-square"
              >
                <span
                  className="grid h-11 w-11 place-items-center rounded-xl"
                  style={{ backgroundColor: s.color + "22", color: s.color }}
                >
                  <s.icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-base font-semibold">{s.title}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{s.subtitle}</span>
                </span>
              </Link>
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}

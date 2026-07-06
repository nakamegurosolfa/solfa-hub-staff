import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { GlassWater } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { SearchBar } from "@/components/ui-hub/SearchBar";
import { ListCard } from "@/components/ui-hub/ListCard";
import { cocktails } from "@/data/cocktails";

export const Route = createFileRoute("/cocktails/")({
  component: CocktailsIndex,
  head: () => ({ meta: [{ title: "Cocktails — solfa HUB" }] }),
});

function CocktailsIndex() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return cocktails;
    return cocktails.filter(
      (c) => c.name.toLowerCase().includes(t) || c.ingredients.join(" ").toLowerCase().includes(t),
    );
  }, [q]);

  return (
    <AppShell>
      <PageHeader title="Cocktails" subtitle={`${cocktails.length} recipes`} />
      <SearchBar value={q} onChange={setQ} placeholder="Search cocktails or ingredients" />
      <div className="mt-4 flex flex-col gap-2">
        {filtered.map((c) => (
          <ListCard
            key={c.id}
            to="/cocktails/$id"
            params={{ id: c.id }}
            title={c.name}
            subtitle={c.glass ? `${c.glass} · ${c.ingredients.length} ingredients` : `${c.ingredients.length} ingredients`}
            icon={GlassWater}
          />
        ))}
        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-6 text-center text-sm text-muted-foreground">
            No cocktails matched.
          </p>
        ) : null}
      </div>
    </AppShell>
  );
}

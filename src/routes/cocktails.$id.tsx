import { createFileRoute, notFound } from "@tanstack/react-router";
import { GlassWater } from "lucide-react";
import { AppShell, BackLink } from "@/components/layout/AppShell";
import { cocktails, type Cocktail } from "@/data/cocktails";

export const Route = createFileRoute("/cocktails/$id")({
  loader: ({ params }) => {
    const cocktail = cocktails.find((c) => c.id === params.id);
    if (!cocktail) throw notFound();
    return { cocktail };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.cocktail.name} — solfa HUB` : "Cocktail — solfa HUB" }],
  }),
  component: CocktailDetail,
  notFoundComponent: () => (
    <AppShell>
      <BackLink to="/cocktails" label="Cocktails" />
      <p className="text-muted-foreground">Cocktail not found.</p>
    </AppShell>
  ),
  errorComponent: () => (
    <AppShell>
      <BackLink to="/cocktails" label="Cocktails" />
      <p className="text-muted-foreground">Couldn't load this cocktail.</p>
    </AppShell>
  ),
});

function CocktailDetail() {
  const { cocktail } = Route.useLoaderData() as { cocktail: Cocktail };

  return (
    <AppShell>
      <BackLink to="/cocktails" label="Cocktails" />

      <div
        className="mb-5 grid aspect-[4/3] place-items-center overflow-hidden rounded-3xl border border-border"
        style={{ background: "linear-gradient(135deg, var(--color-surface-2), var(--color-surface))" }}
      >
        <GlassWater className="h-16 w-16 text-primary/70" strokeWidth={1.4} />
      </div>

      <h1 className="text-3xl font-bold tracking-tight">{cocktail.name}</h1>
      {cocktail.glass ? (
        <p className="mt-1 text-sm text-muted-foreground">Serve in: {cocktail.glass}</p>
      ) : null}

      <section className="card-surface mt-5 p-5">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Ingredients
        </h2>
        <ul className="space-y-2">
          {cocktail.ingredients.map((ing) => (
            <li key={ing} className="flex items-start gap-3 text-[15px]">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{ing}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card-surface mt-4 p-5">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Recipe
        </h2>
        <ol className="space-y-3">
          {cocktail.recipe.map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-[15px] leading-relaxed">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {cocktail.notes ? (
        <section className="mt-4 rounded-2xl border border-primary/25 bg-primary/[0.06] p-4 text-[15px] leading-relaxed">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">Notes</p>
          <p>{cocktail.notes}</p>
        </section>
      ) : null}
    </AppShell>
  );
}

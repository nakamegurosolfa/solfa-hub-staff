import { ChevronRight } from "lucide-react";
import { Fragment } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { BreakHomeCard } from "@/components/ui-hub/breaks/BreakHomeCard";
import { LostItemHomeCard } from "@/components/ui-hub/lost-items/LostItemHomeCard";
import { EmployeeWorkHomeCard } from "@/components/ui-hub/EmployeeWorkHomeCard";
import { APP_NAME, APP_TAGLINE, APP_VERSION, homeSections } from "@/data/app-sections";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <AppShell>
      <PageHeader title={APP_NAME} version={APP_VERSION} subtitle={APP_TAGLINE} />

      <div className="flex flex-col gap-3">
        {homeSections.map((section) => (
          <Fragment key={section.to}>
            <Link
              to={section.to}
              className="tap grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-3xl border border-border bg-[var(--color-surface)] px-5 py-5 hover:bg-[var(--color-surface-2)]"
            >
              <span
                className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl"
                style={{ backgroundColor: section.color + "1F" }}
                aria-hidden
              >
                {section.emoji}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[17px] font-semibold tracking-tight">{section.title}</span>
                <span className="mt-1 block truncate text-[13px] text-muted-foreground">{section.description}</span>
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
            </Link>
            {section.id === "manuals" ? (
              <>
                <BreakHomeCard />
                <LostItemHomeCard />
              </>
            ) : null}
          </Fragment>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <p className="px-1 text-[11px] font-semibold tracking-wider text-muted-foreground/60">社員専用</p>
        <EmployeeWorkHomeCard />
      </div>
    </AppShell>
  );
}

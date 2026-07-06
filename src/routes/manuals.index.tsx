import { createFileRoute } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { ListCard } from "@/components/ui-hub/ListCard";
import { manualCategories } from "@/data/content";

export const Route = createFileRoute("/manuals/")({
  component: ManualsIndex,
  head: () => ({ meta: [{ title: "Manuals — solfa HUB" }] }),
});

function ManualsIndex() {
  return (
    <AppShell>
      <PageHeader title="Manuals" subtitle="Service playbooks & standards" />
      <div className="flex flex-col gap-2">
        {manualCategories.map((m) => (
          <ListCard
            key={m.id}
            to="/manuals/$id"
            params={{ id: m.id }}
            title={m.title}
            subtitle={m.summary}
            icon={BookOpen}
            iconColor="#B58BFF"
          />
        ))}
      </div>
    </AppShell>
  );
}

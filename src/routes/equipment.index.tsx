import { createFileRoute } from "@tanstack/react-router";
import { Wrench } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { ListCard } from "@/components/ui-hub/ListCard";
import { equipmentCategories } from "@/data/content";

export const Route = createFileRoute("/equipment/")({
  component: EquipmentIndex,
  head: () => ({ meta: [{ title: "Equipment — solfa HUB" }] }),
});

function EquipmentIndex() {
  return (
    <AppShell>
      <PageHeader title="Equipment" subtitle="Gear guides & troubleshooting" />
      <div className="flex flex-col gap-2">
        {equipmentCategories.map((m) => (
          <ListCard
            key={m.id}
            to="/equipment/$id"
            params={{ id: m.id }}
            title={m.title}
            subtitle={m.summary}
            icon={Wrench}
            iconColor="#4DD6A6"
          />
        ))}
      </div>
    </AppShell>
  );
}

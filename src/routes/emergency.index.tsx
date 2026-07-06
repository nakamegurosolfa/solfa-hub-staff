import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Flame, Zap, Wind, HeartPulse } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { ListCard } from "@/components/ui-hub/ListCard";
import { emergencyCategories } from "@/data/content";

const iconFor: Record<string, typeof AlertTriangle> = {
  "gas-leak": Wind,
  "power-failure": Zap,
  fire: Flame,
  "first-aid": HeartPulse,
};

export const Route = createFileRoute("/emergency/")({
  component: EmergencyIndex,
  head: () => ({ meta: [{ title: "Emergency — solfa HUB" }] }),
});

function EmergencyIndex() {
  return (
    <AppShell>
      <PageHeader title="Emergency" subtitle="Stay calm. Follow the protocol." />
      <div className="mb-4 flex items-center gap-3 rounded-2xl border border-[color:var(--color-emergency)]/40 bg-[color:var(--color-emergency)]/10 px-4 py-3 text-sm">
        <AlertTriangle className="h-5 w-5 shrink-0" style={{ color: "var(--color-emergency)" }} />
        <span>If life is at risk, call <strong>119</strong> first.</span>
      </div>
      <div className="flex flex-col gap-2">
        {emergencyCategories.map((m) => (
          <ListCard
            key={m.id}
            to="/emergency/$id"
            params={{ id: m.id }}
            title={m.title}
            subtitle={m.summary}
            icon={iconFor[m.id] ?? AlertTriangle}
            iconColor="var(--color-emergency)"
          />
        ))}
      </div>
    </AppShell>
  );
}

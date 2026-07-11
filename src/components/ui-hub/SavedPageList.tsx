import { Clock, Star } from "lucide-react";

import { ListCard, SectionLabel } from "@/components/ui-hub/ListCard";
import type { SavedPage } from "@/lib/page-library";

export function SavedPageList({
  items,
  emptyTitle,
  emptyDescription,
  icon = Clock,
}: {
  items: SavedPage[];
  emptyTitle: string;
  emptyDescription: string;
  icon?: typeof Clock;
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-6 text-center text-sm text-muted-foreground">
        {emptyTitle}
        <br />
        <span className="mt-1 inline-block text-xs">{emptyDescription}</span>
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <ListCard
          key={item.id}
          to={item.to}
          params={item.params}
          title={item.title}
          subtitle={item.subtitle}
          icon={icon}
          iconColor="var(--color-muted-foreground)"
        />
      ))}
    </div>
  );
}

export function SavedPageSection({
  label,
  items,
  emptyTitle,
  emptyDescription,
  icon,
}: {
  label: string;
  items: SavedPage[];
  emptyTitle: string;
  emptyDescription: string;
  icon?: typeof Star;
}) {
  return (
    <>
      <SectionLabel>{label}</SectionLabel>
      <SavedPageList items={items} emptyTitle={emptyTitle} emptyDescription={emptyDescription} icon={icon} />
    </>
  );
}

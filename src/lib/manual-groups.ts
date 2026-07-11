import type { ManualSummary } from "@/lib/notion-types";

export function isStandaloneQaManual(manual: ManualSummary): boolean {
  if (manual.category?.trim() === "Q&A") return true;
  return manual.title.trim().startsWith("Q&A");
}

export function filterManualsForIndex(manuals: ManualSummary[]): ManualSummary[] {
  return manuals.filter((manual) => !isStandaloneQaManual(manual));
}

export function sortManualsByDisplayOrder(manuals: ManualSummary[]): ManualSummary[] {
  return [...manuals].sort((a, b) => {
    const aOrder = a.displayOrder;
    const bOrder = b.displayOrder;
    const aHasOrder = aOrder !== undefined;
    const bHasOrder = bOrder !== undefined;

    if (aHasOrder && bHasOrder) return aOrder - bOrder;
    if (aHasOrder) return -1;
    if (bHasOrder) return 1;
    return 0;
  });
}

export function prepareManualsForIndex(manuals: ManualSummary[]): ManualSummary[] {
  return sortManualsByDisplayOrder(filterManualsForIndex(manuals));
}

/** Groups manuals by category while preserving list order. */
export function groupManualsByCategory(manuals: ManualSummary[]) {
  const groups = new Map<string, ManualSummary[]>();
  const categoryOrder: string[] = [];

  for (const manual of manuals) {
    const category = manual.category?.trim() || "その他";
    if (!groups.has(category)) {
      categoryOrder.push(category);
      groups.set(category, []);
    }
    groups.get(category)!.push(manual);
  }

  return categoryOrder.map((category) => ({
    category,
    items: groups.get(category)!,
  }));
}

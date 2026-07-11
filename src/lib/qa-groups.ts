import type { QaCategoryGroup, QaItem } from "@/lib/qa-types";

/** Groups Q&A items by category while preserving Notion query order. */
export function groupQaByCategory(items: QaItem[]): QaCategoryGroup[] {
  const groups = new Map<string, QaItem[]>();
  const categoryOrder: string[] = [];

  for (const item of items) {
    const category = item.category.trim() || "その他";
    if (!groups.has(category)) {
      categoryOrder.push(category);
      groups.set(category, []);
    }
    groups.get(category)!.push(item);
  }

  return categoryOrder.map((category) => ({
    category,
    items: groups.get(category)!,
  }));
}

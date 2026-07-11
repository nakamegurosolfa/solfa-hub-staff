import { classifyNotionPageTitle, sectionLabels } from "@/data/app-sections";
import { getCocktailList } from "@/lib/notion-cocktails.server";
import { getManualList } from "@/lib/notion-manuals.server";
import { getManualPageList } from "@/lib/notion.server";
import { makePageId } from "@/lib/page-library";
import type { ManualPageSummary, UpdateHistoryItem } from "@/lib/notion-types";

export const HOME_UPDATE_HISTORY_LIMIT = 5;

export function formatUpdateDate(iso: string) {
  return new Date(iso).toLocaleDateString("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "numeric",
    day: "numeric",
  });
}

function routeForRootPage(page: ManualPageSummary): Pick<UpdateHistoryItem, "to" | "params"> {
  const section = classifyNotionPageTitle(page.title);

  if (section === "organization") {
    return { to: "/organization" };
  }

  if (section === "about") {
    return { to: "/about/$id", params: { id: page.id } };
  }

  return { to: "/manuals/$id", params: { id: page.id } };
}

export async function buildUpdateHistory(): Promise<UpdateHistoryItem[]> {
  const items: UpdateHistoryItem[] = [];

  const [cocktails, manuals, rootPages] = await Promise.all([
    getCocktailList(),
    getManualList(),
    getManualPageList(),
  ]);

  for (const cocktail of cocktails) {
    if (!cocktail.lastEditedAt) continue;
    items.push({
      id: makePageId("/cocktails/$id", { id: cocktail.id }),
      title: cocktail.name,
      sectionLabel: sectionLabels.cocktails,
      lastEditedAt: cocktail.lastEditedAt,
      to: "/cocktails/$id",
      params: { id: cocktail.id },
    });
  }

  for (const manual of manuals) {
    const lastEditedAt = manual.updatedAt ?? manual.lastEditedAt;
    if (!lastEditedAt) continue;
    items.push({
      id: makePageId("/manuals/$id", { id: manual.id }),
      title: manual.title,
      sectionLabel: sectionLabels.manuals,
      lastEditedAt,
      to: "/manuals/$id",
      params: { id: manual.id },
    });
  }

  for (const page of rootPages) {
    if (!page.lastEditedAt) continue;
    const section = classifyNotionPageTitle(page.title);
    if (section === "manuals") continue;

    const route = routeForRootPage(page);
    items.push({
      id: makePageId(route.to, route.params),
      title: page.title,
      sectionLabel: sectionLabels[section],
      lastEditedAt: page.lastEditedAt,
      ...route,
    });
  }

  return items.sort(
    (a, b) => new Date(b.lastEditedAt).getTime() - new Date(a.lastEditedAt).getTime(),
  );
}

export function groupUpdatesByDate(items: UpdateHistoryItem[]) {
  const groups: { date: string; items: UpdateHistoryItem[] }[] = [];

  for (const item of items) {
    const date = formatUpdateDate(item.lastEditedAt);
    const lastGroup = groups[groups.length - 1];

    if (lastGroup?.date === date) {
      lastGroup.items.push(item);
      continue;
    }

    groups.push({ date, items: [item] });
  }

  return groups;
}

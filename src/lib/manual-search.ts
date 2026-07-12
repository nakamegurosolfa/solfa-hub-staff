function normalizeSearchTag(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().normalize("NFKC").toLowerCase();
}

function getSearchTags(item: { searchTags?: string[] | null; tags?: string[] | null }): string[] {
  const raw = item.searchTags ?? item.tags ?? [];
  if (!Array.isArray(raw)) return [];
  return raw.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0);
}

export type ManualSearchHit<T> = {
  item: T;
  matchingTag: string;
};

export function buildManualSearchHits<T extends { searchTags?: string[] | null; tags?: string[] | null }>(
  manuals: T[] | null | undefined,
  query: unknown,
): ManualSearchHit<T>[] {
  if (!Array.isArray(manuals)) return [];

  const normalizedQuery = normalizeSearchTag(query);
  if (!normalizedQuery) return [];

  const hits: ManualSearchHit<T>[] = [];

  for (const item of manuals) {
    const matchingTag = getSearchTags(item).find((tag) =>
      normalizeSearchTag(tag).includes(normalizedQuery),
    );
    if (matchingTag) {
      hits.push({ item, matchingTag });
    }
  }

  return hits;
}

export function filterManualsBySearchTags<T extends { searchTags?: string[] | null; tags?: string[] | null }>(
  manuals: T[] | null | undefined,
  query: unknown,
): T[] {
  return buildManualSearchHits(manuals, query).map((hit) => hit.item);
}

export function manualAnchorId(manualId: string) {
  return `manual-${manualId}`;
}

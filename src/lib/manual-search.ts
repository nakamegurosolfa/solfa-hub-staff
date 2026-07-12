function normalizeSearchTag(value: string): string {
  return value.trim().normalize("NFKC").toLowerCase();
}

function getSearchTags(item: { searchTags?: string[]; tags?: string[] }): string[] {
  return item.searchTags ?? item.tags ?? [];
}

export type ManualSearchHit<T> = {
  item: T;
  matchingTag: string;
};

export function buildManualSearchHits<T extends { searchTags?: string[]; tags?: string[] }>(
  manuals: T[],
  query: string,
): ManualSearchHit<T>[] {
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

export function filterManualsBySearchTags<T extends { searchTags?: string[]; tags?: string[] }>(
  manuals: T[],
  query: string,
): T[] {
  return buildManualSearchHits(manuals, query).map((hit) => hit.item);
}

export function manualAnchorId(manualId: string) {
  return `manual-${manualId}`;
}

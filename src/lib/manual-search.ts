function normalizeSearchTag(value: string): string {
  return value.trim().normalize("NFKC").toLowerCase();
}

function getSearchTags(item: { searchTags?: string[]; tags?: string[] }): string[] {
  return item.searchTags ?? item.tags ?? [];
}

export function filterManualsBySearchTags<T extends { searchTags?: string[]; tags?: string[] }>(
  manuals: T[],
  query: string,
): T[] {
  const normalizedQuery = normalizeSearchTag(query);
  if (!normalizedQuery) return manuals;

  return manuals.filter((item) =>
    getSearchTags(item).some((tag) => normalizeSearchTag(tag).includes(normalizedQuery)),
  );
}

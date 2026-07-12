export function normalizeSearchText(value: string): string {
  return value.trim().normalize("NFKC").toLowerCase();
}

export function matchesSearchQuery(haystack: string, normalizedQuery: string): boolean {
  if (!normalizedQuery) return false;
  return normalizeSearchText(haystack).includes(normalizedQuery);
}

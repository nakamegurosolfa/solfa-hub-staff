export type SavedPage = {
  id: string;
  title: string;
  subtitle: string;
  to: string;
  params?: Record<string, string>;
  timestamp: number;
};

const RECENT_KEY = "solfa-recent-pages";
const FAVORITES_KEY = "solfa-favorite-pages";
const RECENT_LIMIT = 30;
export const HOME_RECENT_LIMIT = 5;
export const LIBRARY_EVENT = "solfa-page-library-change";

export function makePageId(to: string, params?: Record<string, string>) {
  if (!params || Object.keys(params).length === 0) return to;
  const query = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return `${to}?${query}`;
}

function readList(key: string): SavedPage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedPage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeList(key: string, items: SavedPage[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(items));
  window.dispatchEvent(new Event(LIBRARY_EVENT));
}

export function recordRecentVisit(page: Omit<SavedPage, "timestamp">) {
  const entry: SavedPage = { ...page, timestamp: Date.now() };
  const items = readList(RECENT_KEY).filter((item) => item.id !== entry.id);
  writeList(RECENT_KEY, [entry, ...items].slice(0, RECENT_LIMIT));
}

export function getRecentPages(limit?: number) {
  const items = readList(RECENT_KEY);
  return limit ? items.slice(0, limit) : items;
}

export function getFavoritePages() {
  return readList(FAVORITES_KEY).sort((a, b) => b.timestamp - a.timestamp);
}

export function isFavoritePage(id: string) {
  return readList(FAVORITES_KEY).some((item) => item.id === id);
}

export function toggleFavoritePage(page: Omit<SavedPage, "timestamp">) {
  const items = readList(FAVORITES_KEY);
  const exists = items.some((item) => item.id === page.id);

  if (exists) {
    writeList(
      FAVORITES_KEY,
      items.filter((item) => item.id !== page.id),
    );
    return false;
  }

  writeList(FAVORITES_KEY, [{ ...page, timestamp: Date.now() }, ...items]);
  return true;
}

export function removeFavoritePage(id: string) {
  writeList(
    FAVORITES_KEY,
    readList(FAVORITES_KEY).filter((item) => item.id !== id),
  );
}

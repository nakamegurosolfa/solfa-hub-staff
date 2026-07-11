import { useCallback, useEffect, useState } from "react";

import {
  getFavoritePages,
  getRecentPages,
  isFavoritePage,
  LIBRARY_EVENT,
  recordRecentVisit,
  type SavedPage,
  toggleFavoritePage,
} from "@/lib/page-library";

function useLibraryList(read: () => SavedPage[]) {
  const [items, setItems] = useState<SavedPage[]>([]);

  useEffect(() => {
    const refresh = () => setItems(read());
    refresh();
    window.addEventListener(LIBRARY_EVENT, refresh);
    return () => window.removeEventListener(LIBRARY_EVENT, refresh);
  }, [read]);

  return items;
}

export function useRecentPages(limit?: number) {
  return useLibraryList(useCallback(() => getRecentPages(limit), [limit]));
}

export function useFavoritePages() {
  return useLibraryList(getFavoritePages);
}

export function useTrackPageVisit(page: Omit<SavedPage, "timestamp"> | null) {
  useEffect(() => {
    if (!page) return;
    recordRecentVisit(page);
  }, [page?.id, page?.title, page?.subtitle, page?.to]);
}

export function usePageFavorite(page: Omit<SavedPage, "timestamp"> | null) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!page) return;
    setActive(isFavoritePage(page.id));

    const refresh = () => setActive(isFavoritePage(page.id));
    window.addEventListener(LIBRARY_EVENT, refresh);
    return () => window.removeEventListener(LIBRARY_EVENT, refresh);
  }, [page?.id]);

  const toggle = useCallback(() => {
    if (!page) return;
    setActive(toggleFavoritePage(page));
  }, [page]);

  return { active, toggle };
}

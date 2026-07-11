import { Star } from "lucide-react";

import { usePageFavorite } from "@/hooks/use-page-library";
import type { SavedPage } from "@/lib/page-library";

export function FavoriteButton({ page }: { page: Omit<SavedPage, "timestamp"> }) {
  const { active, toggle } = usePageFavorite(page);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={active ? "お気に入りから削除" : "お気に入りに追加"}
      aria-pressed={active}
      className="tap grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-border bg-[var(--color-surface)] text-muted-foreground hover:bg-[var(--color-surface-2)]"
      style={active ? { color: "#FFB86B", borderColor: "#FFB86B44" } : undefined}
    >
      <Star className="h-5 w-5" fill={active ? "currentColor" : "none"} strokeWidth={active ? 0 : 2} />
    </button>
  );
}

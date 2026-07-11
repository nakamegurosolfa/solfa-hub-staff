import type { ReactNode } from "react";

import { FavoriteButton } from "@/components/ui-hub/FavoriteButton";
import { useTrackPageVisit } from "@/hooks/use-page-library";
import type { SavedPage } from "@/lib/page-library";

export function DetailPageHeader({
  page,
  title,
  meta,
}: {
  page: Omit<SavedPage, "timestamp">;
  title: string;
  meta?: ReactNode;
}) {
  useTrackPageVisit(page);

  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {meta ? <div className="mt-1">{meta}</div> : null}
      </div>
      <FavoriteButton page={page} />
    </div>
  );
}

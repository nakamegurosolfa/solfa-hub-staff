import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { appPageTitle } from "@/data/app-sections";
import { SavedPageList } from "@/components/ui-hub/SavedPageList";
import { useFavoritePages } from "@/hooks/use-page-library";

export const Route = createFileRoute("/favorites/")({
  head: () => ({ meta: [{ title: appPageTitle("お気に入り") }] }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const favoritePages = useFavoritePages();

  return (
    <AppShell>
      <PageHeader title="お気に入り" subtitle="登録したページ" />
      <SavedPageList
        items={favoritePages}
        icon={Star}
        emptyTitle="お気に入りはまだありません。"
        emptyDescription="各ページの星マークから登録できます。"
      />
    </AppShell>
  );
}

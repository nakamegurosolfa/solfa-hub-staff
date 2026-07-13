import { Plus } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell, BackLink, PageHeader } from "@/components/layout/AppShell";
import { LostItemCard } from "@/components/ui-hub/lost-items/LostItemCard";
import { LostItemFilterBar } from "@/components/ui-hub/lost-items/LostItemFilterBar";
import { LostItemRegisterDialog } from "@/components/ui-hub/lost-items/LostItemRegisterDialog";
import { appPageTitle } from "@/data/app-sections";
import { useLostItemsList } from "@/hooks/use-lost-items";

export const Route = createFileRoute("/lost-items/")({
  head: () => ({ meta: [{ title: appPageTitle("忘れ物管理") }] }),
  component: LostItemsIndexPage,
});

function LostItemsIndexPage() {
  const {
    items,
    filter,
    setFilter,
    todayDateKey,
    loading,
    error,
    registerOpen,
    setRegisterOpen,
    saving,
    registerItem,
  } = useLostItemsList();

  return (
    <AppShell>
      <BackLink to="/" label="ホーム" />
      <PageHeader
        title="忘れ物管理"
        subtitle="忘れ物の登録・返却・処分を管理"
        action={
          <button
            type="button"
            className="tap grid h-11 w-11 place-items-center rounded-2xl border border-border bg-[var(--color-surface)] text-primary hover:bg-[var(--color-surface-2)]"
            onClick={() => setRegisterOpen(true)}
            aria-label="忘れ物を登録"
          >
            <Plus className="h-5 w-5" />
          </button>
        }
      />

      <div className="space-y-4 pb-8">
        <button
          type="button"
          className="tap w-full rounded-2xl bg-primary px-4 py-4 text-sm font-semibold text-primary-foreground"
          onClick={() => setRegisterOpen(true)}
        >
          忘れ物を登録
        </button>

        <LostItemFilterBar value={filter} onChange={setFilter} />

        {loading ? (
          <p className="rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-8 text-center text-sm text-muted-foreground">
            読み込み中…
          </p>
        ) : error ? (
          <p className="rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-8 text-center text-sm text-destructive">
            忘れ物一覧の取得に失敗しました。
          </p>
        ) : items.length === 0 ? (
          <p className="rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-8 text-center text-sm text-muted-foreground">
            該当する忘れ物はありません。
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <LostItemCard key={item.id} item={item} todayDateKey={todayDateKey} />
            ))}
          </div>
        )}
      </div>

      <LostItemRegisterDialog
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        saving={saving}
        onSubmit={registerItem}
      />
    </AppShell>
  );
}

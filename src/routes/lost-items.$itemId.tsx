import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import {
  LostItemFormFields,
  type LostItemFormState,
} from "@/components/ui-hub/lost-items/LostItemFormFields";
import { type CompressedLostItemPhoto } from "@/lib/lost-items-image";
import { canDeleteLostItem, formatStorageDeadlineLabel } from "@/lib/lost-items-storage";
import { appPageTitle } from "@/data/app-sections";
import { lostItemToFormState, useLostItemDetail } from "@/hooks/use-lost-items";
import { formatTokyoBusinessDateShortLabel } from "@/lib/tokyo-time";

export const Route = createFileRoute("/lost-items/$itemId")({
  head: () => ({ meta: [{ title: appPageTitle("忘れ物詳細") }] }),
  component: LostItemDetailPage,
});

function LostItemDetailPage() {
  const { itemId } = Route.useParams();
  const navigate = useNavigate();
  const { item, loading, error, saving, deleting, todayDateKey, saveItem, removeItem } =
    useLostItemDetail(itemId);
  const [form, setForm] = useState<LostItemFormState | null>(null);
  const [photo, setPhoto] = useState<CompressedLostItemPhoto | null>(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [photoZoomOpen, setPhotoZoomOpen] = useState(false);

  useEffect(() => {
    if (!item) return;
    setForm(lostItemToFormState(item));
    setPhoto(null);
    setPhotoRemoved(false);
    setSaveError(null);
  }, [item]);

  const handleSave = async () => {
    if (!form) return;
    setSaveError(null);
    if (!form.name.trim() || !form.foundLocation.trim() || !form.foundByStaff.trim()) {
      setSaveError("必須項目を入力してください。");
      return;
    }
    try {
      await saveItem({
        form,
        photo,
        removePhoto: photoRemoved && !photo,
      });
    } catch (caught) {
      setSaveError(caught instanceof Error ? caught.message : "保存に失敗しました。");
    }
  };

  const handleDelete = async () => {
    try {
      await removeItem();
      setDeleteOpen(false);
      navigate({ to: "/lost-items" });
    } catch {
      setDeleteOpen(false);
    }
  };

  const photoPreviewUrl = photoRemoved ? null : (photo ? `data:${photo.mimeType};base64,${photo.dataBase64}` : item?.photo?.url ?? null);
  const deadlineLabel = item ? formatStorageDeadlineLabel(item, todayDateKey) : null;

  return (
    <AppShell>
      <Link
        to="/lost-items"
        className="tap mb-4 inline-flex items-center gap-1 text-sm font-medium text-primary"
      >
        <span aria-hidden>‹</span> 忘れ物管理
      </Link>

      {loading ? (
        <p className="rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-8 text-center text-sm text-muted-foreground">
          読み込み中…
        </p>
      ) : error || !item || !form ? (
        <>
          <PageHeader title="忘れ物詳細" />
          <p className="rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-8 text-center text-sm text-muted-foreground">
            忘れ物が見つかりませんでした。
          </p>
        </>
      ) : (
        <>
          <PageHeader title={item.name} subtitle={`拾得日 ${formatTokyoBusinessDateShortLabel(item.foundDate)}`} />

          <div className="space-y-4 pb-8">
            {photoPreviewUrl ? (
              <button
                type="button"
                className="tap w-full overflow-hidden rounded-2xl border border-border bg-[var(--color-surface-2)]"
                onClick={() => setPhotoZoomOpen(true)}
              >
                <img src={photoPreviewUrl} alt={item.name} className="max-h-72 w-full object-contain" />
              </button>
            ) : null}

            {deadlineLabel ? (
              <div className="rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-3 text-sm">
                <p className="text-[11px] font-medium text-muted-foreground">保管期限</p>
                <p className="mt-1 font-semibold">
                  {formatTokyoBusinessDateShortLabel(item.storageDeadline)}
                  <span className="ml-2 text-primary">{deadlineLabel.text}</span>
                </p>
              </div>
            ) : null}

            <LostItemFormFields
              value={form}
              onChange={setForm}
              photoPreviewUrl={item.photo?.url ?? null}
              onPhotoChange={setPhoto}
              photoRemoved={photoRemoved}
              onPhotoRemovedChange={setPhotoRemoved}
              disabled={saving || deleting}
            />

            {saveError ? <p className="text-sm text-destructive">{saveError}</p> : null}

            <Button type="button" className="w-full" disabled={saving || deleting} onClick={() => void handleSave()}>
              {saving ? "保存中…" : "変更を保存"}
            </Button>

            {canDeleteLostItem(item) ? (
              <Button
                type="button"
                variant="outline"
                className="w-full border-destructive/40 text-destructive hover:bg-destructive/10"
                disabled={saving || deleting}
                onClick={() => setDeleteOpen(true)}
              >
                削除
              </Button>
            ) : null}
          </div>

          <Dialog open={photoZoomOpen} onOpenChange={setPhotoZoomOpen}>
            <DialogContent className="max-w-sm rounded-3xl p-2">
              <DialogHeader className="sr-only">
                <DialogTitle>写真を拡大表示</DialogTitle>
              </DialogHeader>
              {photoPreviewUrl ? (
                <img src={photoPreviewUrl} alt={item.name} className="max-h-[70vh] w-full rounded-2xl object-contain" />
              ) : null}
            </DialogContent>
          </Dialog>

          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogContent className="rounded-3xl">
              <AlertDialogHeader>
                <AlertDialogTitle>忘れ物を削除しますか？</AlertDialogTitle>
                <AlertDialogDescription>
                  この忘れ物データと写真を完全に削除します。元に戻せません。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting}>キャンセル</AlertDialogCancel>
                <AlertDialogAction disabled={deleting} onClick={() => void handleDelete()}>
                  {deleting ? "削除中…" : "削除する"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </AppShell>
  );
}

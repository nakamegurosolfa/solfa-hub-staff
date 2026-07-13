import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LostItemFormFields,
  type LostItemFormState,
} from "@/components/ui-hub/lost-items/LostItemFormFields";
import { type CompressedLostItemPhoto } from "@/lib/lost-items-image";
import {
  LOST_ITEM_DISPOSAL_PENDING,
  LOST_ITEM_HANDOVER_PENDING,
} from "@/lib/lost-items-types";
import { formatTokyoDateKey } from "@/lib/tokyo-time";

type LostItemRegisterDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saving: boolean;
  onSubmit: (payload: {
    form: LostItemFormState;
    photo: CompressedLostItemPhoto | null;
  }) => Promise<void>;
};

function createInitialForm(): LostItemFormState {
  return {
    name: "",
    foundDate: formatTokyoDateKey(new Date()),
    foundLocation: "",
    features: "",
    foundByStaff: "",
    inquiryName: "",
    inquiryPhone: "",
    handoverStatus: LOST_ITEM_HANDOVER_PENDING,
    handoverDate: "",
    handoverStaff: "",
    disposalStatus: LOST_ITEM_DISPOSAL_PENDING,
  };
}

export function LostItemRegisterDialog({
  open,
  onOpenChange,
  saving,
  onSubmit,
}: LostItemRegisterDialogProps) {
  const [form, setForm] = useState<LostItemFormState>(createInitialForm);
  const [photo, setPhoto] = useState<CompressedLostItemPhoto | null>(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setForm(createInitialForm());
    setPhoto(null);
    setPhotoRemoved(false);
    setError(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (saving) return;
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    setError(null);
    if (!form.name.trim() || !form.foundLocation.trim() || !form.foundByStaff.trim()) {
      setError("必須項目を入力してください。");
      return;
    }
    try {
      await onSubmit({ form, photo });
      reset();
      onOpenChange(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "登録に失敗しました。");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-sm overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle>忘れ物を登録</DialogTitle>
        </DialogHeader>
        <LostItemFormFields
          value={form}
          onChange={setForm}
          photoPreviewUrl={null}
          onPhotoChange={setPhoto}
          photoRemoved={photoRemoved}
          onPhotoRemovedChange={setPhotoRemoved}
          disabled={saving}
        />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" disabled={saving} onClick={() => handleOpenChange(false)}>
            キャンセル
          </Button>
          <Button type="button" disabled={saving} onClick={() => void handleSubmit()}>
            {saving ? "登録中…" : "登録する"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

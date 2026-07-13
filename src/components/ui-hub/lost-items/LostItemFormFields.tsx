import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LostItemPhotoField } from "@/components/ui-hub/lost-items/LostItemPhotoField";
import { type CompressedLostItemPhoto } from "@/lib/lost-items-image";
import {
  LOST_ITEM_DISPOSAL_DONE,
  LOST_ITEM_DISPOSAL_PENDING,
  LOST_ITEM_HANDOVER_DONE,
  LOST_ITEM_HANDOVER_PENDING,
  type LostItemHandoverStatus,
  type LostItemDisposalStatus,
} from "@/lib/lost-items-types";
import { calculateStorageDeadline } from "@/lib/lost-items-storage";
import { formatTokyoBusinessDateShortLabel } from "@/lib/tokyo-time";

export type LostItemFormState = {
  name: string;
  foundDate: string;
  foundLocation: string;
  features: string;
  foundByStaff: string;
  inquiryName: string;
  inquiryPhone: string;
  handoverStatus: LostItemHandoverStatus;
  handoverDate: string;
  handoverStaff: string;
  disposalStatus: LostItemDisposalStatus;
};

type LostItemFormFieldsProps = {
  value: LostItemFormState;
  onChange: (value: LostItemFormState) => void;
  photoPreviewUrl?: string | null;
  onPhotoChange: (photo: CompressedLostItemPhoto | null) => void;
  photoRemoved: boolean;
  onPhotoRemovedChange: (removed: boolean) => void;
  disabled?: boolean;
};

export function LostItemFormFields({
  value,
  onChange,
  photoPreviewUrl,
  onPhotoChange,
  photoRemoved,
  onPhotoRemovedChange,
  disabled,
}: LostItemFormFieldsProps) {
  const update = (patch: Partial<LostItemFormState>) => onChange({ ...value, ...patch });
  const handoverDone = value.handoverStatus === LOST_ITEM_HANDOVER_DONE;
  const storageDeadline = value.foundDate ? calculateStorageDeadline(value.foundDate) : "";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="lost-item-found-date">拾得日</Label>
        <Input
          id="lost-item-found-date"
          type="date"
          value={value.foundDate}
          disabled={disabled}
          onChange={(event) => update({ foundDate: event.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lost-item-found-location">拾得場所</Label>
        <Input
          id="lost-item-found-location"
          value={value.foundLocation}
          disabled={disabled}
          onChange={(event) => update({ foundLocation: event.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lost-item-name">忘れ物の名称</Label>
        <Input
          id="lost-item-name"
          value={value.name}
          disabled={disabled}
          onChange={(event) => update({ name: event.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lost-item-features">特徴</Label>
        <Textarea
          id="lost-item-features"
          value={value.features}
          disabled={disabled}
          rows={3}
          onChange={(event) => update({ features: event.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lost-item-found-by">拾得したスタッフ</Label>
        <Input
          id="lost-item-found-by"
          value={value.foundByStaff}
          disabled={disabled}
          onChange={(event) => update({ foundByStaff: event.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>写真</Label>
        <LostItemPhotoField
          previewUrl={photoRemoved ? null : photoPreviewUrl}
          disabled={disabled}
          onChange={(photo) => {
            onPhotoChange(photo);
            onPhotoRemovedChange(photo === null);
          }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lost-item-inquiry-name">問い合わせした人（名前）</Label>
        <Input
          id="lost-item-inquiry-name"
          value={value.inquiryName}
          disabled={disabled}
          onChange={(event) => update({ inquiryName: event.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lost-item-inquiry-phone">問い合わせした人（電話番号）</Label>
        <Input
          id="lost-item-inquiry-phone"
          type="tel"
          value={value.inquiryPhone}
          disabled={disabled}
          onChange={(event) => update({ inquiryPhone: event.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>受け渡し状況</Label>
        <div className="grid grid-cols-2 gap-2">
          {[LOST_ITEM_HANDOVER_PENDING, LOST_ITEM_HANDOVER_DONE].map((status) => (
            <button
              key={status}
              type="button"
              disabled={disabled}
              className={`tap rounded-2xl border px-3 py-3 text-sm ${
                value.handoverStatus === status
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-[var(--color-surface)] text-muted-foreground"
              }`}
              onClick={() =>
                update({
                  handoverStatus: status,
                  handoverDate: status === LOST_ITEM_HANDOVER_PENDING ? "" : value.handoverDate,
                  handoverStaff: status === LOST_ITEM_HANDOVER_PENDING ? "" : value.handoverStaff,
                })
              }
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {handoverDone ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="lost-item-handover-date">受け渡し日</Label>
            <Input
              id="lost-item-handover-date"
              type="date"
              value={value.handoverDate}
              disabled={disabled}
              onChange={(event) => update({ handoverDate: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lost-item-handover-staff">対応スタッフ</Label>
            <Input
              id="lost-item-handover-staff"
              value={value.handoverStaff}
              disabled={disabled}
              onChange={(event) => update({ handoverStaff: event.target.value })}
            />
          </div>
        </>
      ) : null}

      <div className="rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-3 text-sm">
        <p className="text-[11px] font-medium text-muted-foreground">保管期限（自動計算）</p>
        <p className="mt-1 font-semibold">
          {storageDeadline ? formatTokyoBusinessDateShortLabel(storageDeadline) : "—"}
        </p>
      </div>

      <div className="space-y-2">
        <Label>処分状況</Label>
        <div className="grid grid-cols-2 gap-2">
          {[LOST_ITEM_DISPOSAL_PENDING, LOST_ITEM_DISPOSAL_DONE].map((status) => (
            <button
              key={status}
              type="button"
              disabled={disabled}
              className={`tap rounded-2xl border px-3 py-3 text-sm ${
                value.disposalStatus === status
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-[var(--color-surface)] text-muted-foreground"
              }`}
              onClick={() => update({ disposalStatus: status })}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

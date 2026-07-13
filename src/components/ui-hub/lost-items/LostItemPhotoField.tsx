import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { compressLostItemPhoto, type CompressedLostItemPhoto } from "@/lib/lost-items-image";

type LostItemPhotoFieldProps = {
  previewUrl?: string | null;
  onChange: (photo: CompressedLostItemPhoto | null) => void;
  disabled?: boolean;
};

export function LostItemPhotoField({ previewUrl, onChange, disabled }: LostItemPhotoFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const displayUrl = localPreview ?? previewUrl ?? null;

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const compressed = await compressLostItemPhoto(file);
      setLocalPreview(`data:${compressed.mimeType};base64,${compressed.dataBase64}`);
      onChange(compressed);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "画像の処理に失敗しました。");
    } finally {
      setProcessing(false);
    }
  };

  const handleRemove = () => {
    setLocalPreview(null);
    setError(null);
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-border bg-[var(--color-surface-2)]">
        {displayUrl ? (
          <img src={displayUrl} alt="忘れ物の写真" className="max-h-64 w-full object-contain" />
        ) : (
          <div className="grid h-40 place-items-center text-sm text-muted-foreground">写真未登録</div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          disabled={disabled || processing}
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />
        <Button
          type="button"
          variant="outline"
          disabled={disabled || processing}
          onClick={() => inputRef.current?.click()}
        >
          {processing ? "処理中…" : displayUrl ? "写真を変更" : "写真を追加"}
        </Button>
        {displayUrl ? (
          <Button type="button" variant="outline" disabled={disabled || processing} onClick={handleRemove}>
            写真を削除
          </Button>
        ) : null}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

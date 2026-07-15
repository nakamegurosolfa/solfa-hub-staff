import type { BreakSaveStatus } from "@/hooks/use-break-management";
import { RefreshCw } from "lucide-react";

type BreakSyncStatusProps = {
  saveStatus: BreakSaveStatus;
  saveError?: string | null;
  refreshing?: boolean;
  onRefresh?: () => void;
};

function statusLabel(saveStatus: BreakSaveStatus, refreshing?: boolean): string {
  if (refreshing) return "更新中…";
  switch (saveStatus) {
    case "loading":
      return "読み込み中…";
    case "saving":
      return "保存中…";
    case "saved":
      return "保存しました";
    case "error":
      return "保存に失敗しました";
    default:
      return "";
  }
}

export function BreakSyncStatus({
  saveStatus,
  saveError,
  refreshing,
  onRefresh,
}: BreakSyncStatusProps) {
  const label = statusLabel(saveStatus, refreshing);
  const showStatus = Boolean(label || saveError);

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-3">
      <div className="min-w-0 text-sm">
        {showStatus ? (
          <p
            className={
              saveStatus === "error" || saveError ? "text-destructive" : "text-muted-foreground"
            }
          >
            {saveError ?? label}
          </p>
        ) : (
          <p className="text-muted-foreground">Notion と同期中（45秒ごとに自動更新）</p>
        )}
      </div>
      {onRefresh ? (
        <button
          type="button"
          className="tap grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border text-primary hover:bg-[var(--color-surface-2)] disabled:opacity-50"
          onClick={onRefresh}
          disabled={saveStatus === "saving" || saveStatus === "loading" || refreshing}
          aria-label="最新の状態を取得"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      ) : null}
    </div>
  );
}

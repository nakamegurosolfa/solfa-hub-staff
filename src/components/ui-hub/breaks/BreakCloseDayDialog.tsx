import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { BreakInspectionIssue } from "@/lib/break-report-inspection";
import { formatBusinessDateShortLabel } from "@/lib/break-report-text";

export type BreakCloseDialogPhase = "confirm" | "issues" | "success" | "error";

type BreakCloseDayDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessDate: string;
  staffCount: number;
  issues: BreakInspectionIssue[];
  phase: BreakCloseDialogPhase;
  sending: boolean;
  onConfirmSend: () => void;
  onRetry: () => void;
};

export function BreakCloseDayDialog({
  open,
  onOpenChange,
  businessDate,
  staffCount,
  issues,
  phase,
  sending,
  onConfirmSend,
  onRetry,
}: BreakCloseDayDialogProps) {
  const dateLabel = formatBusinessDateShortLabel(businessDate);

  const handleOpenChange = (next: boolean) => {
    if (sending) return;
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl">
        {phase === "confirm" ? (
          <>
            <DialogHeader>
              <DialogTitle>営業を締める</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm leading-relaxed text-foreground">
              <p>
                {dateLabel}営業分を締めます。
                <br />
                スタッフ数：{staffCount}名
              </p>
              <p className="text-muted-foreground">
                メール送信成功後、この営業日のNotionデータはアーカイブされます。
              </p>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={sending}
              >
                キャンセル
              </Button>
              <Button type="button" onClick={onConfirmSend} disabled={sending}>
                {sending ? "送信中…" : "営業を締めて送信"}
              </Button>
            </DialogFooter>
          </>
        ) : null}

        {phase === "issues" ? (
          <>
            <DialogHeader>
              <DialogTitle>確認が必要な記録があります</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm leading-relaxed">
              <ul className="space-y-2 rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-3">
                {issues.map((issue, index) => (
                  <li key={`${issue.staffName}-${issue.message}-${index}`}>
                    ・{issue.staffName}：{issue.message}
                  </li>
                ))}
              </ul>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={sending}
              >
                修正して戻る
              </Button>
              <Button type="button" onClick={onConfirmSend} disabled={sending}>
                {sending ? "送信中…" : "このまま送信"}
              </Button>
            </DialogFooter>
          </>
        ) : null}

        {phase === "success" ? (
          <>
            <DialogHeader>
              <DialogTitle>送信完了</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm leading-relaxed text-foreground">
              <p>営業日の記録を送信しました。</p>
              <p className="text-muted-foreground">
                {dateLabel}営業分のデータをアーカイブしました。
              </p>
            </div>
            <DialogFooter>
              <Button type="button" onClick={() => onOpenChange(false)}>
                閉じる
              </Button>
            </DialogFooter>
          </>
        ) : null}

        {phase === "error" ? (
          <>
            <DialogHeader>
              <DialogTitle>送信に失敗しました</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm leading-relaxed text-foreground">
              <p>メール送信に失敗しました。</p>
              <p className="text-muted-foreground">
                記録はNotionに保存されています。
                <br />
                通信状況を確認して、もう一度送信してください。
              </p>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={sending}
              >
                閉じる
              </Button>
              <Button type="button" onClick={onRetry} disabled={sending}>
                {sending ? "送信中…" : "再送信"}
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

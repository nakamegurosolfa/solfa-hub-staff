import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type BreakAdminAuthDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthenticate: (password: string) => Promise<{ success: boolean; error?: string }>;
  onSuccess: () => void;
};

export function BreakAdminAuthDialog({
  open,
  onOpenChange,
  onAuthenticate,
  onSuccess,
}: BreakAdminAuthDialogProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setPassword("");
      setError(undefined);
      setSubmitting(false);
    }
  }, [open]);

  const handleOpenChange = (next: boolean) => {
    if (submitting) return;
    onOpenChange(next);
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(undefined);

    try {
      const result = await onAuthenticate(password);
      if (!result.success) {
        setError(result.error ?? "パスワードが違います");
        setPassword("");
        return;
      }

      onSuccess();
      onOpenChange(false);
    } catch {
      setError("パスワードが違います");
      setPassword("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl">
        <DialogHeader>
          <DialogTitle>🔒 社員認証</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            この操作は休憩記録を変更します。
            <br />
            社員パスワードを入力してください。
          </p>

          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            placeholder="パスワード"
            disabled={submitting}
            required
          />

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={submitting}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={submitting || password.length === 0}>
              {submitting ? "認証中..." : "認証"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

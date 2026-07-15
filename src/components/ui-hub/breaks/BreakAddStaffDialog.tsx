import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RequiredBreakMinutes } from "@/lib/break-management";

type BreakAddStaffDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (input: { name: string; requiredMinutes: RequiredBreakMinutes }) => Promise<boolean>;
  saving?: boolean;
};

export function BreakAddStaffDialog({
  open,
  onOpenChange,
  onAdd,
  saving = false,
}: BreakAddStaffDialogProps) {
  const [name, setName] = useState("");
  const [requiredMinutes, setRequiredMinutes] = useState<RequiredBreakMinutes>(45);

  const reset = () => {
    setName("");
    setRequiredMinutes(45);
  };

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const success = await onAdd({ name: trimmed, requiredMinutes });
    if (!success) return;
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (saving) return;
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-sm rounded-3xl">
        <DialogHeader>
          <DialogTitle>スタッフを追加</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="break-staff-name">名前</Label>
            <Input
              id="break-staff-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="名前を入力"
              autoComplete="off"
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label>必要休憩時間</Label>
            <div className="grid grid-cols-2 gap-2">
              {([45, 60] as const).map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  className={`tap rounded-xl border px-4 py-3 text-sm font-semibold ${
                    requiredMinutes === minutes
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-foreground"
                  }`}
                  onClick={() => setRequiredMinutes(minutes)}
                  disabled={saving}
                >
                  {minutes}分
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            キャンセル
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={!name.trim() || saving}>
            {saving ? "追加中…" : "追加"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

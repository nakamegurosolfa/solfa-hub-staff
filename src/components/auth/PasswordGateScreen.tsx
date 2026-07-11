import { useState } from "react";
import { Lock } from "lucide-react";

type PasswordGateScreenProps = {
  title: string;
  description: string;
  submitLabel: string;
  onSubmit: (password: string) => Promise<{ success: boolean; error?: string }>;
};

export function PasswordGateScreen({ title, description, submitLabel, onSubmit }: PasswordGateScreenProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(undefined);

    try {
      const result = await onSubmit(password);
      if (!result.success) {
        setError(result.error ?? "パスワードが違います");
        setPassword("");
      }
    } catch {
      setError("パスワードが違います");
      setPassword("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-md rounded-3xl border border-border bg-[var(--color-surface)] p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary" aria-hidden>
            <Lock className="h-6 w-6" strokeWidth={2} />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-muted-foreground">パスワード</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-[15px] outline-none ring-primary/30 focus:ring-2"
              placeholder="パスワードを入力"
              required
            />
          </label>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting || password.length === 0}
            className="tap w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {submitting ? "確認中..." : submitLabel}
          </button>
        </form>
      </div>
    </div>
  );
}

export function EmployeeOnlyBadge() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-[var(--color-surface-2)] px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
      <Lock className="h-3 w-3" aria-hidden />
      社員専用
    </span>
  );
}

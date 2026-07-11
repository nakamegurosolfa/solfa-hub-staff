import { AppShell, BackLink } from "@/components/layout/AppShell";
import { DetailPageHeader } from "@/components/ui-hub/DetailPageHeader";
import type { SavedPage } from "@/lib/page-library";

export function CategoryPlaceholder({
  backTo,
  backLabel,
  title,
  subtitle,
  page,
}: {
  backTo: string;
  backLabel: string;
  title: string;
  subtitle: string;
  page: Omit<SavedPage, "timestamp">;
}) {
  return (
    <AppShell>
      <BackLink to={backTo} label={backLabel} />
      <DetailPageHeader
        page={page}
        title={title}
        meta={<p className="text-sm text-muted-foreground">{subtitle}</p>}
      />
      <p className="rounded-2xl border border-border bg-[var(--color-surface)] px-4 py-6 text-center text-sm text-muted-foreground">
        内容は準備中です。
      </p>
    </AppShell>
  );
}

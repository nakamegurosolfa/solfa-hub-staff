import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { logout } from "@/lib/auth-functions";

export const Route = createFileRoute("/me/")({
  head: () => ({ meta: [{ title: "マイページ — solfa MANUAL APP" }] }),
  component: MyPage,
});

function MyPage() {
  const navigate = useNavigate();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    await router.invalidate();
    await navigate({ to: "/login" });
  }

  return (
    <AppShell>
      <PageHeader title="マイページ" subtitle="アカウント設定" />

      <section className="card-surface p-5">
        <h2 className="text-lg font-semibold tracking-tight">セッション</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-foreground/90">
          ログアウトすると、アプリ認証と社員認証の両方が解除されます。
        </p>
        <button
          type="button"
          onClick={handleLogout}
          className="tap mt-4 rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-foreground hover:bg-[var(--color-surface-2)]"
        >
          ログアウト
        </button>
      </section>

      <section className="card-surface mt-4 p-5">
        <h2 className="text-lg font-semibold tracking-tight">アプリについて</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-foreground/90">
          solfa MANUAL APP は、solfa 専用のアルバイトスタッフ向け業務マニュアルアプリです。Notion
          で管理された情報を、営業中にすぐ確認できる形で提供します。
        </p>
        <p className="mt-3 text-sm text-muted-foreground">solfa MANUAL APP</p>
      </section>
    </AppShell>
  );
}

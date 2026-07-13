import { createFileRoute, redirect, useNavigate, useRouter } from "@tanstack/react-router";
import { z } from "zod";

import { PasswordGateScreen } from "@/components/auth/PasswordGateScreen";
import { APP_NAME, appPageTitle } from "@/data/app-sections";
import { fetchAuthStatus, loginApp } from "@/lib/auth-functions";

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/login/")({
  validateSearch: loginSearchSchema,
  beforeLoad: async () => {
    const auth = await fetchAuthStatus();
    if (auth.appAuthenticated) {
      throw redirect({ to: "/" });
    }
  },
  head: () => ({ meta: [{ title: appPageTitle("ログイン") }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const search = Route.useSearch();

  return (
    <PasswordGateScreen
      title="アプリ認証"
      description={`${APP_NAME} を閲覧するには共通パスワードを入力してください。`}
      submitLabel="ログイン"
      onSubmit={async (password) => {
        const result = await loginApp({ data: { password } });
        if (result.success) {
          await router.invalidate();
          const target = search.redirect ?? "/";
          if (target.startsWith("/employee-login")) {
            const url = new URL(target, "http://localhost");
            const employeeRedirect = url.searchParams.get("redirect") ?? "/";
            await navigate({ to: "/employee-login", search: { redirect: employeeRedirect } });
          } else {
            await navigate({ to: target });
          }
        }
        return result;
      }}
    />
  );
}

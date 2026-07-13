import { createFileRoute, redirect, useNavigate, useRouter } from "@tanstack/react-router";
import { z } from "zod";

import { PasswordGateScreen } from "@/components/auth/PasswordGateScreen";
import { appPageTitle } from "@/data/app-sections";
import { fetchAuthStatus, loginEmployee } from "@/lib/auth-functions";

const employeeLoginSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/employee-login/")({
  validateSearch: employeeLoginSearchSchema,
  beforeLoad: async ({ search }) => {
    const auth = await fetchAuthStatus();
    if (!auth.appAuthenticated) {
      throw redirect({ to: "/login", search: { redirect: search.redirect ?? "/employee-login" } });
    }
    if (auth.employeeAuthenticated) {
      throw redirect({ to: search.redirect ?? "/" });
    }
  },
  head: () => ({ meta: [{ title: appPageTitle("社員認証") }] }),
  component: EmployeeLoginPage,
});

function EmployeeLoginPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const search = Route.useSearch();

  return (
    <PasswordGateScreen
      title="社員専用認証"
      description="社員専用ページを閲覧するには、社員共通パスワードを入力してください。"
      submitLabel="社員としてログイン"
      onSubmit={async (password) => {
        const result = await loginEmployee({ data: { password } });
        if (result.success) {
          await router.invalidate();
          await navigate({ to: search.redirect ?? "/" });
        }
        return result;
      }}
    />
  );
}

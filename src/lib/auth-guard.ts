import { requiresEmployeeAuth } from "@/lib/employee-access";
import { requireAppAuth, requireEmployeeAuth } from "@/lib/auth.server";

export async function assertEmployeeContentAccess(title: string, category?: string) {
  if (!requiresEmployeeAuth(title, category)) return;
  await requireEmployeeAuth();
}

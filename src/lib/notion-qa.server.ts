import { hasEmployeeAuth } from "@/lib/auth.server";
import { getManualList } from "@/lib/notion-manuals.server";
import { getManualPageContent } from "@/lib/notion.server";
import { extractQaFromBlocks } from "@/lib/qa-extract";
import type { QaItem } from "@/lib/qa-types";

export async function getQaList(): Promise<QaItem[]> {
  const employeeAuthenticated = await hasEmployeeAuth();
  const manuals = await getManualList();
  const grouped = await Promise.all(
    manuals
      .filter((manual) => !manual.employeeOnly || employeeAuthenticated)
      .map(async (manual) => {
        const content = await getManualPageContent(manual.id);
        return extractQaFromBlocks(content.blocks, {
          manualId: manual.id,
          manualTitle: manual.title,
          updatedAt: manual.updatedAt,
        });
      }),
  );

  return grouped.flat();
}

import { sameNotionId } from "@/lib/notion";
import { isEmployeeOnly } from "@/lib/employee-access";
import { getCocktailList } from "@/lib/notion-cocktails.server";
import { getManualList } from "@/lib/notion-manuals.server";
import { getManualPageList } from "@/lib/notion.server";

export type PageAccessMetadata = {
  title: string;
  category?: string;
  employeeOnly: boolean;
};

export async function resolvePageAccessMetadata(pageId: string): Promise<PageAccessMetadata | null> {
  const manuals = await getManualList();
  const manual = manuals.find((item) => sameNotionId(item.id, pageId));
  if (manual) {
    return {
      title: manual.title,
      category: manual.category,
      employeeOnly: manual.employeeOnly,
    };
  }

  const cocktails = await getCocktailList();
  const cocktail = cocktails.find((item) => sameNotionId(item.id, pageId));
  if (cocktail) {
    return {
      title: cocktail.name,
      category: cocktail.category,
      employeeOnly: cocktail.employeeOnly,
    };
  }

  const rootPages = await getManualPageList();
  const rootPage = rootPages.find((item) => sameNotionId(item.id, pageId));
  if (rootPage) {
    return {
      title: rootPage.title,
      employeeOnly: rootPage.employeeOnly,
    };
  }

  return null;
}

export async function resolveOrganizationAccessMetadata(): Promise<PageAccessMetadata> {
  const rootPages = await getManualPageList();
  const orgPage = rootPages.find((page) => page.title === "会社組織図");
  const title = orgPage?.title ?? "会社組織図";
  return {
    title,
    employeeOnly: orgPage?.employeeOnly ?? isEmployeeOnly(title),
  };
}

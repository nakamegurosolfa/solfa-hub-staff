import {
  aboutCategories,
  classifyNotionPageTitle,
  EMPLOYEE_WORK_LABEL,
  sectionLabels,
  shopRulesCategories,
  type AppSectionId,
} from "@/data/app-sections";
import { hasEmployeeAuth } from "@/lib/auth.server";
import { cocktailSearchText } from "@/lib/cocktail-search";
import { manualSearchText } from "@/lib/manual-search";
import { getCocktailList } from "@/lib/notion-cocktails.server";
import { getEmployeeWorkDetail, getEmployeeWorkList } from "@/lib/notion-employee-work.server";
import { getManualDetail, getManualList } from "@/lib/notion-manuals.server";
import { getQaList } from "@/lib/notion-qa.server";
import { getManualPageContent, getManualPageList } from "@/lib/notion.server";
import { makePageId } from "@/lib/page-library";
import { matchesSearchQuery, normalizeSearchText } from "@/lib/search-normalize";

export type SearchHit = {
  id: string;
  title: string;
  subtitle: string;
  to: string;
  params?: Record<string, string>;
  searchText: string;
  employeeOnly?: boolean;
};

export function searchHitRedirectPath(hit: SearchHit) {
  if (hit.to === "/organization") return "/organization";
  if (hit.params?.id) {
    return hit.to.replace("$id", hit.params.id);
  }
  return hit.to;
}

function staticCategoryHits(
  section: AppSectionId,
  to: string,
  categories: { id: string; title: string; description: string }[],
): SearchHit[] {
  return categories.map((category) => ({
    id: makePageId(to, { id: category.id }),
    title: category.title,
    subtitle: sectionLabels[section],
    to,
    params: { id: category.id },
    searchText: `${category.title} ${category.description}`,
  }));
}

export async function buildSearchIndex(): Promise<SearchHit[]> {
  const hits: SearchHit[] = [];
  const employeeAuthenticated = await hasEmployeeAuth();

  const cocktails = await getCocktailList();
  for (const cocktail of cocktails) {
    hits.push({
      id: makePageId("/cocktails/$id", { id: cocktail.id }),
      title: cocktail.name,
      subtitle: sectionLabels.cocktails,
      to: "/cocktails/$id",
      params: { id: cocktail.id },
      employeeOnly: cocktail.employeeOnly,
      searchText: cocktail.employeeOnly && !employeeAuthenticated ? cocktail.name : cocktailSearchText(cocktail),
    });
  }

  const manuals = await getManualList();
  for (const manual of manuals) {
    const includeBody = !manual.employeeOnly || employeeAuthenticated;
    const detail = includeBody ? await getManualDetail(manual.id) : null;
    hits.push({
      id: makePageId("/manuals/$id", { id: manual.id }),
      title: manual.title,
      subtitle: manual.category ? `${sectionLabels.manuals} · ${manual.category}` : sectionLabels.manuals,
      to: "/manuals/$id",
      params: { id: manual.id },
      employeeOnly: manual.employeeOnly,
      searchText: detail ? manualSearchText(manual, detail.blocks) : manual.title,
    });
  }

  const qaItems = await getQaList();
  for (const item of qaItems) {
    hits.push({
      id: `qa:${item.id}`,
      title: item.question,
      subtitle: `Q&A · ${item.category}`,
      to: "/manuals/$id",
      params: { id: item.manualId },
      searchText: [
        item.question,
        item.category,
        manualSearchText({ title: "", searchTags: [] }, item.answerBlocks),
      ]
        .filter(Boolean)
        .join(" "),
    });
  }

  if (employeeAuthenticated) {
    const employeeWorkItems = await getEmployeeWorkList();
    for (const item of employeeWorkItems) {
      const detail = await getEmployeeWorkDetail(item.id);
      hits.push({
        id: makePageId("/employee-work/$id", { id: item.id }),
        title: item.title,
        subtitle: item.category ? `${EMPLOYEE_WORK_LABEL} · ${item.category}` : EMPLOYEE_WORK_LABEL,
        to: "/employee-work/$id",
        params: { id: item.id },
        employeeOnly: true,
        searchText: manualSearchText(item, detail.blocks),
      });
    }
  }

  hits.push(
    ...staticCategoryHits("rules", "/rules/category/$id", shopRulesCategories),
    ...staticCategoryHits("about", "/about/category/$id", aboutCategories),
  );

  const pages = await getManualPageList();

  for (const page of pages) {
    const section = classifyNotionPageTitle(page.title);

    if (section === "manuals") {
      continue;
    }

    const includeBody = !page.employeeOnly || employeeAuthenticated;

    if (section === "organization") {
      const detail = includeBody ? await getManualPageContent(page.id) : null;
      hits.push({
        id: makePageId("/organization"),
        title: detail?.title ?? page.title,
        subtitle: sectionLabels.organization,
        to: "/organization",
        employeeOnly: page.employeeOnly,
        searchText: detail ? manualSearchText({ title: detail.title, searchTags: [] }, detail.blocks) : page.title,
      });
      continue;
    }

    if (section === "about") {
      const detail = includeBody ? await getManualPageContent(page.id) : null;
      hits.push({
        id: makePageId("/about/$id", { id: page.id }),
        title: detail?.title ?? page.title,
        subtitle: sectionLabels.about,
        to: "/about/$id",
        params: { id: page.id },
        employeeOnly: page.employeeOnly,
        searchText: detail ? manualSearchText({ title: detail.title, searchTags: [] }, detail.blocks) : page.title,
      });
    }
  }

  return hits;
}

export function filterSearchIndex(hits: SearchHit[], query: string) {
  const term = normalizeSearchText(query);
  if (!term) return [];

  return hits.filter(
    (hit) =>
      matchesSearchQuery(hit.searchText, term) ||
      matchesSearchQuery(hit.title, term) ||
      matchesSearchQuery(hit.subtitle, term),
  );
}

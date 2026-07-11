import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { assertEmployeeContentAccess } from "@/lib/auth-guard";
import { requireAppAuth, requireEmployeeAuth } from "@/lib/auth.server";
import { getManualPageContent, getManualPagesForSection, getOrganizationPageContent } from "@/lib/notion.server";
import { getCocktailDetail, getCocktailList } from "@/lib/notion-cocktails.server";
import { getEmployeeWorkDetail, getEmployeeWorkList } from "@/lib/notion-employee-work.server";
import { getManualDetail, getManualList } from "@/lib/notion-manuals.server";
import { prepareManualsForIndex, sortManualsByDisplayOrder } from "@/lib/manual-groups";
import { getQaList } from "@/lib/notion-qa.server";
import { resolveOrganizationAccessMetadata, resolvePageAccessMetadata } from "@/lib/page-access";
import { buildSearchIndex } from "@/lib/search-index";
import { buildUpdateHistory } from "@/lib/update-history";

export const fetchPageAccessMetadata = createServerFn({ method: "GET" })
  .validator(z.string().min(1, "pageId is required"))
  .handler(async ({ data: pageId }) => {
    await requireAppAuth();
    return resolvePageAccessMetadata(pageId);
  });

export const fetchOrganizationAccessMetadata = createServerFn({ method: "GET" }).handler(async () => {
  await requireAppAuth();
  return resolveOrganizationAccessMetadata();
});

export const fetchManualIndex = createServerFn({ method: "GET" }).handler(async () => {
  await requireAppAuth();
  const manuals = await getManualList();
  return prepareManualsForIndex(manuals);
});

export const fetchAboutIndex = createServerFn({ method: "GET" }).handler(async () => {
  await requireAppAuth();
  const pages = await getManualPagesForSection("about");
  return { pages };
});

export const fetchManualPage = createServerFn({ method: "GET" })
  .validator(z.string().min(1, "pageId is required"))
  .handler(async ({ data: pageId }) => {
    await requireAppAuth();
    const access = await resolvePageAccessMetadata(pageId);
    if (access) {
      await assertEmployeeContentAccess(access.title, access.category);
    }
    return getManualDetail(pageId);
  });

export const fetchOrganizationPage = createServerFn({ method: "GET" }).handler(async () => {
  await requireAppAuth();
  const access = await resolveOrganizationAccessMetadata();
  await assertEmployeeContentAccess(access.title);
  return getOrganizationPageContent();
});

export const fetchSearchIndex = createServerFn({ method: "GET" }).handler(async () => {
  await requireAppAuth();
  return buildSearchIndex();
});

export const fetchCocktailIndex = createServerFn({ method: "GET" }).handler(async () => {
  await requireAppAuth();
  return getCocktailList();
});

export const fetchCocktailPage = createServerFn({ method: "GET" })
  .validator(z.string().min(1, "pageId is required"))
  .handler(async ({ data: pageId }) => {
    await requireAppAuth();
    const access = await resolvePageAccessMetadata(pageId);
    if (access) {
      await assertEmployeeContentAccess(access.title, access.category);
    }
    return getCocktailDetail(pageId);
  });

export const fetchUpdateHistory = createServerFn({ method: "GET" }).handler(async () => {
  await requireAppAuth();
  return buildUpdateHistory();
});

export const fetchQaIndex = createServerFn({ method: "GET" }).handler(async () => {
  await requireAppAuth();
  return getQaList();
});

export const fetchEmployeeWorkIndex = createServerFn({ method: "GET" }).handler(async () => {
  await requireAppAuth();
  await requireEmployeeAuth();
  const items = await getEmployeeWorkList();
  return sortManualsByDisplayOrder(items);
});

export const fetchEmployeeWorkPage = createServerFn({ method: "GET" })
  .validator(z.string().min(1, "pageId is required"))
  .handler(async ({ data: pageId }) => {
    await requireAppAuth();
    await requireEmployeeAuth();
    return getEmployeeWorkDetail(pageId);
  });

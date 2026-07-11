import { Client, extractNotionId } from "@notionhq/client";

function readToken(): string {
  const token = process.env["NOTION_TOKEN"]?.trim();
  if (!token) {
    throw new Error("NOTION_TOKEN is not set");
  }
  return token;
}

export function readNotionPageId(): string {
  const raw = process.env["NOTION_PAGE_ID"]?.trim();
  if (!raw) {
    throw new Error("NOTION_PAGE_ID is not set");
  }

  const pageId = extractNotionId(raw);
  if (!pageId) {
    throw new Error(`NOTION_PAGE_ID is not a valid Notion page ID: ${raw}`);
  }

  return pageId;
}

export function readNotionCocktailDatabaseId(): string {
  const raw = process.env["NOTION_COCKTAIL_DATABASE_ID"]?.trim();
  if (!raw) {
    throw new Error("NOTION_COCKTAIL_DATABASE_ID is not set");
  }

  const databaseId = extractNotionId(raw);
  if (!databaseId) {
    throw new Error(`NOTION_COCKTAIL_DATABASE_ID is not a valid Notion database ID: ${raw}`);
  }

  return databaseId;
}

export function readNotionManualDatabaseId(): string {
  const raw = process.env["NOTION_MANUAL_DATABASE_ID"]?.trim();
  if (!raw) {
    throw new Error("NOTION_MANUAL_DATABASE_ID is not set");
  }

  const databaseId = extractNotionId(raw);
  if (!databaseId) {
    throw new Error(`NOTION_MANUAL_DATABASE_ID is not a valid Notion database ID: ${raw}`);
  }

  return databaseId;
}

export function readNotionEmployeeWorkDatabaseId(): string {
  const raw = process.env["NOTION_EMPLOYEE_WORK_DATABASE_ID"]?.trim();
  if (!raw) {
    throw new Error("NOTION_EMPLOYEE_WORK_DATABASE_ID is not set");
  }

  const databaseId = extractNotionId(raw);
  if (!databaseId) {
    throw new Error(`NOTION_EMPLOYEE_WORK_DATABASE_ID is not a valid Notion database ID: ${raw}`);
  }

  return databaseId;
}

export function readNotionBlockId(id: string): string {
  const blockId = extractNotionId(id);
  if (!blockId) {
    throw new Error(`Invalid Notion block ID: ${id}`);
  }
  return blockId;
}

export function sameNotionId(a: string, b: string): boolean {
  const left = extractNotionId(a);
  const right = extractNotionId(b);
  return Boolean(left && right && left === right);
}

export function getNotionClient(): Client {
  return new Client({
    auth: readToken(),
  });
}

export async function getNotionPage(pageId?: string) {
  const targetPageId = pageId ? readNotionBlockId(pageId) : readNotionPageId();
  return getNotionClient().pages.retrieve({ page_id: targetPageId });
}

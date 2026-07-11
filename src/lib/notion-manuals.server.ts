import {
  Client,
  collectPaginatedAPI,
  isFullPage,
  type PageObjectResponse,
  type RichTextItemResponse,
} from "@notionhq/client";

import { getNotionClient, readNotionBlockId, readNotionManualDatabaseId } from "@/lib/notion";
import { isEmployeeOnly } from "@/lib/employee-access";
import { getManualPageContent } from "@/lib/notion.server";
import type { ManualDetail, ManualSummary } from "@/lib/notion-types";

function plain(items: RichTextItemResponse[]) {
  return items.map((item) => item.plain_text).join("");
}

function getProperty(props: PageObjectResponse["properties"], names: string[]) {
  for (const name of names) {
    const property = props[name];
    if (property) return property;
  }
  return undefined;
}

function readTitle(props: PageObjectResponse["properties"]) {
  const property = getProperty(props, ["名前", "Name", "title"]);
  if (property?.type === "title") return plain(property.title);
  const firstTitle = Object.values(props).find((value) => value.type === "title");
  return firstTitle?.type === "title" ? plain(firstTitle.title) : "Untitled";
}

function readSelect(props: PageObjectResponse["properties"], names: string[]) {
  const property = getProperty(props, names);
  if (property?.type === "select") return property.select?.name;
  if (property?.type === "status") return property.status?.name;
  return undefined;
}

function readMultiSelect(props: PageObjectResponse["properties"], names: string[]) {
  const property = getProperty(props, names);
  if (property?.type === "multi_select") return property.multi_select.map((item) => item.name);
  return [];
}

function readNumber(props: PageObjectResponse["properties"], names: string[]) {
  const property = getProperty(props, names);
  if (property?.type === "number" && property.number !== null) return property.number;
  return undefined;
}

function readUpdatedAt(props: PageObjectResponse["properties"], fallback: string) {
  const property = getProperty(props, ["更新日", "Updated"]);
  if (property?.type === "date" && property.date?.start) return property.date.start;
  if (property?.type === "last_edited_time") return property.last_edited_time;
  return fallback;
}

function mapManualSummary(page: PageObjectResponse): ManualSummary {
  const props = page.properties;
  const title = readTitle(props);
  const category = readSelect(props, ["カテゴリ", "Category"]);
  const displayOrder = readNumber(props, ["表示順", "Display Order", "Order"]);
  const searchTags = readMultiSelect(props, ["検索タグ", "タグ", "Tags"]);
  const updatedAt = readUpdatedAt(props, page.last_edited_time);

  return {
    id: page.id,
    title,
    category,
    employeeOnly: isEmployeeOnly(title, category),
    displayOrder,
    searchTags,
    updatedAt,
    lastEditedAt: page.last_edited_time,
  };
}

async function getManualDataSourceId(notion: Client) {
  try {
    const databaseId = readNotionManualDatabaseId();
    const database = await notion.databases.retrieve({ database_id: databaseId });
    const dataSourceId = database.data_sources?.[0]?.id;
    if (dataSourceId) return dataSourceId;
  } catch {
    // Fall through to workspace search when the configured database ID is invalid or inaccessible.
  }

  const search = await notion.search({
    query: "業務マニュアル",
    filter: { property: "object", value: "data_source" },
    page_size: 10,
  });

  const match =
    search.results.find(
      (result) => result.object === "data_source" && result.title?.[0]?.plain_text === "業務マニュアル",
    ) ?? search.results.find((result) => result.object === "data_source");

  if (match?.object === "data_source") {
    return match.id;
  }

  throw new Error(
    'Manual database "業務マニュアル" not found. Check NOTION_MANUAL_DATABASE_ID and integration access.',
  );
}

async function queryManualPages(notion: Client) {
  const dataSourceId = await getManualDataSourceId(notion);
  const results = await collectPaginatedAPI(notion.dataSources.query, {
    data_source_id: dataSourceId,
  });

  return results.filter(isFullPage);
}

export async function getManualList(): Promise<ManualSummary[]> {
  const notion = getNotionClient();
  const pages = await queryManualPages(notion);
  return pages.map(mapManualSummary);
}

export async function getManualDetail(pageId: string): Promise<ManualDetail> {
  const notion = getNotionClient();
  const normalizedPageId = readNotionBlockId(pageId);
  const page = await notion.pages.retrieve({ page_id: normalizedPageId });

  if (!("properties" in page) || !isFullPage(page)) {
    throw new Error("Expected a manual page");
  }

  const summary = mapManualSummary(page);
  const content = await getManualPageContent(normalizedPageId);

  return {
    ...summary,
    blocks: content.blocks,
  };
}

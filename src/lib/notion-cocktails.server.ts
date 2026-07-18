import {
  Client,
  collectPaginatedAPI,
  isFullPage,
  type PageObjectResponse,
  type RichTextItemResponse,
} from "@notionhq/client";

import { getNotionClient, readNotionBlockId, readNotionCocktailDatabaseId } from "@/lib/notion";
import { isEmployeeOnly } from "@/lib/employee-access";
import { sortCocktailsForIndex } from "@/lib/cocktail-sort";
import { getManualPageContent } from "@/lib/notion.server";
import type {
  CocktailDetail,
  CocktailPreparationMethod,
  CocktailSummary,
  NotionBlock,
  NotionRichText,
} from "@/lib/notion-types";
import { COCKTAIL_PREPARATION_METHODS } from "@/lib/notion-types";

function plainText(text: string): NotionRichText[] {
  return [{ plain_text: text, annotations: defaultAnnotations() }];
}

function defaultAnnotations() {
  return {
    bold: false,
    italic: false,
    strikethrough: false,
    underline: false,
    code: false,
    color: "default",
  };
}

function parseRecipeTextToBlocks(text: string): NotionBlock[] {
  const blocks: NotionBlock[] = [];

  for (const [index, line] of text.split("\n").entries()) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed === "---") {
      blocks.push({ id: `recipe-divider-${index}`, type: "divider", richText: [] });
      continue;
    }

    if (trimmed.startsWith("# ")) {
      blocks.push({
        id: `recipe-h1-${index}`,
        type: "heading_1",
        richText: plainText(trimmed.slice(2).trim()),
      });
      continue;
    }

    if (trimmed.startsWith("## ")) {
      blocks.push({
        id: `recipe-h2-${index}`,
        type: "heading_2",
        richText: plainText(trimmed.slice(3).trim()),
      });
      continue;
    }

    if (trimmed.startsWith("・") || trimmed.startsWith("- ")) {
      blocks.push({
        id: `recipe-bullet-${index}`,
        type: "bulleted_list_item",
        richText: plainText(trimmed.replace(/^[・-]\s?/, "").trim()),
      });
      continue;
    }

    const numbered = trimmed.match(/^(\d+)[.)]\s*(.+)$/);
    if (numbered) {
      blocks.push({
        id: `recipe-number-${index}`,
        type: "numbered_list_item",
        richText: plainText(numbered[2].trim()),
      });
      continue;
    }

    const circled = trimmed.match(/^[\u2460-\u2473\u3251-\u325F]\s*(.+)$/);
    if (circled) {
      blocks.push({
        id: `recipe-circled-${index}`,
        type: "numbered_list_item",
        richText: plainText(circled[1].trim()),
      });
      continue;
    }

    blocks.push({
      id: `recipe-p-${index}`,
      type: "paragraph",
      richText: plainText(trimmed),
    });
  }

  return blocks;
}

function blockHasVisibleContent(block: NotionBlock): boolean {
  switch (block.type) {
    case "divider":
      return false;
    case "image":
      return Boolean(block.imageUrl);
    case "video":
    case "embed":
      return Boolean(block.mediaUrl);
    case "table":
      return Boolean(block.children?.some((child) => child.type === "table_row" && child.cells?.some((cell) => cell.some((item) => item.plain_text.trim()))));
    case "unsupported":
      return Boolean(block.children?.some(blockHasVisibleContent));
    default: {
      const text = block.richText.map((item) => item.plain_text).join("").trim();
      return text.length > 0;
    }
  }
}

function hasMeaningfulBodyBlocks(blocks: NotionBlock[]): boolean {
  return blocks.some(blockHasVisibleContent);
}

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

function readRichText(props: PageObjectResponse["properties"], names: string[]) {
  const property = getProperty(props, names);
  if (property?.type === "rich_text") return plain(property.rich_text);
  return undefined;
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
  if (property?.type === "number") return property.number ?? undefined;
  return undefined;
}

function readCheckbox(props: PageObjectResponse["properties"], names: string[]) {
  const property = getProperty(props, names);
  if (property?.type === "checkbox") return property.checkbox;
  return false;
}

function readFilesUrl(props: PageObjectResponse["properties"], names: string[]) {
  const property = getProperty(props, names);
  if (property?.type !== "files" || property.files.length === 0) return undefined;
  const file = property.files[0];
  if (file.type === "external") return file.external.url;
  if (file.type === "file") return file.file.url;
  return undefined;
}

function formatPrice(value: number | string | undefined) {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "number") return `¥${value.toLocaleString("ja-JP")}`;
  const trimmed = value.trim();
  if (/^¥/.test(trimmed) || /円$/.test(trimmed)) return trimmed;
  const numeric = Number(trimmed.replace(/[^\d]/g, ""));
  if (!Number.isNaN(numeric) && numeric > 0) return `¥${numeric.toLocaleString("ja-JP")}`;
  return trimmed;
}

function readPrice(props: PageObjectResponse["properties"]) {
  const numberValue = readNumber(props, ["価格", "Price"]);
  if (numberValue !== undefined) return formatPrice(numberValue);
  return formatPrice(readRichText(props, ["価格", "Price"]));
}

function readPreparationMethod(
  props: PageObjectResponse["properties"],
): CocktailPreparationMethod | undefined {
  const value = readSelect(props, ["作り方"]);
  if (!value) return undefined;
  return COCKTAIL_PREPARATION_METHODS.find((method) => method === value);
}

function readCoverImage(page: PageObjectResponse) {
  if (!page.cover) return undefined;
  if (page.cover.type === "external") return page.cover.external.url;
  if (page.cover.type === "file") return page.cover.file.url;
  return undefined;
}

function mapCocktailSummary(page: PageObjectResponse): CocktailSummary {
  const props = page.properties;
  const name = readTitle(props);
  const price = readPrice(props);
  const category = readSelect(props, ["カテゴリ", "Category"]);
  const orderFrequency = readSelect(props, ["注文頻度"]);
  const learningPriority = readSelect(props, ["習得優先度"]);
  const limitedTime = readCheckbox(props, ["期間限定"]);
  const displayOrder = readNumber(props, ["表示順", "Display Order", "Order"]);
  const ingredientTags = readMultiSelect(props, ["材料タグ", "材料", "Ingredients"]);
  const difficulty = readSelect(props, ["難易度", "Difficulty"]) ?? readRichText(props, ["難易度", "Difficulty"]);
  const recommended = readCheckbox(props, ["オススメ", "おすすめ", "Recommended"]);
  const recipeText = readRichText(props, ["レシピ本文", "レシピ", "Recipe"]);

  return {
    id: page.id,
    name,
    imageUrl: readFilesUrl(props, ["画像", "Image"]) ?? readCoverImage(page),
    price,
    category,
    employeeOnly: isEmployeeOnly(name, category),
    orderFrequency,
    learningPriority,
    limitedTime,
    displayOrder,
    ingredientTags,
    glass: readSelect(props, ["グラス", "Glass"]) ?? readRichText(props, ["グラス", "Glass"]),
    ice: readSelect(props, ["氷", "Ice"]) ?? readRichText(props, ["氷", "Ice"]),
    difficulty,
    recommended,
    preparationMethod: readPreparationMethod(props),
    recipeText,
    lastEditedAt: page.last_edited_time,
  };
}

async function getCocktailDataSourceId(notion: Client) {
  try {
    const databaseId = readNotionCocktailDatabaseId();
    const database = await notion.databases.retrieve({ database_id: databaseId });
    const dataSourceId = database.data_sources?.[0]?.id;
    if (dataSourceId) return dataSourceId;
  } catch {
    // Fall through to workspace search when the configured database ID is invalid or inaccessible.
  }

  const search = await notion.search({
    query: "カクテルレシピ",
    filter: { property: "object", value: "data_source" },
    page_size: 10,
  });

  const match =
    search.results.find((result) => result.object === "data_source" && result.title?.[0]?.plain_text === "カクテルレシピ") ??
    search.results.find((result) => result.object === "data_source");

  if (match?.object === "data_source") {
    return match.id;
  }

  throw new Error('Cocktail database "カクテルレシピ" not found. Check NOTION_COCKTAIL_DATABASE_ID and integration access.');
}

async function queryCocktailPages(notion: Client) {
  const dataSourceId = await getCocktailDataSourceId(notion);
  const results = await collectPaginatedAPI(notion.dataSources.query, {
    data_source_id: dataSourceId,
  });

  return results.filter(isFullPage);
}

export async function getCocktailList(): Promise<CocktailSummary[]> {
  const notion = getNotionClient();
  const pages = await queryCocktailPages(notion);
  return sortCocktailsForIndex(pages.map(mapCocktailSummary));
}

export async function getCocktailDetail(pageId: string): Promise<CocktailDetail> {
  const notion = getNotionClient();
  const normalizedPageId = readNotionBlockId(pageId);
  const page = await notion.pages.retrieve({ page_id: normalizedPageId });

  if (!("properties" in page) || !isFullPage(page)) {
    throw new Error("Expected a cocktail page");
  }

  const summary = mapCocktailSummary(page);
  const content = await getManualPageContent(normalizedPageId);
  const propertyBlocks = summary.recipeText ? parseRecipeTextToBlocks(summary.recipeText) : [];
  const blocks = hasMeaningfulBodyBlocks(content.blocks)
    ? content.blocks
    : propertyBlocks.length > 0
      ? propertyBlocks
      : content.blocks;

  return {
    ...summary,
    blocks,
  };
}

export async function getCocktailSummariesByIds(ids: string[]) {
  const cocktails = await getCocktailList();
  const idSet = new Set(ids.map((id) => readNotionBlockId(id)));
  return cocktails.filter((cocktail) => idSet.has(readNotionBlockId(cocktail.id)));
}

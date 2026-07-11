import {
  Client,
  collectPaginatedAPI,
  type BlockObjectResponse,
  type RichTextItemResponse,
} from "@notionhq/client";

import { getNotionClient, readNotionBlockId, readNotionPageId } from "@/lib/notion";
import { classifyNotionPageTitle } from "@/data/app-sections";
import { isEmployeeOnly } from "@/lib/employee-access";
import { isImageUrl, logImageBlockMapping, readMediaUrl, type NotionMediaSource } from "@/lib/notion-media";
import type { ManualPageDetail, ManualPageSummary, ManualRootPage, NotionBlock, NotionRichText } from "@/lib/notion-types";

const MANUAL_ACCENT = "#B58BFF";

function richText(items: RichTextItemResponse[]): NotionRichText[] {
  return items.map((item) => ({
    plain_text: item.plain_text,
    href: item.href,
    annotations: { ...item.annotations },
  }));
}

function plain(items: RichTextItemResponse[]) {
  return items.map((item) => item.plain_text).join("");
}

function mapImageBlock(
  id: string,
  media: NotionMediaSource,
  captionFallback?: string,
): NotionBlock {
  logImageBlockMapping(id, media);

  const imageUrl = readMediaUrl(media);
  const imageSourceType = media.type === "external" ? "external" : media.type === "file" ? "file" : undefined;

  return {
    id,
    type: "image",
    richText: [],
    imageUrl,
    imageSourceType,
    imageCaption: plain(media.caption ?? []) || captionFallback,
  };
}

function emojiForTitle(title: string) {
  if (title.includes("組織")) return "👥";
  if (title.includes("出勤") || title.includes("退勤")) return "🕐";
  if (title.includes("買い出し")) return "🛒";
  if (title.includes("エントランス")) return "🚪";
  if (title.includes("バー")) return "🍸";
  if (title.includes("掃除") || title.includes("片付け")) return "🧹";
  if (title.includes("電源")) return "⚡";
  if (title.includes("出禁")) return "🚫";
  if (title.includes("警察")) return "🚨";
  if (title.includes("写真")) return "📷";
  if (title.includes("はじめに")) return "📖";
  return "📄";
}

async function listAllBlocks(notion: Client, blockId: string) {
  const normalizedBlockId = readNotionBlockId(blockId);
  return collectPaginatedAPI(notion.blocks.children.list, {
    block_id: normalizedBlockId,
  }) as Promise<BlockObjectResponse[]>;
}

function mapBlock(block: BlockObjectResponse): NotionBlock | null {
  switch (block.type) {
    case "heading_1":
      return { id: block.id, type: "heading_1", richText: richText(block.heading_1.rich_text) };
    case "heading_2":
      return { id: block.id, type: "heading_2", richText: richText(block.heading_2.rich_text) };
    case "heading_3":
      return { id: block.id, type: "heading_3", richText: richText(block.heading_3.rich_text) };
    case "paragraph":
      return { id: block.id, type: "paragraph", richText: richText(block.paragraph.rich_text) };
    case "bulleted_list_item":
      return {
        id: block.id,
        type: "bulleted_list_item",
        richText: richText(block.bulleted_list_item.rich_text),
      };
    case "numbered_list_item":
      return {
        id: block.id,
        type: "numbered_list_item",
        richText: richText(block.numbered_list_item.rich_text),
      };
    case "quote":
      return { id: block.id, type: "quote", richText: richText(block.quote.rich_text) };
    case "callout":
      return {
        id: block.id,
        type: "callout",
        richText: richText(block.callout.rich_text),
        icon: block.callout.icon?.type === "emoji" ? block.callout.icon.emoji : "💡",
      };
    case "divider":
      return { id: block.id, type: "divider", richText: [] };
    case "toggle":
      return { id: block.id, type: "toggle", richText: richText(block.toggle.rich_text) };
    case "image":
      return mapImageBlock(block.id, block.image);
    case "video": {
      const source = readMediaUrl(block.video);
      return {
        id: block.id,
        type: "video",
        richText: richText(block.video.caption ?? []),
        mediaUrl: source,
        mediaCaption: plain(block.video.caption ?? []),
      };
    }
    case "embed":
      return {
        id: block.id,
        type: "embed",
        richText: richText(block.embed.caption ?? []),
        mediaUrl: block.embed.url,
        mediaCaption: plain(block.embed.caption ?? []),
      };
    case "file": {
      const source = readMediaUrl(block.file);
      const caption = plain(block.file.caption);
      const name = "name" in block.file ? block.file.name : undefined;

      if (source && isImageUrl(source)) {
        return mapImageBlock(block.id, block.file, caption || name);
      }

      return { id: block.id, type: "unsupported", richText: [] };
    }
    case "column_list":
    case "column":
      return { id: block.id, type: "unsupported", richText: [] };
    case "table":
      return {
        id: block.id,
        type: "table",
        richText: [],
        tableWidth: block.table.table_width,
        hasColumnHeader: block.table.has_column_header,
        hasRowHeader: block.table.has_row_header,
      };
    case "table_row":
      return {
        id: block.id,
        type: "table_row",
        richText: [],
        cells: block.table_row.cells.map((cell) => richText(cell)),
      };
    case "bookmark":
      return {
        id: block.id,
        type: "bookmark",
        richText: richText(block.bookmark.caption),
        bookmarkUrl: block.bookmark.url,
      };
    default:
      return { id: block.id, type: "unsupported", richText: [] };
  }
}

async function mapBlocksWithChildren(
  notion: Client,
  blocks: BlockObjectResponse[],
): Promise<NotionBlock[]> {
  const mapped: NotionBlock[] = [];

  for (const block of blocks) {
    const mappedBlock = mapBlock(block);
    if (!mappedBlock) continue;

    if ("has_children" in block && block.has_children && block.type !== "child_page") {
      const children = await listAllBlocks(notion, block.id);
      mappedBlock.children = (await mapBlocksWithChildren(notion, children)).filter(Boolean);
    }

    mapped.push(mappedBlock);
  }

  return mapped;
}

export async function getNotionRootPage(): Promise<ManualRootPage> {
  const notion = getNotionClient();
  const pageId = readNotionPageId();
  const page = await notion.pages.retrieve({ page_id: pageId });

  if (!("properties" in page)) {
    throw new Error("Expected a Notion page");
  }

  const titleProp = page.properties.title ?? page.properties.Name;
  const title =
    titleProp?.type === "title" ? plain(titleProp.title) : titleProp?.type === "rich_text" ? plain(titleProp.rich_text) : "Manual";

  return { id: page.id, title };
}

export async function getManualPageList(): Promise<ManualPageSummary[]> {
  const notion = getNotionClient();
  const blocks = await listAllBlocks(notion, readNotionPageId());

  return blocks
    .filter((block): block is BlockObjectResponse & { type: "child_page" } => block.type === "child_page")
    .map((block) => {
      const title = block.child_page.title;
      return {
        id: block.id,
        title,
        description: "タップして内容を確認",
        emoji: emojiForTitle(title),
        color: MANUAL_ACCENT,
        employeeOnly: isEmployeeOnly(title),
        lastEditedAt: block.last_edited_time,
      };
    });
}

export async function getManualPagesForSection(section: "manuals" | "about"): Promise<ManualPageSummary[]> {
  const pages = await getManualPageList();
  return pages.filter((page) => classifyNotionPageTitle(page.title) === section);
}

export async function getOrganizationPageContent(): Promise<ManualPageDetail> {
  const pages = await getManualPageList();
  const orgPage = pages.find((page) => page.title === "会社組織図");
  if (!orgPage) {
    throw new Error('Notion page "会社組織図" not found');
  }

  return getManualPageContent(orgPage.id);
}

export async function getManualPageContent(pageId: string): Promise<ManualPageDetail> {
  if (!pageId?.trim()) {
    throw new Error("pageId is required");
  }

  const notion = getNotionClient();
  const normalizedPageId = readNotionBlockId(pageId);
  const page = await notion.pages.retrieve({ page_id: normalizedPageId });

  if (!("properties" in page)) {
    throw new Error("Expected a Notion page");
  }

  const titleProp = page.properties.title ?? page.properties.Name;
  const title =
    titleProp?.type === "title" ? plain(titleProp.title) : titleProp?.type === "rich_text" ? plain(titleProp.rich_text) : "Manual";

  const blocks = await listAllBlocks(notion, normalizedPageId);
  const contentBlocks = blocks.filter((block) => block.type !== "child_page" && block.type !== "child_database");

  return {
    id: page.id,
    title,
    blocks: await mapBlocksWithChildren(notion, contentBlocks),
    lastEditedAt: page.last_edited_time,
  };
}

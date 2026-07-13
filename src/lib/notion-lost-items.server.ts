import {
  Client,
  collectPaginatedAPI,
  isFullPage,
  type PageObjectResponse,
  type RichTextItemResponse,
} from "@notionhq/client";

import { calculateStorageDeadline } from "@/lib/lost-items-storage";
import {
  LOST_ITEM_DISPOSAL_DONE,
  LOST_ITEM_DISPOSAL_PENDING,
  LOST_ITEM_HANDOVER_DONE,
  LOST_ITEM_HANDOVER_PENDING,
  LOST_ITEM_PROPERTY_NAMES,
  type LostItem,
  type LostItemDisposalStatus,
  type LostItemHandoverStatus,
  type LostItemInput,
  type LostItemPhoto,
  type LostItemPhotoPayload,
} from "@/lib/lost-items-types";
import { getNotionClient, readNotionBlockId, readNotionLostItemsDatabaseId } from "@/lib/notion";

function plain(items: RichTextItemResponse[]): string {
  return items.map((item) => item.plain_text).join("");
}

function getProperty(props: PageObjectResponse["properties"], name: string) {
  return props[name];
}

function readTitle(props: PageObjectResponse["properties"]): string {
  const property = getProperty(props, LOST_ITEM_PROPERTY_NAMES.name);
  if (property?.type === "title") return plain(property.title);
  return "";
}

function readRichText(props: PageObjectResponse["properties"], name: string): string {
  const property = getProperty(props, name);
  if (property?.type === "rich_text") return plain(property.rich_text);
  return "";
}

function readDate(props: PageObjectResponse["properties"], name: string): string | null {
  const property = getProperty(props, name);
  if (property?.type !== "date" || !property.date?.start) return null;
  return property.date.start.slice(0, 10);
}

function readPhone(props: PageObjectResponse["properties"], name: string): string {
  const property = getProperty(props, name);
  if (property?.type === "phone_number" && property.phone_number) return property.phone_number;
  return "";
}

function readSelect(props: PageObjectResponse["properties"], name: string): string | undefined {
  const property = getProperty(props, name);
  if (property?.type === "select") return property.select?.name;
  if (property?.type === "status") return property.status?.name;
  return undefined;
}

function readPhoto(props: PageObjectResponse["properties"]): LostItemPhoto | null {
  const property = getProperty(props, LOST_ITEM_PROPERTY_NAMES.photo);
  if (property?.type !== "files" || property.files.length === 0) return null;
  const file = property.files[0];
  if (file.type === "external") {
    return { url: file.external.url, name: file.name };
  }
  if (file.type === "file") {
    return { url: file.file.url, name: file.name };
  }
  return null;
}

function richTextValue(value: string) {
  if (!value.trim()) return [];
  return [
    {
      type: "text" as const,
      text: { content: value },
    },
  ];
}

function buildHandoverStatus(value: string | undefined): LostItemHandoverStatus {
  return value === LOST_ITEM_HANDOVER_DONE ? LOST_ITEM_HANDOVER_DONE : LOST_ITEM_HANDOVER_PENDING;
}

function buildDisposalStatus(value: string | undefined): LostItemDisposalStatus {
  return value === LOST_ITEM_DISPOSAL_DONE ? LOST_ITEM_DISPOSAL_DONE : LOST_ITEM_DISPOSAL_PENDING;
}

function mapLostItemPage(page: PageObjectResponse): LostItem {
  const props = page.properties;
  const foundDate = readDate(props, LOST_ITEM_PROPERTY_NAMES.foundDate) ?? "";
  return {
    id: page.id,
    name: readTitle(props),
    foundDate,
    foundLocation: readRichText(props, LOST_ITEM_PROPERTY_NAMES.foundLocation),
    features: readRichText(props, LOST_ITEM_PROPERTY_NAMES.features),
    foundByStaff: readRichText(props, LOST_ITEM_PROPERTY_NAMES.foundByStaff),
    photo: readPhoto(props),
    inquiryName: readRichText(props, LOST_ITEM_PROPERTY_NAMES.inquiryName),
    inquiryPhone: readPhone(props, LOST_ITEM_PROPERTY_NAMES.inquiryPhone),
    handoverStatus: buildHandoverStatus(readSelect(props, LOST_ITEM_PROPERTY_NAMES.handoverStatus)),
    handoverDate: readDate(props, LOST_ITEM_PROPERTY_NAMES.handoverDate),
    handoverStaff: readRichText(props, LOST_ITEM_PROPERTY_NAMES.handoverStaff),
    disposalStatus: buildDisposalStatus(readSelect(props, LOST_ITEM_PROPERTY_NAMES.disposalStatus)),
    storageDeadline: foundDate ? calculateStorageDeadline(foundDate) : "",
    createdAt: page.created_time,
    updatedAt: page.last_edited_time,
  };
}

async function getLostItemsDataSourceId(notion: Client): Promise<string> {
  const databaseId = readNotionLostItemsDatabaseId();
  const database = await notion.databases.retrieve({ database_id: databaseId });
  const dataSourceId = database.data_sources?.[0]?.id;
  if (!dataSourceId) {
    throw new Error("Lost items database data source was not found.");
  }
  return dataSourceId;
}

async function uploadLostItemPhoto(
  notion: Client,
  photo: LostItemPhotoPayload,
): Promise<string | null> {
  if (!photo) return null;

  const binary = Buffer.from(photo.dataBase64, "base64");
  const fileData = new File([binary], photo.filename, { type: photo.mimeType });
  const upload = await notion.fileUploads.create({
    mode: "single_part",
    filename: photo.filename,
    content_type: photo.mimeType,
  });

  await notion.fileUploads.send({
    file_upload_id: upload.id,
    file: {
      data: fileData,
      filename: photo.filename,
    },
  });

  return upload.id;
}

function buildPhotoProperty(fileUploadId: string | null, filename?: string) {
  if (!fileUploadId) {
    return { files: [] };
  }
  return {
    files: [
      {
        type: "file_upload" as const,
        file_upload: { id: fileUploadId },
        name: filename ?? "lost-item-photo",
      },
    ],
  };
}

async function buildLostItemProperties(
  notion: Client,
  input: LostItemInput,
  options?: { includePhoto?: boolean },
) {
  const includePhoto = options?.includePhoto ?? true;
  let photoProperty: { files: [] } | ReturnType<typeof buildPhotoProperty> = { files: [] };

  if (includePhoto) {
    if (input.removePhoto) {
      photoProperty = { files: [] };
    } else if (input.photo) {
      const fileUploadId = await uploadLostItemPhoto(notion, input.photo);
      photoProperty = buildPhotoProperty(fileUploadId, input.photo.filename);
    }
  }

  return {
    [LOST_ITEM_PROPERTY_NAMES.name]: {
      title: richTextValue(input.name),
    },
    [LOST_ITEM_PROPERTY_NAMES.foundDate]: {
      date: input.foundDate ? { start: input.foundDate } : null,
    },
    [LOST_ITEM_PROPERTY_NAMES.foundLocation]: {
      rich_text: richTextValue(input.foundLocation),
    },
    [LOST_ITEM_PROPERTY_NAMES.features]: {
      rich_text: richTextValue(input.features),
    },
    [LOST_ITEM_PROPERTY_NAMES.foundByStaff]: {
      rich_text: richTextValue(input.foundByStaff),
    },
    [LOST_ITEM_PROPERTY_NAMES.inquiryName]: {
      rich_text: richTextValue(input.inquiryName),
    },
    [LOST_ITEM_PROPERTY_NAMES.inquiryPhone]: {
      phone_number: input.inquiryPhone || null,
    },
    [LOST_ITEM_PROPERTY_NAMES.handoverStatus]: {
      select: { name: input.handoverStatus },
    },
    [LOST_ITEM_PROPERTY_NAMES.handoverDate]: {
      date:
        input.handoverStatus === LOST_ITEM_HANDOVER_DONE && input.handoverDate
          ? { start: input.handoverDate }
          : null,
    },
    [LOST_ITEM_PROPERTY_NAMES.handoverStaff]: {
      rich_text:
        input.handoverStatus === LOST_ITEM_HANDOVER_DONE ? richTextValue(input.handoverStaff) : [],
    },
    [LOST_ITEM_PROPERTY_NAMES.disposalStatus]: {
      select: { name: input.disposalStatus },
    },
    ...(includePhoto ? { [LOST_ITEM_PROPERTY_NAMES.photo]: photoProperty } : {}),
  };
}

export async function listLostItemsFromNotion(): Promise<LostItem[]> {
  const notion = getNotionClient();
  const dataSourceId = await getLostItemsDataSourceId(notion);
  const results = await collectPaginatedAPI(notion.dataSources.query, {
    data_source_id: dataSourceId,
    sorts: [{ property: LOST_ITEM_PROPERTY_NAMES.foundDate, direction: "descending" }],
  });

  return results.filter(isFullPage).map(mapLostItemPage);
}

export async function getLostItemFromNotion(itemId: string): Promise<LostItem | null> {
  const notion = getNotionClient();
  const page = await notion.pages.retrieve({ page_id: readNotionBlockId(itemId) });
  if (!("properties" in page) || !isFullPage(page) || page.archived) {
    return null;
  }
  return mapLostItemPage(page);
}

export async function createLostItemInNotion(input: LostItemInput): Promise<LostItem> {
  const notion = getNotionClient();
  const databaseId = readNotionLostItemsDatabaseId();
  const properties = await buildLostItemProperties(notion, input, { includePhoto: true });
  const page = await notion.pages.create({
    parent: { database_id: databaseId },
    properties,
  });

  if (!("properties" in page) || !isFullPage(page)) {
    throw new Error("Failed to create lost item page.");
  }

  return mapLostItemPage(page);
}

export async function updateLostItemInNotion(
  itemId: string,
  input: LostItemInput,
): Promise<LostItem> {
  const notion = getNotionClient();
  const properties = await buildLostItemProperties(notion, input, {
    includePhoto: Boolean(input.photo || input.removePhoto),
  });
  const page = await notion.pages.update({
    page_id: readNotionBlockId(itemId),
    properties,
  });

  if (!("properties" in page) || !isFullPage(page)) {
    throw new Error("Failed to update lost item page.");
  }

  return mapLostItemPage(page);
}

export async function deleteLostItemFromNotion(itemId: string): Promise<void> {
  const notion = getNotionClient();
  await notion.pages.update({
    page_id: readNotionBlockId(itemId),
    archived: true,
  });
}

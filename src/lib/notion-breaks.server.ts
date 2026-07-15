import {
  Client,
  collectPaginatedAPI,
  isFullPage,
  type PageObjectResponse,
  type RichTextItemResponse,
} from "@notionhq/client";

import {
  BREAK_PROPERTY_NAMES,
  BREAK_SLOT_PROPERTY_KEYS,
  type BreakEntry,
  type BreakStaffInput,
  type BreakStaffMember,
  type BreakStaffUpdateInput,
  type RequiredBreakMinutes,
  createEmptyBreakEntries,
} from "@/lib/breaks-types";
import { getShortageMinutes, getTotalCompletedMinutes } from "@/lib/break-time";
import { getNotionClient, readNotionBlockId, readNotionBreaksDatabaseId } from "@/lib/notion";

function plain(items: RichTextItemResponse[]): string {
  return items.map((item) => item.plain_text).join("");
}

function getProperty(props: PageObjectResponse["properties"], name: string) {
  return props[name];
}

function readRichText(props: PageObjectResponse["properties"], name: string): string {
  const property = getProperty(props, name);
  if (property?.type === "rich_text") return plain(property.rich_text);
  return "";
}

function readTitle(props: PageObjectResponse["properties"], name: string): string {
  const property = getProperty(props, name);
  if (property?.type === "title") return plain(property.title);
  return "";
}

function readStaffName(props: PageObjectResponse["properties"]): string {
  const staffName = readRichText(props, BREAK_PROPERTY_NAMES.staffName);
  if (staffName) return staffName;
  return readTitle(props, BREAK_PROPERTY_NAMES.recordName);
}

function readDate(props: PageObjectResponse["properties"], name: string): string | null {
  const property = getProperty(props, name);
  if (property?.type !== "date" || !property.date?.start) return null;
  return property.date.start.slice(0, 10);
}

function readNumber(props: PageObjectResponse["properties"], name: string): number {
  const property = getProperty(props, name);
  if (property?.type === "number" && typeof property.number === "number") {
    return property.number;
  }
  return 0;
}

function readRequiredMinutes(props: PageObjectResponse["properties"]): RequiredBreakMinutes {
  const property = getProperty(props, BREAK_PROPERTY_NAMES.requiredMinutes);
  const raw = property?.type === "select" ? property.select?.name : undefined;
  if (raw === "60") return 60;
  return 45;
}

function readBreaks(props: PageObjectResponse["properties"]): BreakEntry[] {
  return BREAK_SLOT_PROPERTY_KEYS.map(({ start, end }) => ({
    startAt: readRichText(props, start) || null,
    endAt: readRichText(props, end) || null,
  }));
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

function mapBreakStaffPage(page: PageObjectResponse): BreakStaffMember {
  const props = page.properties;
  const breaks = readBreaks(props);
  const requiredMinutes = readRequiredMinutes(props);
  const completedMinutes = readNumber(props, BREAK_PROPERTY_NAMES.completedMinutes);
  const shortageMinutes = readNumber(props, BREAK_PROPERTY_NAMES.shortageMinutes);

  return {
    id: page.id,
    name: readStaffName(props),
    businessDate: readDate(props, BREAK_PROPERTY_NAMES.businessDate) ?? "",
    requiredMinutes,
    breaks,
    completedMinutes,
    shortageMinutes,
    createdAt: page.created_time,
    updatedAt: page.last_edited_time,
  };
}

function sortStaffByName(staff: BreakStaffMember[]): BreakStaffMember[] {
  return [...staff].sort((left, right) => left.name.localeCompare(right.name, "ja"));
}

async function getBreaksDataSourceId(notion: Client): Promise<string> {
  const databaseId = readNotionBreaksDatabaseId();
  const database = await notion.databases.retrieve({ database_id: databaseId });
  const dataSourceId = database.data_sources?.[0]?.id;
  if (!dataSourceId) {
    throw new Error("Breaks database data source was not found.");
  }
  return dataSourceId;
}

function buildBreakProperties(
  input: {
    name: string;
    businessDate: string;
    requiredMinutes: RequiredBreakMinutes;
    breaks: BreakEntry[];
  },
  totals?: { completedMinutes: number; shortageMinutes: number },
) {
  const completedMinutes = totals?.completedMinutes ?? getTotalCompletedMinutes(input.breaks);
  const shortageMinutes =
    totals?.shortageMinutes ?? getShortageMinutes(input.requiredMinutes, input.breaks);

  const properties: Record<string, unknown> = {
    [BREAK_PROPERTY_NAMES.recordName]: {
      title: richTextValue(input.name),
    },
    [BREAK_PROPERTY_NAMES.staffName]: {
      rich_text: richTextValue(input.name),
    },
    [BREAK_PROPERTY_NAMES.businessDate]: {
      date: { start: input.businessDate },
    },
    [BREAK_PROPERTY_NAMES.requiredMinutes]: {
      select: { name: String(input.requiredMinutes) },
    },
    [BREAK_PROPERTY_NAMES.completedMinutes]: {
      number: completedMinutes,
    },
    [BREAK_PROPERTY_NAMES.shortageMinutes]: {
      number: shortageMinutes,
    },
  };

  for (let index = 0; index < BREAK_SLOT_PROPERTY_KEYS.length; index += 1) {
    const keys = BREAK_SLOT_PROPERTY_KEYS[index];
    const entry = input.breaks[index] ?? { startAt: null, endAt: null };
    properties[keys.start] = { rich_text: richTextValue(entry.startAt ?? "") };
    properties[keys.end] = { rich_text: richTextValue(entry.endAt ?? "") };
  }

  return properties;
}

async function findBreakStaffPage(
  notion: Client,
  businessDate: string,
  staffName: string,
): Promise<PageObjectResponse | null> {
  const dataSourceId = await getBreaksDataSourceId(notion);
  const results = await collectPaginatedAPI(notion.dataSources.query, {
    data_source_id: dataSourceId,
    filter: {
      and: [
        {
          property: BREAK_PROPERTY_NAMES.businessDate,
          date: { equals: businessDate },
        },
        {
          property: BREAK_PROPERTY_NAMES.staffName,
          rich_text: { equals: staffName },
        },
      ],
    },
    page_size: 1,
  });

  const page = results.find(isFullPage);
  return page && !page.archived ? page : null;
}

export async function listBreakStaffFromNotion(businessDate: string): Promise<BreakStaffMember[]> {
  const notion = getNotionClient();
  const dataSourceId = await getBreaksDataSourceId(notion);
  const results = await collectPaginatedAPI(notion.dataSources.query, {
    data_source_id: dataSourceId,
    filter: {
      property: BREAK_PROPERTY_NAMES.businessDate,
      date: { equals: businessDate },
    },
  });

  const staff = results
    .filter(isFullPage)
    .filter((page) => !page.archived)
    .map(mapBreakStaffPage);

  return sortStaffByName(staff);
}

export async function getBreakStaffFromNotion(staffId: string): Promise<BreakStaffMember | null> {
  const notion = getNotionClient();
  const page = await notion.pages.retrieve({ page_id: readNotionBlockId(staffId) });
  if (!("properties" in page) || !isFullPage(page) || page.archived) {
    return null;
  }
  return mapBreakStaffPage(page);
}

export async function createBreakStaffInNotion(input: BreakStaffInput): Promise<BreakStaffMember> {
  const notion = getNotionClient();
  const trimmedName = input.name.trim();
  if (!trimmedName) {
    throw new Error("スタッフ名を入力してください。");
  }

  const existing = await findBreakStaffPage(notion, input.businessDate, trimmedName);
  if (existing) {
    throw new Error("同じ営業日に同じスタッフ名が既に登録されています。");
  }

  const databaseId = readNotionBreaksDatabaseId();
  const breaks = createEmptyBreakEntries();
  const properties = buildBreakProperties({
    name: trimmedName,
    businessDate: input.businessDate,
    requiredMinutes: input.requiredMinutes,
    breaks,
  });

  const page = await notion.pages.create({
    parent: { database_id: databaseId },
    properties: properties as PageObjectResponse["properties"],
  });

  if (!("properties" in page) || !isFullPage(page)) {
    throw new Error("Failed to create break staff page.");
  }

  return mapBreakStaffPage(page);
}

export async function updateBreakStaffInNotion(
  staffId: string,
  input: BreakStaffUpdateInput,
): Promise<BreakStaffMember> {
  const notion = getNotionClient();
  const current = await getBreakStaffFromNotion(staffId);
  if (!current) {
    throw new Error("スタッフが見つかりませんでした。");
  }

  const properties = buildBreakProperties({
    name: current.name,
    businessDate: current.businessDate,
    requiredMinutes: current.requiredMinutes,
    breaks: input.breaks,
  });

  const page = await notion.pages.update({
    page_id: readNotionBlockId(staffId),
    properties: properties as PageObjectResponse["properties"],
  });

  if (!("properties" in page) || !isFullPage(page)) {
    throw new Error("Failed to update break staff page.");
  }

  return mapBreakStaffPage(page);
}

export async function deleteBreakStaffFromNotion(staffId: string): Promise<void> {
  const notion = getNotionClient();
  await notion.pages.update({
    page_id: readNotionBlockId(staffId),
    archived: true,
  });
}

export async function archiveBreakBusinessDayInNotion(businessDate: string): Promise<void> {
  const staff = await listBreakStaffFromNotion(businessDate);
  const notion = getNotionClient();

  for (const member of staff) {
    await notion.pages.update({
      page_id: readNotionBlockId(member.id),
      archived: true,
    });
  }
}

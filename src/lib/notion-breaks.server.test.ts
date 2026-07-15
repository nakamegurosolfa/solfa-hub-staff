import { afterAll, describe, expect, it } from "vitest";

import {
  createBreakStaffInNotion,
  deleteBreakStaffFromNotion,
  getBreakStaffFromNotion,
  listBreakStaffFromNotion,
  updateBreakStaffInNotion,
} from "@/lib/notion-breaks.server";
import { formatTokyoDateKey } from "@/lib/tokyo-time";

const hasBreaksDb = Boolean(process.env.NOTION_BREAKS_DATABASE_ID?.trim());
const testDate = formatTokyoDateKey(new Date());
const testName = `動作確認テスト_${Date.now()}`;

describe.skipIf(!hasBreaksDb)("notion breaks integration", () => {
  let createdId: string | null = null;

  afterAll(async () => {
    if (createdId) {
      await deleteBreakStaffFromNotion(createdId);
    }
  });

  it("creates, lists, updates, and archives a staff record", async () => {
    const created = await createBreakStaffInNotion({
      businessDate: testDate,
      name: testName,
      requiredMinutes: 45,
    });
    createdId = created.id;

    expect(created.name).toBe(testName);
    expect(created.requiredMinutes).toBe(45);
    expect(created.completedMinutes).toBe(0);
    expect(created.shortageMinutes).toBe(45);

    const list = await listBreakStaffFromNotion(testDate);
    expect(list.some((item) => item.id === created.id)).toBe(true);

    const fetched = await getBreakStaffFromNotion(created.id);
    expect(fetched?.name).toBe(testName);

    const updated = await updateBreakStaffInNotion(created.id, {
      breaks: [
        { startAt: "23:30", endAt: "00:15" },
        { startAt: null, endAt: null },
        { startAt: null, endAt: null },
        { startAt: null, endAt: null },
      ],
    });

    expect(updated.completedMinutes).toBe(45);
    expect(updated.shortageMinutes).toBe(0);

    await deleteBreakStaffFromNotion(created.id);
    createdId = null;

    const listAfter = await listBreakStaffFromNotion(testDate);
    expect(listAfter.some((item) => item.id === created.id)).toBe(false);
  }, 30_000);
});

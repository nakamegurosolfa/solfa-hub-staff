import { describe, expect, it } from "vitest";

import {
  calculateStorageDeadline,
  canDeleteLostItem,
  diffTokyoDateKeys,
  filterLostItems,
  formatStorageDeadlineLabel,
  isStorageOverdue,
  shouldShowDeadlineWarning,
} from "@/lib/lost-items-storage";
import {
  LOST_ITEM_DISPOSAL_DONE,
  LOST_ITEM_DISPOSAL_PENDING,
  LOST_ITEM_HANDOVER_DONE,
  LOST_ITEM_HANDOVER_PENDING,
  type LostItem,
} from "@/lib/lost-items-types";

function makeItem(overrides: Partial<LostItem> = {}): LostItem {
  return {
    id: "test-id",
    name: "傘",
    foundDate: "2026-07-01",
    foundLocation: "カウンター",
    features: "",
    foundByStaff: "田中",
    photo: null,
    inquiryName: "",
    inquiryPhone: "",
    handoverStatus: LOST_ITEM_HANDOVER_PENDING,
    handoverDate: null,
    handoverStaff: "",
    disposalStatus: LOST_ITEM_DISPOSAL_PENDING,
    storageDeadline: calculateStorageDeadline("2026-07-01"),
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("lost items storage deadline", () => {
  it("calculates storage deadline as found date + 14 days", () => {
    expect(calculateStorageDeadline("2026-07-01")).toBe("2026-07-15");
  });

  it("formats remaining days until deadline", () => {
    const item = makeItem({ storageDeadline: "2026-07-15" });
    expect(formatStorageDeadlineLabel(item, "2026-07-10")).toEqual({
      text: "残り5日",
      tone: "normal",
    });
  });

  it("shows today label on deadline day", () => {
    const item = makeItem({ storageDeadline: "2026-07-15" });
    expect(formatStorageDeadlineLabel(item, "2026-07-15")).toEqual({
      text: "本日期限",
      tone: "today",
    });
  });

  it("shows overdue label after deadline", () => {
    const item = makeItem({ storageDeadline: "2026-07-15" });
    expect(formatStorageDeadlineLabel(item, "2026-07-17")).toEqual({
      text: "期限超過2日",
      tone: "overdue",
    });
    expect(isStorageOverdue(item, "2026-07-17")).toBe(true);
  });

  it("hides deadline warning when handed over or disposed", () => {
    expect(
      shouldShowDeadlineWarning(
        makeItem({ handoverStatus: LOST_ITEM_HANDOVER_DONE }),
      ),
    ).toBe(false);
    expect(
      shouldShowDeadlineWarning(
        makeItem({ disposalStatus: LOST_ITEM_DISPOSAL_DONE }),
      ),
    ).toBe(false);
    expect(formatStorageDeadlineLabel(makeItem({ handoverStatus: LOST_ITEM_HANDOVER_DONE }), "2026-07-17")).toBeNull();
  });
});

describe("lost items delete rules", () => {
  it("allows delete only when handed over or disposed", () => {
    expect(canDeleteLostItem(makeItem())).toBe(false);
    expect(canDeleteLostItem(makeItem({ handoverStatus: LOST_ITEM_HANDOVER_DONE }))).toBe(true);
    expect(canDeleteLostItem(makeItem({ disposalStatus: LOST_ITEM_DISPOSAL_DONE }))).toBe(true);
  });
});

describe("lost items filters", () => {
  const items = [
    makeItem({ id: "1", handoverStatus: LOST_ITEM_HANDOVER_PENDING, disposalStatus: LOST_ITEM_DISPOSAL_PENDING, storageDeadline: "2026-07-10" }),
    makeItem({ id: "2", handoverStatus: LOST_ITEM_HANDOVER_DONE }),
    makeItem({ id: "3", handoverStatus: LOST_ITEM_HANDOVER_DONE, disposalStatus: LOST_ITEM_DISPOSAL_DONE }),
  ];

  it("filters pending handover items", () => {
    expect(filterLostItems(items, "pending-handover", "2026-07-14").map((item) => item.id)).toEqual(["1"]);
  });

  it("filters overdue items", () => {
    expect(filterLostItems(items, "overdue", "2026-07-14").map((item) => item.id)).toEqual(["1"]);
  });

  it("allows empty inquiry fields", () => {
    const item = makeItem({ inquiryName: "", inquiryPhone: "" });
    expect(item.inquiryName).toBe("");
    expect(item.inquiryPhone).toBe("");
    expect(diffTokyoDateKeys(item.storageDeadline, item.foundDate)).toBe(14);
  });
});

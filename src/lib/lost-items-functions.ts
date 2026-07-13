import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { canDeleteLostItem } from "@/lib/lost-items-storage";
import {
  LOST_ITEM_DISPOSAL_DONE,
  LOST_ITEM_DISPOSAL_PENDING,
  LOST_ITEM_HANDOVER_DONE,
  LOST_ITEM_HANDOVER_PENDING,
} from "@/lib/lost-items-types";
import {
  createLostItemInNotion,
  deleteLostItemFromNotion,
  getLostItemFromNotion,
  listLostItemsFromNotion,
  updateLostItemInNotion,
} from "@/lib/notion-lost-items.server";
import { requireAppAuth } from "@/lib/auth.server";

const dateKeySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const phoneSchema = z.string().max(30).optional().default("");

const lostItemPhotoSchema = z
  .object({
    dataBase64: z.string().min(1),
    mimeType: z.string().regex(/^image\/(jpeg|jpg|png|webp)$/),
    filename: z.string().min(1).max(200),
  })
  .nullable()
  .optional();

export const lostItemInputSchema = z.object({
  name: z.string().trim().min(1).max(100),
  foundDate: dateKeySchema,
  foundLocation: z.string().trim().min(1).max(200),
  features: z.string().max(2000).optional().default(""),
  foundByStaff: z.string().trim().min(1).max(100),
  inquiryName: z.string().max(100).optional().default(""),
  inquiryPhone: phoneSchema,
  handoverStatus: z.enum([LOST_ITEM_HANDOVER_PENDING, LOST_ITEM_HANDOVER_DONE]),
  handoverDate: dateKeySchema.nullable().optional().default(null),
  handoverStaff: z.string().max(100).optional().default(""),
  disposalStatus: z.enum([LOST_ITEM_DISPOSAL_PENDING, LOST_ITEM_DISPOSAL_DONE]),
  photo: lostItemPhotoSchema,
  removePhoto: z.boolean().optional(),
});

export const fetchLostItems = createServerFn({ method: "GET" }).handler(async () => {
  await requireAppAuth();
  return listLostItemsFromNotion();
});

export const fetchLostItem = createServerFn({ method: "GET" })
  .validator(z.string().min(1))
  .handler(async ({ data: itemId }) => {
    await requireAppAuth();
    return getLostItemFromNotion(itemId);
  });

export const createLostItem = createServerFn({ method: "POST" })
  .validator(lostItemInputSchema)
  .handler(async ({ data }) => {
    await requireAppAuth();
    return createLostItemInNotion(data);
  });

export const updateLostItem = createServerFn({ method: "POST" })
  .validator(
    z.object({
      itemId: z.string().min(1),
      input: lostItemInputSchema,
    }),
  )
  .handler(async ({ data }) => {
    await requireAppAuth();
    return updateLostItemInNotion(data.itemId, data.input);
  });

export const deleteLostItem = createServerFn({ method: "POST" })
  .validator(z.string().min(1))
  .handler(async ({ data: itemId }) => {
    await requireAppAuth();
    const item = await getLostItemFromNotion(itemId);
    if (!item) {
      throw new Error("忘れ物が見つかりません。");
    }
    if (!canDeleteLostItem(item)) {
      throw new Error("受け渡し済みまたは処分済みの忘れ物のみ削除できます。");
    }
    await deleteLostItemFromNotion(itemId);
    return { success: true as const };
  });

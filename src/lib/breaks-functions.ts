import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { BREAK_SLOT_COUNT } from "@/lib/breaks-types";
import { requireAppAuth } from "@/lib/auth.server";
import {
  archiveBreakBusinessDayInNotion,
  createBreakStaffInNotion,
  deleteBreakStaffFromNotion,
  getBreakStaffFromNotion,
  listBreakStaffFromNotion,
  updateBreakStaffInNotion,
} from "@/lib/notion-breaks.server";

const dateKeySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const breakEntrySchema = z.object({
  startAt: z.string().nullable(),
  endAt: z.string().nullable(),
});

export const createBreakStaffInputSchema = z.object({
  businessDate: dateKeySchema,
  name: z.string().trim().min(1).max(50),
  requiredMinutes: z.union([z.literal(45), z.literal(60)]),
});

export const updateBreakStaffInputSchema = z.object({
  staffId: z.string().min(1),
  breaks: z.array(breakEntrySchema).length(BREAK_SLOT_COUNT),
});

export const fetchBreakStaffList = createServerFn({ method: "GET" })
  .validator(dateKeySchema)
  .handler(async ({ data: businessDate }) => {
    await requireAppAuth();
    return listBreakStaffFromNotion(businessDate);
  });

export const fetchBreakStaff = createServerFn({ method: "GET" })
  .validator(z.string().min(1))
  .handler(async ({ data: staffId }) => {
    await requireAppAuth();
    return getBreakStaffFromNotion(staffId);
  });

export const createBreakStaff = createServerFn({ method: "POST" })
  .validator(createBreakStaffInputSchema)
  .handler(async ({ data }) => {
    await requireAppAuth();
    return createBreakStaffInNotion(data);
  });

export const updateBreakStaff = createServerFn({ method: "POST" })
  .validator(updateBreakStaffInputSchema)
  .handler(async ({ data }) => {
    await requireAppAuth();
    return updateBreakStaffInNotion(data.staffId, { breaks: data.breaks });
  });

export const deleteBreakStaff = createServerFn({ method: "POST" })
  .validator(z.string().min(1))
  .handler(async ({ data: staffId }) => {
    await requireAppAuth();
    await deleteBreakStaffFromNotion(staffId);
    return { success: true as const };
  });

export const archiveBreakBusinessDay = createServerFn({ method: "POST" })
  .validator(dateKeySchema)
  .handler(async ({ data: businessDate }) => {
    await requireAppAuth();
    await archiveBreakBusinessDayInNotion(businessDate);
    return { success: true as const };
  });

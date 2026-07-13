import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createLostItem,
  deleteLostItem,
  fetchLostItem,
  fetchLostItems,
  updateLostItem,
} from "@/lib/lost-items-functions";
import { filterLostItems, sortLostItemsNewestFirst } from "@/lib/lost-items-storage";
import type { LostItemFilter } from "@/lib/lost-items-types";
import { formatTokyoDateKey } from "@/lib/tokyo-time";
import type { LostItemFormState } from "@/components/ui-hub/lost-items/LostItemFormFields";
import type { CompressedLostItemPhoto } from "@/lib/lost-items-image";
import {
  LOST_ITEM_HANDOVER_DONE,
  LOST_ITEM_HANDOVER_PENDING,
} from "@/lib/lost-items-types";

const LOST_ITEMS_QUERY_KEY = ["lost-items"] as const;

function toLostItemInput(
  form: LostItemFormState,
  photo: CompressedLostItemPhoto | null,
  options?: { removePhoto?: boolean },
) {
  return {
    name: form.name.trim(),
    foundDate: form.foundDate,
    foundLocation: form.foundLocation.trim(),
    features: form.features,
    foundByStaff: form.foundByStaff.trim(),
    inquiryName: form.inquiryName,
    inquiryPhone: form.inquiryPhone,
    handoverStatus: form.handoverStatus,
    handoverDate:
      form.handoverStatus === LOST_ITEM_HANDOVER_DONE && form.handoverDate ? form.handoverDate : null,
    handoverStaff: form.handoverStatus === LOST_ITEM_HANDOVER_DONE ? form.handoverStaff.trim() : "",
    disposalStatus: form.disposalStatus,
    photo,
    removePhoto: options?.removePhoto,
  };
}

export function useLostItemsList() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<LostItemFilter>("all");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const todayDateKey = formatTokyoDateKey(new Date());

  const query = useQuery({
    queryKey: LOST_ITEMS_QUERY_KEY,
    queryFn: () => fetchLostItems(),
  });

  const items = useMemo(() => {
    const sorted = sortLostItemsNewestFirst(query.data ?? []);
    return filterLostItems(sorted, filter, todayDateKey);
  }, [filter, query.data, todayDateKey]);

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: LOST_ITEMS_QUERY_KEY });
  }, [queryClient]);

  const registerItem = useCallback(
    async (payload: { form: LostItemFormState; photo: CompressedLostItemPhoto | null }) => {
      setSaving(true);
      try {
        await createLostItem({ data: toLostItemInput(payload.form, payload.photo) });
        await refresh();
      } finally {
        setSaving(false);
      }
    },
    [refresh],
  );

  return {
    items,
    filter,
    setFilter,
    todayDateKey,
    loading: query.isLoading,
    error: query.error,
    registerOpen,
    setRegisterOpen,
    saving,
    registerItem,
    refresh,
  };
}

export function useLostItemDetail(itemId: string) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const todayDateKey = formatTokyoDateKey(new Date());

  const query = useQuery({
    queryKey: [...LOST_ITEMS_QUERY_KEY, itemId],
    queryFn: () => fetchLostItem({ data: itemId }),
  });

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: LOST_ITEMS_QUERY_KEY });
  }, [queryClient]);

  const saveItem = useCallback(
    async (payload: {
      form: LostItemFormState;
      photo: CompressedLostItemPhoto | null;
      removePhoto?: boolean;
    }) => {
      setSaving(true);
      try {
        await updateLostItem({
          data: {
            itemId,
            input: toLostItemInput(payload.form, payload.photo, { removePhoto: payload.removePhoto }),
          },
        });
        await refresh();
      } finally {
        setSaving(false);
      }
    },
    [itemId, refresh],
  );

  const removeItem = useCallback(async () => {
    setDeleting(true);
    try {
      await deleteLostItem({ data: itemId });
      await refresh();
    } finally {
      setDeleting(false);
    }
  }, [itemId, refresh]);

  return {
    item: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    saving,
    deleting,
    todayDateKey,
    saveItem,
    removeItem,
  };
}

export function lostItemToFormState(item: NonNullable<Awaited<ReturnType<typeof fetchLostItem>>>): LostItemFormState {
  return {
    name: item.name,
    foundDate: item.foundDate,
    foundLocation: item.foundLocation,
    features: item.features,
    foundByStaff: item.foundByStaff,
    inquiryName: item.inquiryName,
    inquiryPhone: item.inquiryPhone,
    handoverStatus: item.handoverStatus,
    handoverDate: item.handoverDate ?? "",
    handoverStaff: item.handoverStaff,
    disposalStatus: item.disposalStatus,
  };
}

export const LOST_ITEM_HANDOVER_PENDING = "未受け渡し" as const;
export const LOST_ITEM_HANDOVER_DONE = "受け渡し済み" as const;
export const LOST_ITEM_DISPOSAL_PENDING = "未処分" as const;
export const LOST_ITEM_DISPOSAL_DONE = "処分済み" as const;

export type LostItemHandoverStatus =
  | typeof LOST_ITEM_HANDOVER_PENDING
  | typeof LOST_ITEM_HANDOVER_DONE;

export type LostItemDisposalStatus =
  | typeof LOST_ITEM_DISPOSAL_PENDING
  | typeof LOST_ITEM_DISPOSAL_DONE;

export type LostItemFilter =
  | "all"
  | "pending-handover"
  | "handed-over"
  | "overdue"
  | "disposed";

export type LostItemPhoto = {
  url: string;
  name?: string;
};

export type LostItem = {
  id: string;
  name: string;
  foundDate: string;
  foundLocation: string;
  features: string;
  foundByStaff: string;
  photo: LostItemPhoto | null;
  inquiryName: string;
  inquiryPhone: string;
  handoverStatus: LostItemHandoverStatus;
  handoverDate: string | null;
  handoverStaff: string;
  disposalStatus: LostItemDisposalStatus;
  storageDeadline: string;
  createdAt: string;
  updatedAt: string;
};

export type LostItemDeadlineLabel = {
  text: string;
  tone: "normal" | "today" | "overdue";
};

export type LostItemPhotoPayload = {
  dataBase64: string;
  mimeType: string;
  filename: string;
} | null;

export type LostItemInput = {
  name: string;
  foundDate: string;
  foundLocation: string;
  features: string;
  foundByStaff: string;
  inquiryName: string;
  inquiryPhone: string;
  handoverStatus: LostItemHandoverStatus;
  handoverDate: string | null;
  handoverStaff: string;
  disposalStatus: LostItemDisposalStatus;
  photo: LostItemPhotoPayload;
  removePhoto?: boolean;
};

export const LOST_ITEM_PROPERTY_NAMES = {
  name: "名前",
  foundDate: "拾得日",
  foundLocation: "拾得場所",
  features: "特徴",
  foundByStaff: "拾得したスタッフ",
  photo: "写真",
  inquiryName: "問い合わせ者",
  inquiryPhone: "電話番号",
  handoverStatus: "受け渡し状況",
  handoverDate: "受け渡し日",
  handoverStaff: "対応スタッフ",
  disposalStatus: "処分状況",
} as const;

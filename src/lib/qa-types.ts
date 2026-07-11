import type { NotionBlock } from "@/lib/notion-types";

export type QaItem = {
  id: string;
  manualId: string;
  category: string;
  question: string;
  answerBlocks: NotionBlock[];
  updatedAt?: string;
};

export type QaCategoryGroup = {
  category: string;
  items: QaItem[];
};

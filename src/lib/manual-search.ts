import type { NotionBlock } from "@/lib/notion-types";

function extractSearchText(blocks: NotionBlock[]): string {
  const parts: string[] = [];

  const walk = (items: NotionBlock[]) => {
    for (const block of items) {
      parts.push(...block.richText.map((item) => item.plain_text));
      if (block.cells) {
        for (const cell of block.cells) {
          parts.push(...cell.map((item) => item.plain_text));
        }
      }
      if (block.imageCaption) parts.push(block.imageCaption);
      if (block.children?.length) walk(block.children);
    }
  };

  walk(blocks);
  return parts.join(" ");
}

export function manualSearchText(
  manual: {
    title: string;
    category?: string;
    searchTags: string[];
  },
  blocks: NotionBlock[] = [],
) {
  return [manual.title, manual.category, ...manual.searchTags, extractSearchText(blocks)].filter(Boolean).join(" ");
}

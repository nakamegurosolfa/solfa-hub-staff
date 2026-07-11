import type { NotionBlock } from "@/lib/notion-types";

export function notionImageProxySrc(blockId: string) {
  return `/api/notion-image/${blockId}`;
}

/** Prefer the mapped Notion URL; fall back to the proxy when none is available. */
export function notionImageSrc(block: NotionBlock): string | undefined {
  if (block.type !== "image") return undefined;
  if (block.imageUrl) return block.imageUrl;
  if (block.id) return notionImageProxySrc(block.id);
  return undefined;
}

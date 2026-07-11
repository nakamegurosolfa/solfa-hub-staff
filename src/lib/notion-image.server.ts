import type { BlockObjectResponse } from "@notionhq/client";

import { getNotionClient, readNotionBlockId } from "@/lib/notion";
import {
  isImageUrl,
  readMediaUrl,
  resolveImageContentType,
  type NotionMediaSource,
} from "@/lib/notion-media";

function readImageMediaFromBlock(block: BlockObjectResponse): NotionMediaSource | null {
  if (block.type === "image") return block.image;
  if (block.type === "file") return block.file;
  return null;
}

export async function getNotionImageBlockUrl(blockId: string): Promise<string | null> {
  const notion = getNotionClient();
  const normalizedBlockId = readNotionBlockId(blockId);
  const block = (await notion.blocks.retrieve({ block_id: normalizedBlockId })) as BlockObjectResponse;

  const media = readImageMediaFromBlock(block);
  if (!media) return null;

  const url = readMediaUrl(media);
  if (!url) return null;
  if (block.type === "file" && !isImageUrl(url)) return null;

  return url;
}

export async function getNotionImageContentType(blockId: string): Promise<string | null> {
  const url = await getNotionImageBlockUrl(blockId);
  if (!url) return null;

  let upstream = await fetch(url, { method: "HEAD", redirect: "follow" });
  if (!upstream.ok) {
    upstream = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: { Range: "bytes=0-0" },
    });
  }
  if (!upstream.ok) return null;

  return resolveImageContentType(upstream.headers.get("Content-Type"), url);
}

export async function headNotionImage(blockId: string): Promise<Response> {
  const contentType = await getNotionImageContentType(blockId);
  if (!contentType) {
    return new Response(null, { status: 404 });
  }

  return new Response(null, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, no-store, no-cache, must-revalidate",
    },
  });
}

export async function proxyNotionImage(blockId: string): Promise<Response> {
  const url = await getNotionImageBlockUrl(blockId);
  if (!url) {
    return new Response("Image block not found", { status: 404 });
  }

  const upstream = await fetch(url, { redirect: "follow" });
  if (!upstream.ok) {
    return new Response(`Upstream image unavailable (${upstream.status})`, { status: upstream.status });
  }

  const bytes = await upstream.arrayBuffer();
  const contentType = resolveImageContentType(upstream.headers.get("Content-Type"), url);

  return new Response(bytes, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(bytes.byteLength),
      "Cache-Control": "private, no-store, no-cache, must-revalidate",
    },
  });
}

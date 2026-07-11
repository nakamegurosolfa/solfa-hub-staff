import type { RichTextItemResponse } from "@notionhq/client";

const IMAGE_EXTENSIONS = /\.(png|jpe?g|gif|webp|heic|heif|bmp|svg)(\?|$)/i;

export type NotionMediaSource = {
  type: string;
  external?: { url: string };
  file?: { url: string };
  caption?: RichTextItemResponse[];
};

function normalizeContentType(contentType: string) {
  return contentType.split(";")[0]?.trim().toLowerCase() ?? "";
}

export function resolveImageContentType(upstreamType: string | null, url: string) {
  return normalizeContentType(upstreamType ?? contentTypeFromImageUrl(url) ?? "application/octet-stream");
}

export function isHeicContentType(contentType: string) {
  const normalized = normalizeContentType(contentType);
  return normalized === "image/heic" || normalized === "image/heif";
}

export function isDisplayableImageContentType(contentType: string) {
  const normalized = normalizeContentType(contentType);
  return (
    normalized === "image/png" ||
    normalized === "image/jpeg" ||
    normalized === "image/webp" ||
    normalized === "image/gif"
  );
}

function pathnameFromUrl(url: string) {
  try {
    return decodeURIComponent(new URL(url).pathname);
  } catch {
    return url;
  }
}

export function isImageUrl(url: string) {
  return IMAGE_EXTENSIONS.test(pathnameFromUrl(url));
}

export function contentTypeFromImageUrl(url: string): string | undefined {
  const pathname = pathnameFromUrl(url).toLowerCase();
  if (pathname.endsWith(".png")) return "image/png";
  if (pathname.endsWith(".jpg") || pathname.endsWith(".jpeg")) return "image/jpeg";
  if (pathname.endsWith(".gif")) return "image/gif";
  if (pathname.endsWith(".webp")) return "image/webp";
  if (pathname.endsWith(".heic")) return "image/heic";
  if (pathname.endsWith(".heif")) return "image/heif";
  return undefined;
}

export function readMediaUrl(media: NotionMediaSource) {
  if (media.type === "external" && media.external?.url) {
    return media.external.url;
  }
  if (media.type === "file" && media.file?.url) {
    return media.file.url;
  }
  return undefined;
}

export function readMediaSourceType(media: NotionMediaSource): "external" | "file" | undefined {
  if (media.type === "external" && media.external?.url) return "external";
  if (media.type === "file" && media.file?.url) return "file";
  return undefined;
}

export function logImageBlockMapping(blockId: string, media: NotionMediaSource) {
  if (import.meta.env.PROD) return;

  console.log("[Notion image block]", {
    blockId,
    "image.type": media.type,
    "image.external.url": media.type === "external" ? media.external?.url : undefined,
    "image.file.url": media.type === "file" ? media.file?.url : undefined,
  });
}

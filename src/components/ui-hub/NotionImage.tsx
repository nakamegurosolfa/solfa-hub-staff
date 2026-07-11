"use client";

import { useEffect, useRef, useState } from "react";

import type { NotionBlock } from "@/lib/notion-types";
import { notionImageSrc } from "@/lib/notion-image-url";

const LOAD_TIMEOUT_MS = 10_000;

function Caption({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <figcaption className="mt-2 px-1 text-xs leading-relaxed text-muted-foreground">{text}</figcaption>
  );
}

export function NotionImage({ block }: { block: NotionBlock }) {
  const initialSrc = notionImageSrc(block);
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  if (!initialSrc) return null;

  const handleLoadFailure = (currentSrc: string) => {
    console.log("img src", currentSrc);
    setFailed(true);
  };

  useEffect(() => {
    setFailed(false);

    const timeout = window.setTimeout(() => {
      const img = imgRef.current;
      if (img?.complete && img.naturalWidth > 0) return;
      handleLoadFailure(initialSrc);
    }, LOAD_TIMEOUT_MS);

    return () => window.clearTimeout(timeout);
  }, [initialSrc]);

  if (failed) {
    return (
      <figure className="my-3 w-full">
        <div className="rounded-xl border border-border bg-[var(--color-surface-2)] px-4 py-6 text-center text-sm text-muted-foreground">
          画像を表示できません
        </div>
        <Caption text={block.imageCaption} />
      </figure>
    );
  }

  return (
    <figure className="my-3 w-full">
      <img
        ref={imgRef}
        src={initialSrc}
        alt={block.imageCaption || "Notion image"}
        loading="lazy"
        decoding="async"
        className="w-full rounded-xl"
        onError={() => handleLoadFailure(initialSrc)}
        onLoad={(event) => {
          if (event.currentTarget.naturalWidth === 0) {
            handleLoadFailure(initialSrc);
          }
        }}
      />
      <Caption text={block.imageCaption} />
    </figure>
  );
}

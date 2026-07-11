import { parseYouTubeVideoId, youTubeEmbedUrl } from "@/lib/youtube-url";

function MediaFrame({ children, caption }: { children: React.ReactNode; caption?: string }) {
  return (
    <figure className="w-full">
      <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black">
        {children}
      </div>
      {caption ? <figcaption className="mt-2 text-[13px] text-muted-foreground">{caption}</figcaption> : null}
    </figure>
  );
}

export function NotionMediaPlayer({ url, caption }: { url: string; caption?: string }) {
  const youTubeId = parseYouTubeVideoId(url);

  if (youTubeId) {
    return (
      <MediaFrame caption={caption}>
        <iframe
          src={youTubeEmbedUrl(youTubeId)}
          title={caption || "YouTube video"}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </MediaFrame>
    );
  }

  return (
    <MediaFrame caption={caption}>
      <video src={url} controls playsInline className="h-full w-full" />
    </MediaFrame>
  );
}

function normalizeHost(hostname: string) {
  return hostname.replace(/^www\./, "").toLowerCase();
}

export function parseYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = normalizeHost(parsed.hostname);

    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1).split("/")[0]?.trim();
      return id || null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname === "/watch") {
        return parsed.searchParams.get("v")?.trim() || null;
      }

      const embedMatch = parsed.pathname.match(/^\/embed\/([^/?#]+)/);
      if (embedMatch?.[1]) {
        return embedMatch[1];
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function youTubeEmbedUrl(videoId: string) {
  return `https://www.youtube.com/embed/${videoId}`;
}

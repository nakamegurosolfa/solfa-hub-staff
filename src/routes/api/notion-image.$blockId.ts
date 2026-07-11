import { createFileRoute } from "@tanstack/react-router";

import { hasAppAuthFromCookieHeader } from "@/lib/auth.server";
import { headNotionImage, proxyNotionImage } from "@/lib/notion-image.server";

export const Route = createFileRoute("/api/notion-image/$blockId")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const authenticated = await hasAppAuthFromCookieHeader(request.headers.get("cookie"));
        if (!authenticated) {
          return new Response("Unauthorized", { status: 401 });
        }
        return proxyNotionImage(params.blockId);
      },
      HEAD: async ({ request, params }) => {
        const authenticated = await hasAppAuthFromCookieHeader(request.headers.get("cookie"));
        if (!authenticated) {
          return new Response("Unauthorized", { status: 401 });
        }
        return headNotionImage(params.blockId);
      },
    },
  },
});

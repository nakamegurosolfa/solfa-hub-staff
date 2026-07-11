import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import type { AuthStatus } from "@/lib/auth.server";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient, auth: { appAuthenticated: false, employeeAuthenticated: false } satisfies AuthStatus },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};

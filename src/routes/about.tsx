import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({ component: () => <Outlet /> });

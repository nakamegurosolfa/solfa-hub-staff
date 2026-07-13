import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/lost-items")({
  component: () => <Outlet />,
});

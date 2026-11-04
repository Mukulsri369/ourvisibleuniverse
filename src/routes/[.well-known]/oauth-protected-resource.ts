import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/.well-known/oauth-protected-resource")({
  server: { handlers: { ANY: async ({ request }) => {
    const { protectedResourceMetadata } = await import("../../lib/mcp/handler.server");
    return protectedResourceMetadata(request);
  } } },
});

import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/mcp")({
  server: { handlers: { ANY: async ({ request }) => {
    const { handleMcpRequest } = await import("../lib/mcp/handler.server");
    return handleMcpRequest(request);
  } } },
});

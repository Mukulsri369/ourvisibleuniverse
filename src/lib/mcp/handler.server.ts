import { resourceOrigin, supabaseIssuer, verifyMcpToken } from "./auth.server";

export function protectedResourceMetadata(request: Request) {
  let origin: string;
  try { origin = resourceOrigin(request); } catch { return new Response("Forbidden", { status: 403 }); }
  if (request.method !== "GET" && request.method !== "HEAD") return new Response(null, { status: 405, headers: { Allow: "GET, HEAD" } });
  const body = { resource: `${origin}/mcp`, authorization_servers: [supabaseIssuer()], bearer_methods_supported: ["header"], resource_name: "Our Visible Universe" };
  return new Response(request.method === "HEAD" ? null : JSON.stringify(body), { headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}

export async function handleMcpRequest(request: Request, verify = verifyMcpToken) {
  let origin: string;
  try { origin = resourceOrigin(request); } catch { return new Response("Forbidden", { status: 403 }); }
  if (!["GET", "POST", "DELETE"].includes(request.method)) return new Response(null, { status: 405, headers: { Allow: "GET, POST, DELETE" } });
  const unauthenticated = () => new Response("Unauthorized", { status: 401, headers: {
    "WWW-Authenticate": `Bearer resource_metadata="${origin}/.well-known/oauth-protected-resource"`, "Cache-Control": "no-store",
  } });
  const match = /^Bearer ([^\s,]+)$/.exec(request.headers.get("authorization") ?? "");
  if (!match) return unauthenticated();
  let user: Awaited<ReturnType<typeof verifyMcpToken>>;
  try { user = await verify(match[1]); } catch { return unauthenticated(); }
  const [{ createMcpHandler }, { createUniverseMcpServer }] = await Promise.all([import("@modelcontextprotocol/server"), import("./index")]);
  // Fresh request context prevents cross-user session leakage.
  const handler = createMcpHandler(() => createUniverseMcpServer({
    getToken: () => match[1], getUserId: () => user.userId, isAuthenticated: () => true,
  }), { maxRequestBodySize: 64 * 1024 });
  return handler.fetch(request, { authInfo: { token: match[1], clientId: user.clientId, scopes: [], expiresAt: user.expiresAt } });
}

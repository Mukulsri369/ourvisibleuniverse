import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from "jose";

const resolvers = new Map<string, JWTVerifyGetKey>();
export function supabaseIssuer() {
  const projectRef = import.meta.env?.VITE_SUPABASE_PROJECT_ID;
  const base = projectRef ? `https://${projectRef}.supabase.co` : process.env.SUPABASE_URL;
  if (!base) throw new Error("Supabase project configuration is required");
  const url = new URL(base);
  if (url.protocol !== "https:" || !url.hostname.endsWith(".supabase.co")) throw new Error("A direct HTTPS Supabase project URL is required");
  return `${url.origin}/auth/v1`;
}

export async function verifyMcpToken(token: string, issuer = supabaseIssuer(), key?: JWTVerifyGetKey) {
  if (!key) {
    key = resolvers.get(issuer);
    if (!key) {
      key = createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`), { timeoutDuration: 5000 });
      resolvers.set(issuer, key);
    }
  }
  const { payload } = await jwtVerify(token, key, {
    issuer, audience: "authenticated", algorithms: ["ES256", "RS256"], requiredClaims: ["sub", "exp", "iat"],
  });
  if (payload.role !== "authenticated" || !payload.sub || typeof payload.client_id !== "string" || !payload.client_id.trim()) throw new Error("A user OAuth token with a client_id is required");
  return { userId: payload.sub, clientId: payload.client_id, expiresAt: payload.exp! };
}

/** Forwarded headers never define security metadata or allowed origins. */
export function resourceOrigin(request: Request) {
  const url = new URL(request.url);
  const configured = process.env.PUBLIC_APP_ORIGIN;
  const allowed = new Set(["http://127.0.0.1:31751", "http://localhost:31751", "https://ourvisibleuniverse.in"]);
  if (configured) allowed.add(new URL(configured).origin);
  if (!allowed.has(url.origin)) throw new Error("Unrecognized application origin");
  const origin = request.headers.get("origin");
  if (origin && origin !== url.origin) throw new Error("Cross-origin MCP requests are not allowed");
  return url.origin;
}

import { SITE_ORIGIN } from "./site-origin";

/** Enable only after DNS, TLS and authentication are ready for the new origin. */
export function primaryDomainRedirect(request: Request, environment: unknown): Response | null {
  if (
    !environment ||
    typeof environment !== "object" ||
    !("OVU_DEPLOYMENT_STAGE" in environment) ||
    environment.OVU_DEPLOYMENT_STAGE !== "production" ||
    !("PUBLIC_APP_ORIGIN" in environment) ||
    environment.PUBLIC_APP_ORIGIN !== SITE_ORIGIN
  )
    return null;
  const url = new URL(request.url);
  if (
    !["ourvisibleuniverse.in", "www.ourvisibleuniverse.in", "www.ourvisibleuniverse.com"].includes(
      url.hostname,
    ) ||
    !["GET", "HEAD"].includes(request.method)
  )
    return null;
  // Old PKCE/recovery links must finish on the origin that started their flow.
  // Machine endpoints retain their URLs, methods and authorization boundaries.
  if (
    /^\/(?:auth(?:-reset)?(?:\/|$)|api(?:\/|$)|mcp(?:\/|$)|\.well-known(?:\/|$)|_server(?:\/|$)|assets(?:\/|$))/.test(
      url.pathname,
    )
  )
    return null;
  return new Response(null, {
    status: 308,
    headers: {
      Location: `${SITE_ORIGIN}${url.pathname}${url.search}`,
      "Cache-Control": "no-store",
    },
  });
}

/** Hosted staging stays out of search results without changing production headers. */
export function deploymentHeaders(response: Response, environment: unknown): Response {
  if (!environment || typeof environment !== "object" ||
    !("OVU_DEPLOYMENT_STAGE" in environment) || environment.OVU_DEPLOYMENT_STAGE !== "staging" || response.status === 101) return response;
  const headers = new Headers(response.headers);
  headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

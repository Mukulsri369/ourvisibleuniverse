/** Retained webhook/QA hostname stays out of search results after domain promotion. */
export function deploymentHeaders(response: Response, environment: unknown, request?: Request): Response {
  const stagingHost = request && new URL(request.url).hostname === "ovu-supabase-staging.mukul-srivastava-025.workers.dev";
  const stagingEnvironment = environment && typeof environment === "object" &&
    "OVU_DEPLOYMENT_STAGE" in environment && environment.OVU_DEPLOYMENT_STAGE === "staging";
  if ((!stagingHost && !stagingEnvironment) || response.status === 101) return response;
  const headers = new Headers(response.headers);
  headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

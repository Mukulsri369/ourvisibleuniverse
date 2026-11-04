/** A valid OAuth connector token belongs to MCP, not the website/admin API. */
export function assertWebsiteSession(claims: Record<string, unknown>) {
  if (Object.prototype.hasOwnProperty.call(claims, "client_id")) {
    throw Object.assign(new Error("Third-party OAuth sessions are restricted to the MCP endpoint"), { statusCode: 403 });
  }
}

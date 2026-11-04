/** Local diagnostics only; no hosting vendor globals or telemetry uploads. */
export function reportApplicationError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  console.error("[OVU] Route boundary error", { route: window.location.pathname, ...context }, error);
}

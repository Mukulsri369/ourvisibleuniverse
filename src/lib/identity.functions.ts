import { createServerFn } from "@tanstack/react-start";

/** Resolve identity per request, including SSR. Never share client session state on the server. */
export const currentUser = createServerFn({ method: "GET" }).handler(async () => {
  const [{ getRequest }, { independentAuth }] = await Promise.all([
    import("@tanstack/react-start/server"),
    import("@/backend/runtime.server"),
  ]);
  const session = await independentAuth().api.getSession({ headers: getRequest().headers });
  return session?.user ?? null;
});

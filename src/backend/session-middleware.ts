import { createMiddleware } from "@tanstack/react-start";

export const requireIndependentAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const [{ getRequest }, { independentAuth }] = await Promise.all([
      import("@tanstack/react-start/server"),
      import("./runtime.server"),
    ]);
    const session = await independentAuth().api.getSession({ headers: getRequest().headers });
    if (!session?.user.emailVerified) throw new Error("Sign in with a verified email to continue");
    return next({ context: { userId: session.user.id, principal: session.user } });
  },
);

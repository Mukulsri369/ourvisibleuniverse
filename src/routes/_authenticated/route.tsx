// @ts-nocheck
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { authDestination } from "@/lib/auth-navigation";
import { currentUser } from "@/lib/identity.functions";
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const next = authDestination(location.href, undefined, false);
    try {
      const user = await currentUser();
      if (!user?.emailVerified) throw redirect({ to: "/auth", search: { next } });
      return { user };
    } catch (err) {
      if (err && typeof err === "object" && ("to" in err || "status" in err)) throw err;
      throw redirect({ to: "/auth", search: { next } });
    }
  },
  component: () => <Outlet />,
});

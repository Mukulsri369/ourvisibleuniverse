// @ts-nocheck
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { authDestination } from "@/lib/auth-navigation";
import { supabase } from "@/integrations/supabase/client";
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const next = authDestination(location.href, undefined, false);
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) throw redirect({ to: "/auth", search: { next } });
      return { user: data.user };
    } catch (err) {
      if (err && typeof err === "object" && ("to" in err || "status" in err)) throw err;
      throw redirect({ to: "/auth", search: { next } });
    }
  },
  component: () => <Outlet />,
});

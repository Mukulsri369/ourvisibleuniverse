import { ClientOnly, createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getMyAccess } from "@/lib/razorpay.functions";
const StarsApp = lazy(() => import("@/stars/StarsApp").then((m) => ({ default: m.StarsApp })));

export const Route = createFileRoute("/_authenticated/universe")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Explore — Our Visible Universe" },
      { name: "description", content: "Explore the interactive 3D universe." },
      { property: "og:title", content: "Explore — Our Visible Universe" },
      { property: "og:description", content: "Explore the interactive 3D universe." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UniverseGate,
});
function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background text-sm uppercase text-muted-foreground">
      Loading the universe…
    </div>
  );
}
function UniverseGate() {
  const [state, setState] = useState<"checking" | "allowed" | "blocked">("checking");
  useEffect(() => {
    void getMyAccess()
      .then(({ access }) =>
        setState(
          access?.status === "active" && new Date(access.expires_at) > new Date()
            ? "allowed"
            : "blocked",
        ),
      )
      .catch(() => setState("blocked"));
  }, []);
  if (state === "checking") return <Loading />;
  if (state === "blocked")
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background px-5">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-semibold">An active access pass is required.</h1>
          <p className="mt-4 text-muted-foreground">
            Choose a one-time pass to open the complete educational universe.
          </p>
          <Button asChild className="mt-7">
            <Link to="/pricing">View access passes</Link>
          </Button>
        </div>
      </div>
    );
  return (
    <ClientOnly fallback={<Loading />}>
      <Suspense fallback={<Loading />}>
        <StarsApp />
      </Suspense>
    </ClientOnly>
  );
}

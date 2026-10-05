import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
const StarsApp = lazy(() => import("@/stars/StarsApp").then(m => ({ default: m.StarsApp })));

export const Route = createFileRoute("/universe")({ ssr: false, head: () => ({ meta: [
  { title: "Explore — Our Visible Universe" }, { name: "description", content: "Explore the interactive 3D universe." }, { property: "og:title", content: "Explore — Our Visible Universe" }, { property: "og:description", content: "Explore the interactive 3D universe." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
] }), component: UniversePage });
function Loading() { return <div className="fixed inset-0 flex items-center justify-center bg-background text-sm uppercase text-muted-foreground">Loading the universe…</div>; }
function UniversePage() {
  return <ClientOnly fallback={<Loading />}><Suspense fallback={<Loading />}><StarsApp /></Suspense></ClientOnly>;
}
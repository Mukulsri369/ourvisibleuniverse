import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const StarsApp = lazy(() =>
  import("../stars/StarsApp").then((m) => ({ default: m.StarsApp })),
);

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Our Visible Universe — An interactive map of the stellar neighborhood" },
      { name: "description", content: "Cinematic 3D visualization of our nearest stars, the Sun, and the Milky Way." },
      { property: "og:title", content: "Our Visible Universe" },
      { property: "og:description", content: "Cinematic 3D visualization of our nearest stars." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Fallback() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black text-white/60 text-sm tracking-widest">
      LOADING THE UNIVERSE…
    </div>
  );
}

function Index() {
  return (
    <ClientOnly fallback={<Fallback />}>
      <Suspense fallback={<Fallback />}>
        <StarsApp />
      </Suspense>
    </ClientOnly>
  );
}

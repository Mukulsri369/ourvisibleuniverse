import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site/PublicLayout";
import { AcademyDashboard } from "@/components/academy/AcademyDashboard";
import { Button } from "@/components/ui/button";

interface LearnSearchParams {
  module?: string;
}

export const Route = createFileRoute("/learn")({
  validateSearch: (search: Record<string, unknown>): LearnSearchParams => ({
    module: typeof search.module === "string" ? search.module : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Cosmic Learning Academy — Interactive Astronomy Curriculum" },
      {
        name: "description",
        content:
          "Explore the 24-module Cosmic Learning Academy arranged into six progressive space stages with age-adaptive levels for junior, intermediate, and young astronomers.",
      },
      {
        property: "og:title",
        content: "Cosmic Learning Academy — Interactive Astronomy Curriculum",
      },
      {
        property: "og:description",
        content:
          "From our planet to the edge of the observable universe: interactive 3D simulations, speed-of-light experiments, and observational physics.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LearnRouteComponent,
  errorComponent: ({ error, reset }) => (
    <PublicLayout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Cosmic Learning Academy</h2>
        <p className="text-sm text-slate-400 mb-6 max-w-md">
          Something went wrong while loading this learning module. You can try refreshing or return
          home.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.reload();
              } else {
                reset();
              }
            }}
            className="bg-cyan-600 hover:bg-cyan-500 text-white"
          >
            Reload Module
          </Button>
          <Button asChild variant="outline" className="border-white/10 text-white">
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </PublicLayout>
  ),
});

function LearnRouteComponent() {
  const search = Route.useSearch();
  return (
    <PublicLayout>
      <AcademyDashboard initialModuleId={search.module} />
    </PublicLayout>
  );
}

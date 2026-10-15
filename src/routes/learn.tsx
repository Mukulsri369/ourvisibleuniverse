import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site/PublicLayout";
import { AcademyDashboard } from "@/components/academy/AcademyDashboard";

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
});

function LearnRouteComponent() {
  const search = Route.useSearch();
  return (
    <PublicLayout>
      <AcademyDashboard initialModuleId={search.module} />
    </PublicLayout>
  );
}

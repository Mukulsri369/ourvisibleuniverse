import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site/PublicLayout";
import {
  AstrophysicsLabHub,
  type AstrophysicsLabModuleId,
} from "@/components/astrophysics-lab/AstrophysicsLabHub";

interface AstrophysicsLabSearchParams {
  module?: AstrophysicsLabModuleId;
  target?: string;
}

export const Route = createFileRoute("/astrophysics-lab")({
  validateSearch: (search: Record<string, unknown>): AstrophysicsLabSearchParams => ({
    module:
      search.module === "star_formation" ||
      search.module === "stellar_evolution" ||
      search.module === "planet_formation" ||
      search.module === "galaxy_assembly"
        ? search.module
        : undefined,
    target: typeof search.target === "string" ? search.target : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Astrophysics & Formation Laboratories | Our Visible Universe" },
      {
        name: "description",
        content:
          "Interactive physics-informed laboratories: star formation, stellar evolution with H-R diagram, protoplanetary disk planet assembly, and research galaxy merger simulations.",
      },
      { property: "og:title", content: "Astrophysics & Formation Laboratories" },
      {
        property: "og:description",
        content:
          "Explore simplified, mathematically sound numerical simulations of stellar birth, lifecycles, protoplanetary systems, and cosmological galaxy collisions.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AstrophysicsLabRouteComponent,
});

function AstrophysicsLabRouteComponent() {
  const search = Route.useSearch();

  return (
    <PublicLayout>
      <AstrophysicsLabHub initialModule={search.module} targetObjectName={search.target} />
    </PublicLayout>
  );
}

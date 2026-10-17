import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site/PublicLayout";
import { CosmicEvolutionExplorer } from "@/components/cosmic-evolution/CosmicEvolutionExplorer";

interface CosmicEvolutionSearchParams {
  stage?: string;
}

export const Route = createFileRoute("/cosmic-evolution")({
  validateSearch: (search: Record<string, unknown>): CosmicEvolutionSearchParams => ({
    stage: typeof search.stage === "string" ? search.stage : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Cosmic Evolution — 13.8 Billion Years of the Universe | Our Visible Universe" },
      {
        name: "description",
        content:
          "Scientifically grounded interactive cosmic evolution timeline from the hot Big Bang expansion to the modern cosmic web with verified observational and simulation data.",
      },
      { property: "og:title", content: "Cosmic Evolution — 13.8 Billion Years of the Universe" },
      {
        property: "og:description",
        content:
          "Explore the 15 chronological stages of cosmic history: inflation, plasma, nucleosynthesis, CMB, dark ages, first stars, and mature large-scale structure.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CosmicEvolutionRouteComponent,
});

function CosmicEvolutionRouteComponent() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  return (
    <PublicLayout>
      <CosmicEvolutionExplorer
        initialStageId={search.stage}
        onExploreModule17={() => navigate({ to: "/learn", search: { module: "module-17" } })}
        onExploreHistory={() => navigate({ to: "/visible-universe-history" })}
      />
    </PublicLayout>
  );
}

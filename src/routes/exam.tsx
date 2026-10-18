import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site/PublicLayout";
import { FinalExamEngine } from "@/components/academy/FinalExamEngine";
import type { LearningLevel } from "@/lib/academy/types";

interface ExamSearchParams {
  level?: LearningLevel;
  mode?: "official" | "practice";
}

export const Route = createFileRoute("/exam")({
  validateSearch: (search: Record<string, unknown>): ExamSearchParams => ({
    level:
      search.level === "junior" || search.level === "explorer" || search.level === "astronomer"
        ? search.level
        : undefined,
    mode: search.mode === "official" || search.mode === "practice" ? search.mode : undefined,
  }),
  head: () => ({
    meta: [
      {
        title:
          "Cosmic Explorer — Final Knowledge Assessment | Our Visible Universe Academy",
      },
      {
        name: "description",
        content:
          "The official final assessment for the 24-module Cosmic Journey curriculum. 20 randomly selected questions across all 6 celestial stages with age-adaptive tiers and verified certification.",
      },
      {
        property: "og:title",
        content: "Cosmic Explorer — Final Knowledge Assessment",
      },
      {
        property: "og:description",
        content:
          "Authoritative evaluation covering planetary physics, stellar lifecycles, galactic dynamics, cosmological evolution, and observational astrophysics.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ExamRouteComponent,
});

function ExamRouteComponent() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  return (
    <PublicLayout>
      <div className="min-h-screen bg-slate-950 text-slate-100 py-8">
        <FinalExamEngine
          initialLevel={search.level || "explorer"}
          initialMode={search.mode || "official"}
          onBackToAcademy={() => navigate({ to: "/learn" })}
          onSelectModule={(modId) => navigate({ to: "/learn", search: { module: modId } })}
        />
      </div>
    </PublicLayout>
  );
}

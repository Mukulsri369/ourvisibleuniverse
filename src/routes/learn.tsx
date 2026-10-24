import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site/PublicLayout";
import { AcademyDashboard } from "@/components/academy/AcademyDashboard";

export const Route = createFileRoute("/learn")({
  validateSearch: (search: Record<string, unknown>): { module?: string } => {
    return {
      module: typeof search.module === "string" ? search.module : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Cosmic Learning Academy — 24 Relativistic Astronomy Modules" },
      {
        name: "description",
        content:
          "Interactive 24-module astronomy & astrophysics curriculum across 6 progressive celestial stages, featuring 3D WebGL laboratories, age-adaptive tiers, and verifiable credentials.",
      },
    ],
  }),
  component: LearnPage,
});

function LearnPage() {
  const { module } = Route.useSearch();
  return (
    <PublicLayout className="bg-[#05060a] text-white">
      <AcademyDashboard initialModuleId={module} />
    </PublicLayout>
  );
}

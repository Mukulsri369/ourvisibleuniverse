import { createFileRoute } from "@tanstack/react-router";
import { AstronomicalDataPipeline } from "@/lib/astronomy/ingestion/pipeline";

export const Route = createFileRoute("/api/public/catalog/object")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        const sourceId = url.searchParams.get("sourceId");

        if (!id && !sourceId) {
          return Response.json(
            { error: "Missing required parameter 'id' (canonicalId) or 'sourceId'" },
            { status: 400 },
          );
        }

        const catalog = AstronomicalDataPipeline.getPublishedCatalog();
        const provenance = AstronomicalDataPipeline.getPublishedProvenance();

        const match = catalog.find((obj) => {
          if (id && obj.canonicalId.toLowerCase() === id.toLowerCase()) return true;
          if (sourceId && obj.provenance.sourceId.toLowerCase() === sourceId.toLowerCase())
            return true;
          return false;
        });

        if (!match) {
          return Response.json(
            { error: `Astronomical object not found for ${id ?? sourceId}` },
            { status: 404 },
          );
        }

        const conflictingMeasurements = provenance.filter(
          (p) => p.canonicalId.toLowerCase() === match.canonicalId.toLowerCase(),
        );

        return Response.json(
          {
            object: match,
            provenance: {
              primaryCatalog: match.provenance,
              alternativeMeasurements: conflictingMeasurements,
            },
          },
          {
            headers: {
              "Cache-Control": "public, max-age=3600, s-maxage=86400",
              "Access-Control-Allow-Origin": "*",
            },
          },
        );
      },
    },
  },
});

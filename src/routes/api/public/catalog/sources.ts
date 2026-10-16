import { createFileRoute } from "@tanstack/react-router";
import { AstronomicalDataPipeline } from "@/lib/astronomy/ingestion/pipeline";

export const Route = createFileRoute("/api/public/catalog/sources")({
  server: {
    handlers: {
      GET: async () => {
        const providers = AstronomicalDataPipeline.getProviders();
        const catalog = AstronomicalDataPipeline.getPublishedCatalog();
        const provenance = AstronomicalDataPipeline.getPublishedProvenance();

        // Calculate counts per provider
        const objectCounts: Record<string, number> = {};
        for (const obj of catalog) {
          const cat = obj.provenance.sourceCatalog;
          objectCounts[cat] = (objectCounts[cat] ?? 0) + 1;
        }

        return Response.json(
          {
            catalogs: providers.map((p) => ({
              ...p,
              objectCount: objectCounts[p.id] ?? 0,
            })),
            provenanceCount: provenance.length,
            totalObjects: catalog.length,
            policy: {
              dataIntegrity:
                "Strict scientific provenance: no hallucinated or invented measurements. Missing values remain explicitly null.",
              licensing:
                "All catalog data adheres to open scientific licenses (ESA CC BY-SA 3.0 IGO, NASA Public Domain, CDS Open Access).",
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

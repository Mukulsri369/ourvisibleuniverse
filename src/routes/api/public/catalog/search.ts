import { createFileRoute } from "@tanstack/react-router";
import { AstronomicalDataPipeline } from "@/lib/astronomy/ingestion/pipeline";

export const Route = createFileRoute("/api/public/catalog/search")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const query = url.searchParams.get("q") ?? undefined;
        const objectType = url.searchParams.get("type") ?? undefined;
        const minDistanceStr = url.searchParams.get("minDistance");
        const maxDistanceStr = url.searchParams.get("maxDistance");
        const raStr = url.searchParams.get("ra");
        const decStr = url.searchParams.get("dec");
        const radiusStr = url.searchParams.get("radiusDeg");
        const limitStr = url.searchParams.get("limit");
        const offsetStr = url.searchParams.get("offset");

        let cone: { raDeg: number; decDeg: number; radiusDeg: number } | undefined;
        if (raStr && decStr && radiusStr) {
          cone = {
            raDeg: parseFloat(raStr),
            decDeg: parseFloat(decStr),
            radiusDeg: parseFloat(radiusStr),
          };
        }

        const { results, total } = AstronomicalDataPipeline.search({
          query,
          objectType,
          minDistanceLy: minDistanceStr ? parseFloat(minDistanceStr) : undefined,
          maxDistanceLy: maxDistanceStr ? parseFloat(maxDistanceStr) : undefined,
          cone,
          limit: limitStr ? parseInt(limitStr, 10) : 20,
          offset: offsetStr ? parseInt(offsetStr, 10) : 0,
        });

        return Response.json(
          {
            meta: {
              total,
              returned: results.length,
              query: query ?? null,
              objectType: objectType ?? null,
            },
            data: results,
          },
          {
            headers: {
              "Cache-Control": "public, max-age=300, s-maxage=3600",
              "Access-Control-Allow-Origin": "*",
            },
          },
        );
      },
    },
  },
});

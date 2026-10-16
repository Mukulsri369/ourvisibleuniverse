import { createFileRoute } from "@tanstack/react-router";
import { AstronomicalDataPipeline } from "@/lib/astronomy/ingestion/pipeline";
import { BinaryTileGenerator } from "@/lib/astronomy/ingestion/tile-generator";

export const Route = createFileRoute("/api/public/catalog/tiles")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const tileId = url.searchParams.get("tileId");
        const format = url.searchParams.get("format") ?? "binary";

        // If no tileId provided, list all available spatial tiles
        if (!tileId) {
          const tiles = AstronomicalDataPipeline.listBinaryTiles();
          return Response.json(
            {
              tiles,
              totalTiles: tiles.length,
              description:
                "Hierarchical spatial tiles partitioned across celestial coordinates and distance tiers.",
            },
            {
              headers: {
                "Cache-Control": "public, max-age=300",
                "Access-Control-Allow-Origin": "*",
              },
            },
          );
        }

        const buffer = AstronomicalDataPipeline.getBinaryTile(tileId);
        if (!buffer) {
          return Response.json({ error: `Tile '${tileId}' not found.` }, { status: 404 });
        }

        if (format === "json") {
          const parsed = BinaryTileGenerator.deserializeTile(buffer);
          return Response.json(
            {
              tileId,
              header: {
                magic: parsed.magic,
                version: parsed.version,
                recordCount: parsed.recordCount,
                boundingBox: parsed.boundingBox,
              },
              records: parsed.records,
            },
            {
              headers: {
                "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable",
                "Access-Control-Allow-Origin": "*",
              },
            },
          );
        }

        // Return raw GPU binary buffer
        return new Response(buffer, {
          status: 200,
          headers: {
            "Content-Type": "application/octet-stream",
            "Content-Length": String(buffer.byteLength),
            "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable",
            "Access-Control-Allow-Origin": "*",
            "X-Astronomical-Tile-Id": tileId,
          },
        });
      },
    },
  },
});

import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { NAMED_STARS } from "@/stars/data";
import { NEARBY_GALAXIES } from "@/stars/galaxy-catalog";
import { OBSERVED_OBJECTS } from "@/stars/observed-objects";

export default defineTool({
  name: "get_catalog_entry",
  title: "Get object details",
  description: "Return the full scientific details of one star, galaxy or exotic object by its exact catalog name.",
  inputSchema: { name: z.string().trim().min(1).describe("Exact name as returned by search_catalog.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ name }) => {
    const n = name.toLowerCase();
    const star = NAMED_STARS.find((s) => s.name.toLowerCase() === n);
    if (star) {
      const entry = { kind: "star", name: star.name, spectral: star.spectral, constellation: star.constellation, distanceLy: star.distance, ra: star.ra, dec: star.dec, apparentMagnitude: star.magnitude, absoluteMagnitude: star.absMagnitude, radiusSolar: star.radius, massSolar: star.mass, temperatureK: star.temperature, luminositySolar: star.luminosity, confirmedPlanets: star.planets, description: star.description };
      return { content: [{ type: "text", text: JSON.stringify(entry, null, 2) }], structuredContent: { entry } };
    }
    const g = NEARBY_GALAXIES.find((x) => x.name.toLowerCase() === n);
    if (g) {
      const entry = { kind: "galaxy", name: g.name, type: g.type, distanceLy: g.distance, diameterLy: g.size, galacticL: g.l, galacticB: g.b };
      return { content: [{ type: "text", text: JSON.stringify(entry, null, 2) }], structuredContent: { entry } };
    }
    const o = OBSERVED_OBJECTS.find((x) => [x.name, ...x.aliases].some((a) => a.toLowerCase() === n));
    if (o) {
      const entry = { kind: "object", name: o.name, aliases: [...o.aliases], category: o.category, subtype: o.subtype, distanceLy: o.distance, diameterLy: o.diameterLy, observed: o.observed, properties: [...o.properties], description: o.description, source: o.source };
      return { content: [{ type: "text", text: JSON.stringify(entry, null, 2) }], structuredContent: { entry } };
    }
    throw new ToolError(`No catalog entry named "${name}". Use search_catalog first.`);
  },
});

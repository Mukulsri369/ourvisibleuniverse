import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { NAMED_STARS } from "@/stars/data";
import { NEARBY_GALAXIES } from "@/stars/galaxy-catalog";
import { OBSERVED_OBJECTS } from "@/stars/observed-objects";

export default defineTool({
  name: "search_catalog",
  title: "Search the universe catalog",
  description:
    "Search stars, galaxies and exotic objects (black holes, quasars, pulsars) shown in the 3D universe by name.",
  inputSchema: {
    query: z
      .string()
      .trim()
      .min(1)
      .describe("Part of an object name, e.g. 'Sirius', 'M31', 'Crab'."),
    kind: z
      .enum(["any", "star", "galaxy", "object"])
      .default("any")
      .describe("Restrict to one catalog."),
    limit: z.number().int().min(1).max(50).default(15),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ query, kind, limit }) => {
    const q = query.toLowerCase();
    const results: { kind: string; name: string; summary: string; distanceLy: number }[] = [];
    if (kind === "any" || kind === "star")
      for (const s of NAMED_STARS)
        if (s.name.toLowerCase().includes(q))
          results.push({
            kind: "star",
            name: s.name,
            summary: `${s.spectral} star in ${s.constellation}`,
            distanceLy: s.distance,
          });
    if (kind === "any" || kind === "galaxy")
      for (const g of NEARBY_GALAXIES)
        if (g.name.toLowerCase().includes(q))
          results.push({
            kind: "galaxy",
            name: g.name,
            summary: `${g.type} galaxy`,
            distanceLy: g.distance,
          });
    if (kind === "any" || kind === "object")
      for (const o of OBSERVED_OBJECTS)
        if ([o.name, ...o.aliases].some((n) => n.toLowerCase().includes(q)))
          results.push({
            kind: "object",
            name: o.name,
            summary: `${o.category}: ${o.subtype}`,
            distanceLy: o.distance,
          });
    const top = results.slice(0, limit);
    return {
      content: [
        {
          type: "text",
          text: top.length
            ? top
                .map(
                  (r) =>
                    `${r.name} (${r.kind}) — ${r.summary}, ${r.distanceLy.toLocaleString()} ly`,
                )
                .join("\n")
            : "No matches.",
        },
      ],
      structuredContent: { results: top },
    };
  },
});

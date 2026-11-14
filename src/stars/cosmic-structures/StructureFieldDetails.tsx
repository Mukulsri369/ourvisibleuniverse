import { COSMIC_BENCHMARKS } from "@/lib/astronomy/cosmic-web/survey-catalogs";
import { STRUCTURE_FIELD_BUILD, STRUCTURE_FIELDS } from "./structure-fields.generated";
import { isStructureFieldId } from "./structure-field-ids";

const CATALOGUE_NAMES: Record<string, string> = {
  "2mrs": "2MRS",
  sdss: "SDSS DR17",
  "6dfgs": "6dFGS",
};

/** What the selected structure's field shows, what is measured, and where it comes from. */
export function StructureFieldDetails({ id }: { id: string | null }) {
  const benchmark = COSMIC_BENCHMARKS.find((b) => b.id === id);
  if (!benchmark || !isStructureFieldId(benchmark.id)) return null;
  const field = STRUCTURE_FIELDS[benchmark.id];
  const plotted = Object.entries(field.plottedByCatalogue as Record<string, number>)
    .map(([k, n]) => `${n.toLocaleString()} ${CATALOGUE_NAMES[k] ?? k}`)
    .join(" · ");
  return (
    <div className="space-y-3 rounded-lg border border-white/10 bg-black/30 p-4 text-xs text-slate-300">
      <div>
        <div className="text-sm font-semibold text-white">{benchmark.name}</div>
        <p className="mt-1 leading-relaxed">{benchmark.description}</p>
        <p className="mt-1 text-slate-400">
          About {Math.round(benchmark.distanceGlyPlanck * 1000).toLocaleString()} million
          light-years away · about {benchmark.diameterMly.toLocaleString()} million light-years
          across
        </p>
      </div>
      <div>
        <div className="font-medium text-white">
          {field.galaxies.toLocaleString()} real survey galaxies plotted
        </div>
        <p className="text-slate-400">{plotted}</p>
      </div>
      {field.components.length > 0 && (
        <ul className="space-y-1">
          {field.components.map((c) => (
            <li key={c.name}>
              <span className="text-cyan-200">{c.name}</span>
              <span className="text-slate-400"> — {c.role}</span>
            </li>
          ))}
        </ul>
      )}
      <ul className="list-disc space-y-1 pl-4 text-slate-400">
        {field.notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
        {STRUCTURE_FIELD_BUILD.method.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
      <p className="text-[10px] leading-relaxed text-slate-500">
        Data: {STRUCTURE_FIELD_BUILD.sources.map((s) => s.citation).join("; ")}.
      </p>
    </div>
  );
}

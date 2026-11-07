import type { ObservationalGalaxy } from "./galaxy-catalog";
import { galaxyDistanceLabel, formatGalaxyRedshift } from "./galaxy-measurement-format";
/** Object-specific provenance; no blanket telescope or precision claims. */
export function GalaxyCatalogueFacts({ galaxy: g }: { galaxy: ObservationalGalaxy }) {
  const e = g.catalogueEvidence;
  if (!e) return null;
  const facts = [
    ["Adopted distance", galaxyDistanceLabel(g)],
    ["Distance method", e.distanceMethod],
    [
      "Distance basis",
      e.distanceBasis === "group-adoption"
        ? "Group-adopted estimate"
        : "Individual distance indicator",
    ],
    [
      "Heliocentric radial velocity",
      e.velocityKmS === undefined
        ? "Not supplied"
        : `${e.velocityKmS.toLocaleString("en-US", { maximumFractionDigits: 1 })} km/s${e.velocityErrorKmS === undefined ? "" : ` ± ${Number(e.velocityErrorKmS.toPrecision(3))}`}`,
    ],
    ["Velocity proxy (v/c)", formatGalaxyRedshift(g, 6)],
    [
      "Published morphology",
      `${e.morphology}${e.morphologyUncertain ? " (uncertain classification)" : ""}`,
    ],
    [
      "Angular size definition",
      e.sizeDefinition === "four-half-light-radii-envelope"
        ? `Display envelope: 4 × ${e.halfLightRadiusArcmin?.toPrecision(3)} arcmin major-axis half-light radius`
        : e.sizeDefinition === "Holmberg-or-profile-scale"
          ? "B-band Holmberg isophote or profile scale for very diffuse objects"
          : "B-band Holmberg isophote (~26.5 mag/arcsec²)",
    ],
    [
      "Sky orientation",
      e.positionAngleMeasured
        ? `Major-axis PA ${g.posAngle?.toFixed(1)}° east of north`
        : "Position angle unknown; displayed roll is illustrative",
    ],
    [
      "Association",
      e.group
        ? `${e.group.name} (${e.group.confidence.replaceAll("-", " ")})`
        : "No group membership assigned",
    ],
    ["Coordinate frame", e.coordinateFrame],
    [
      "Angular display envelope",
      `${e.angularMajorArcmin.toPrecision(3)}′ major axis; ${e.axisRatio === undefined ? "minor axis unknown" : `axis ratio ${e.axisRatio.toPrecision(3)}`}`,
    ],
    [
      "Disk inclination",
      e.inclinationBasis === "not-measured"
        ? "Not measured; intrinsic depth is reconstructed"
        : `${g.inclination}° (catalogue axis-ratio estimate)`,
    ],
    ["Catalogue edition", e.edition],
    ["Source row", e.rowName],
  ];
  return (
    <section aria-label="Scientific catalogue details" className="space-y-4 text-sm">
      <dl className="space-y-3">
        {facts.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-neutral-400">{label}</dt>
            <dd className="mt-1 break-words text-neutral-100">{value}</dd>
          </div>
        ))}
      </dl>
      {e.group && <p className="text-xs leading-relaxed text-neutral-300">{e.group.basis}</p>}
      <p className="text-xs leading-relaxed text-neutral-300">{g.uncertaintyNotes}</p>
      <ul className="space-y-2">
        {[...new Set([e.sourceUrl, ...e.references, ...(e.group ? [e.group.source] : [])])].map(
          (url, i) => (
            <li key={url}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center break-all underline underline-offset-4 focus-visible:outline focus-visible:outline-2"
              >
                {i === 0 ? "Catalogue source" : `Scientific reference ${i}`}
              </a>
            </li>
          ),
        )}
      </ul>
    </section>
  );
}

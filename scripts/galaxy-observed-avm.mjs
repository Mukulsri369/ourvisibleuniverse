// Reads Astronomy Visualization Metadata (AVM) spatial fields from an image's XMP packet.
// Usage: node scripts/galaxy-observed-avm.mjs public/textures/galaxies/m81.jpg [...more]
import fs from "node:fs";

const NUMBER_LIST = (text) =>
  text
    .replace(/<[^>]+>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(Number);

/** Returns the AVM spatial registration embedded in a JPEG, or null when absent/incomplete. */
export function readAvm(file) {
  const bytes = fs.readFileSync(file);
  const start = bytes.indexOf("<x:xmpmeta");
  const end = bytes.indexOf("</x:xmpmeta>");
  if (start < 0 || end < 0) return null;
  const xmp = bytes.subarray(start, end).toString("utf8");
  const field = (name) => {
    const escaped = name.replace(".", "\\.");
    const attribute = xmp.match(new RegExp(`avm:${escaped}="([^"]*)"`));
    if (attribute) return attribute[1];
    const element = xmp.match(new RegExp(`<avm:${escaped}>([\\s\\S]*?)</avm:${escaped}>`));
    return element ? element[1] : null;
  };
  const quality = field("Spatial.Quality")
    ?.replace(/<[^>]+>/g, "")
    .trim();
  const frame = field("Spatial.CoordinateFrame")
    ?.replace(/<[^>]+>/g, "")
    .trim();
  const projection = field("Spatial.CoordsystemProjection")
    ?.replace(/<[^>]+>/g, "")
    .trim();
  const values = {
    referenceValue: field("Spatial.ReferenceValue"),
    referencePixel: field("Spatial.ReferencePixel"),
    referenceDimension: field("Spatial.ReferenceDimension"),
    scale: field("Spatial.Scale"),
    rotation: field("Spatial.Rotation"),
  };
  if (Object.values(values).some((v) => v === null)) return null;
  return {
    quality,
    frame,
    projection,
    referenceValue: NUMBER_LIST(values.referenceValue),
    referencePixel: NUMBER_LIST(values.referencePixel),
    referenceDimension: NUMBER_LIST(values.referenceDimension),
    scale: NUMBER_LIST(values.scale),
    rotation: NUMBER_LIST(values.rotation)[0],
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  for (const file of process.argv.slice(2)) console.log(file, JSON.stringify(readAvm(file)));
}

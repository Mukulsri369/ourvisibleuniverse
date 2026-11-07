import fs from "node:fs";
/** Strict readers for the two pinned scientific source formats; never coerce blanks to zero. */
export function readVizierTSV(file) {
  const lines = fs
    .readFileSync(file, "utf8")
    .split(/\r?\n/)
    .filter((l) => l.length > 0 && !l.startsWith("#"));
  if (lines.length < 3) throw Error("Missing TSV schema: " + file);
  const columns = lines[0].split("\t");
  if (new Set(columns).size !== columns.length || !lines[2].startsWith("---"))
    throw Error("Invalid VizieR header");
  return lines
    .slice(3)
    .filter((l) => l.trim())
    .map((line) => {
      const values = line.split("\t");
      if (values.length !== columns.length) throw Error("Truncated TSV row in " + file);
      return Object.fromEntries(columns.map((key, i) => [key, values[i].trim()]));
    });
}
export const numeric = (value) =>
  value === undefined || value === null || String(value).trim() === ""
    ? null
    : Number.isFinite(Number(value))
      ? Number(value)
      : null;
export function readFitsTable(file) {
  const buffer = fs.readFileSync(file);
  let offset = 0;
  while (offset < buffer.length) {
    const header = {};
    let end = offset;
    while (end + 80 <= buffer.length) {
      const card = buffer.toString("ascii", end, end + 80),
        key = card.slice(0, 8).trim();
      end += 80;
      if (key === "END") break;
      if (card[8] !== "=") continue;
      const raw = card.slice(10).trim();
      header[key] = raw.startsWith("'")
        ? raw.slice(1, raw.indexOf("'", 1)).trim()
        : raw.split("/")[0].trim();
    }
    const dataStart = Math.ceil(end / 2880) * 2880;
    if (header.XTENSION === "BINTABLE") {
      const columns = [];
      let width = 0;
      for (let i = 1; i <= Number(header.TFIELDS); i++) {
        const match = header["TFORM" + i]?.match(/^(\d*)([AEIDJ])$/);
        if (!match) throw Error("Unsupported FITS column " + header["TFORM" + i]);
        const repeat = Number(match[1] || 1),
          type = match[2],
          bytes = { A: 1, E: 4, I: 2, D: 8, J: 4 }[type] * repeat;
        if (type !== "A" && repeat !== 1) throw Error("Unexpected FITS numeric array");
        columns.push({
          name: header["TTYPE" + i],
          type,
          repeat,
          offset: width,
          nullValue: header["TNULL" + i],
        });
        width += bytes;
      }
      if (width !== Number(header.NAXIS1)) throw Error("FITS row width mismatch");
      const count = Number(header.NAXIS2);
      if (dataStart + width * count > buffer.length) throw Error("Truncated FITS table");
      return Array.from({ length: count }, (_, row) =>
        Object.fromEntries(
          columns.map((c) => {
            const at = dataStart + row * width + c.offset;
            let value =
              c.type === "A"
                ? buffer
                    .toString("ascii", at, at + c.repeat)
                    .replace(/\0/g, "")
                    .trim()
                : c.type === "E"
                  ? buffer.readFloatBE(at)
                  : c.type === "D"
                    ? buffer.readDoubleBE(at)
                    : c.type === "I"
                      ? buffer.readInt16BE(at)
                      : buffer.readInt32BE(at);
            if (
              typeof value === "number" &&
              (!Number.isFinite(value) ||
                (c.nullValue !== undefined && value === Number(c.nullValue)))
            )
              value = null;
            return [c.name, value];
          }),
        ),
      );
    }
    let size = Number(header.NAXIS) > 0 ? Math.abs(Number(header.BITPIX)) / 8 : 0;
    for (let i = 1; i <= Number(header.NAXIS); i++) size *= Number(header["NAXIS" + i]);
    offset = dataStart + Math.ceil(size / 2880) * 2880;
  }
  throw Error("FITS BINTABLE absent");
}

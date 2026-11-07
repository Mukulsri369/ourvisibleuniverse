/** The documented July 2026 NED API returns VOTable 1.5, not TAP JSON. */
export function parseNedOverview(xml: string): Record<string, unknown> {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  if (doc.getElementsByTagName("parsererror").length) throw Error("Invalid NED XML");
  const elements = (root: Document | Element, name: string) =>
    Array.from(root.getElementsByTagNameNS("*", name));
  const status = elements(doc, "PARAM")
    .find((e) => e.getAttribute("name") === "QUERY_STATUS")
    ?.getAttribute("value");
  if (status !== "OK") throw Error("NED query did not return an OK status");
  const tables = elements(doc, "TABLE").map((table) => {
    const fields = elements(table, "FIELD").map((f) => ({
      id: f.getAttribute("ID") ?? f.getAttribute("name") ?? "",
      name: f.getAttribute("name"),
      unit: f.getAttribute("unit"),
      datatype: f.getAttribute("datatype"),
    }));
    const rows = elements(table, "TR").map((row) => {
      const cells = elements(row, "TD");
      if (cells.length !== fields.length) throw Error("NED row/schema mismatch");
      return Object.fromEntries(
        fields.map((field, i) => {
          const text = cells[i].textContent?.trim() ?? "";
          const value =
            text === ""
              ? null
              : /^(double|float|int|long|short)$/.test(field.datatype ?? "")
                ? Number(text)
                : text;
          if (typeof value === "number" && !Number.isFinite(value))
            throw Error("Invalid NED numeric field");
          return [field.id, value];
        }),
      );
    });
    return { name: table.getAttribute("name"), fields, rows };
  });
  if (!tables.some((t) => t.rows.length)) throw Error("NED returned no tabular object");
  return { format: "IVOA VOTable 1.5", tables };
}

type ClientErrorReport = { at: number; kind: string; boundary: "root" };
const reports: ClientErrorReport[] = [];

/** Keep minimal diagnostics locally, without transmitting URLs, error bodies or credentials. */
export function reportClientError(error: unknown) {
  if (typeof window === "undefined") return;
  const kind =
    error instanceof Error && /^[A-Za-z][A-Za-z0-9]{0,60}$/.test(error.name) ? error.name : "Error";
  const report: ClientErrorReport = { at: Date.now(), kind, boundary: "root" };
  reports.push(report);
  if (reports.length > 50) reports.shift();
  console.error("Application error", report);
}
export function clientErrorReports(): readonly ClientErrorReport[] {
  return reports.map((report) => ({ ...report }));
}

import path from "node:path";
import { pathToFileURL } from "node:url";
export const { chromium } = await import(
  process.env.OVU_PLAYWRIGHT_MODULE
    ? pathToFileURL(path.resolve(process.env.OVU_PLAYWRIGHT_MODULE)).href
    : "playwright"
);
export const origin = process.env.OVU_QA_ORIGIN || "http://127.0.0.1:31755";
export const browserOptions = {
  channel: "chrome",
  headless: true,
  args: ["--disable-background-timer-throttling", "--disable-renderer-backgrounding"],
};
export function captureErrors(page) {
  const errors = { page: [], console: [], responses: [], failures: [] };
  page.on("pageerror", (e) => errors.page.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.console.push(m.text());
  });
  page.on("response", (r) => {
    if (r.status() >= 400) errors.responses.push({ status: r.status(), url: r.url() });
  });
  page.on("requestfailed", (request) =>
    errors.failures.push({ url: request.url(), error: request.failure()?.errorText }),
  );
  return errors;
}

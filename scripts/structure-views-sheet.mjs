// Contact sheet of structure-view captures: node scripts/structure-views-sheet.mjs <label> [views=earth,side]
// Writes .taste-skill/structure-views/<label>/sheet.png (ignored by Git).
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const playwright = await import(
  process.env.OVU_PLAYWRIGHT_MODULE
    ? pathToFileURL(path.resolve(process.env.OVU_PLAYWRIGHT_MODULE)).href
    : "playwright"
);
const chromium = playwright.chromium ?? playwright.default.chromium;
const [label, viewList = "earth,side"] = process.argv.slice(2);
const dir = path.resolve(".taste-skill/structure-views", label);
const views = viewList.split(",");
const ids = [
  ...new Set(
    fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".png") && f !== "sheet.png")
      .map((f) => f.replace(/-[a-z]+\.png$/, "")),
  ),
];
const cell = (id, view) => {
  const file = path.join(dir, `${id}-${view}.png`);
  return fs.existsSync(file)
    ? `<figure><img src="data:image/png;base64,${fs.readFileSync(file).toString("base64")}"><figcaption>${id} · ${view}</figcaption></figure>`
    : "<figure></figure>";
};
const html = `<!doctype html><style>
body{margin:0;background:#000;font:12px system-ui;color:#ffd}
main{display:grid;grid-template-columns:repeat(${views.length},480px);gap:4px}
figure{margin:0;position:relative}img{width:480px;height:300px;display:block}
figcaption{position:absolute;left:6px;top:4px;text-shadow:0 0 3px #000}</style>
<main>${ids.map((id) => views.map((v) => cell(id, v)).join("")).join("")}</main>`;
const page = await (
  await chromium.launch({ headless: true, channel: process.env.OVU_BROWSER_CHANNEL ?? "msedge" })
).newPage({
  viewport: { width: views.length * 484, height: 300 },
});
await page.setContent(html, { waitUntil: "load" });
const out = path.join(dir, "sheet.png");
await page.screenshot({ path: out, fullPage: true });
await page.context().browser().close();
console.log(out);

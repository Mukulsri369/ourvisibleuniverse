/**
 * Captures look-dev renders and writes each next to its registered telescope image.
 *
 *   node scripts/galaxy-lookdev/capture.mjs --out <dir> [--galaxies m51,m81] [--views earth,faceon] [--optics] [--software] [--bake-timeout ms]
 *   node scripts/galaxy-lookdev/capture.mjs --out <dir> --recompute   (rebuild sheets and
 *     indicators from the saved <key>-<view>[-optics]-render.png files, without re-rendering)
 *
 * Requires the loopback QA server: npx vite --config scripts/nearby-qa/vite.config.mts
 * Uses OVU_PLAYWRIGHT_MODULE / OVU_QA_ORIGIN like scripts/nearby-qa/browser-tools.mjs.
 * Software-rendered (SwiftShader) captures are valid for appearance only, not speed.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const { chromium } = await import(
  process.env.OVU_PLAYWRIGHT_MODULE
    ? pathToFileURL(path.resolve(process.env.OVU_PLAYWRIGHT_MODULE)).href
    : "playwright"
);
const origin = process.env.OVU_QA_ORIGIN || "http://127.0.0.1:31755";
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : fallback;
};
const out = path.resolve(arg("out", "lookdev-out"));
const galaxies = arg("galaxies", "m51,m81,m101,m104,m33,catalog-ngc-1300").split(",");
const views = arg("views", "earth").split(",");
const optics = process.argv.includes("--optics");
const settleMs = Number(arg("settle", "9000"));
// Software rendering can take several minutes to bake a procedural disk map.
const bakeTimeoutMs = Number(arg("bake-timeout", "240000"));
const recompute = process.argv.includes("--recompute");
fs.mkdirSync(out, { recursive: true });

/**
 * Rotation-invariant appearance indicators for every <img> on the sheet, centred on
 * the brightest smoothed peak. They compare a render with its telescope image, or a
 * render before and after a change. Crops, companions and foreground stars differ
 * between frames, so read them as indicators, never as pass/fail science values.
 */
function imageMetrics() {
  const lin = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const out = {};
  for (const [index, img] of [...document.images].entries()) {
    const scale = 512 / Math.max(img.naturalWidth, img.naturalHeight);
    const w = Math.round(img.naturalWidth * scale),
      h = Math.round(img.naturalHeight * scale);
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d", { willReadFrequently: true });
    g.drawImage(img, 0, 0, w, h);
    const d = g.getImageData(0, 0, w, h).data;
    const n = w * h,
      L = new Float32Array(n),
      sat = new Float32Array(n),
      br = new Float32Array(n),
      pink = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      const r = d[i * 4] / 255,
        gg = d[i * 4 + 1] / 255,
        b = d[i * 4 + 2] / 255;
      L[i] = 0.2126 * lin(r) + 0.7152 * lin(gg) + 0.0722 * lin(b);
      const mx = Math.max(r, gg, b),
        mn = Math.min(r, gg, b);
      sat[i] = mx > 0 ? (mx - mn) / mx : 0;
      br[i] = (b + 0.02) / (r + 0.02);
      pink[i] = r > gg * 1.25 && b > gg * 0.95 && sat[i] > 0.25 ? 1 : 0;
    }
    const blur = (src, radius) => {
      const tmp = new Float32Array(n),
        dst = new Float32Array(n);
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
          let s = 0,
            k = 0;
          for (let o = -radius; o <= radius; o++) {
            const xx = x + o;
            if (xx >= 0 && xx < w) ((s += src[y * w + xx]), k++);
          }
          tmp[y * w + x] = s / k;
        }
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
          let s = 0,
            k = 0;
          for (let o = -radius; o <= radius; o++) {
            const yy = y + o;
            if (yy >= 0 && yy < h) ((s += tmp[yy * w + x]), k++);
          }
          dst[y * w + x] = s / k;
        }
      return dst;
    };
    const smooth = blur(L, 4),
      fine = blur(L, 1),
      broad = blur(L, 8),
      broadBr = blur(br, 8);
    let peak = 0;
    for (let i = 1; i < n; i++) if (smooth[i] > smooth[peak]) peak = i;
    const cx = peak % w,
      cy = Math.floor(peak / w);
    const sorted = Float32Array.from(L).sort();
    const floor = sorted[Math.floor(n * 0.995)] * 0.02;
    // Light-weighted cumulative profile from the peak.
    const rows = [];
    let total = 0;
    for (let i = 0; i < n; i++)
      if (L[i] > floor) {
        const r = Math.hypot((i % w) - cx, Math.floor(i / w) - cy);
        rows.push([r, L[i], i]);
        total += L[i];
      }
    rows.sort((a, b) => a[0] - b[0]);
    const radiusAt = (f) => {
      let acc = 0;
      for (const [r, l] of rows) if ((acc += l) >= f * total) return r;
      return rows.at(-1)?.[0] ?? 0;
    };
    const r20 = Math.max(1, radiusAt(0.2)),
      r50 = radiusAt(0.5),
      r80 = radiusAt(0.8);
    const mean = (pred, arr) => {
      let s = 0,
        k = 0;
      for (const [r, , i] of rows) if (pred(r, i)) ((s += arr[i]), k++);
      return k ? s / k : 0;
    };
    let fineEnergy = 0,
      lum = 0,
      dark = 0,
      inside = 0,
      pinkCount = 0;
    for (const [r, l, i] of rows) {
      lum += l;
      // Band-pass (about 2–8 px at 512 px): clumps, knots and lanes, not single star pixels.
      fineEnergy += Math.abs(fine[i] - smooth[i]);
      pinkCount += pink[i];
      if (r < r80) {
        inside++;
        // Dust lanes are darker AND redder than their surroundings; plain gaps are not.
        if (L[i] < 0.6 * broad[i] && br[i] < 0.9 * broadBr[i]) dark++;
      }
    }
    const round = (v) => Math.round(v * 1000) / 1000;
    out[index === 0 ? "render" : "reference"] = {
      /** Mean HSV saturation of galaxy pixels; grey renders score low. */
      saturation: round(mean(() => true, sat)),
      /** Blue/red of the outer disk (r50–r80) divided by the core (< r20); >1 = bluer disk. */
      colourGradient: round(
        mean((r) => r > r50 && r < r80, br) /
          Math.max(
            1e-6,
            mean((r) => r < r20, br),
          ),
      ),
      /** C = 5 log10(r80/r20), the photometric concentration index. */
      concentration: round(5 * Math.log10(Math.max(1, r80) / r20)),
      /** Mid-scale (clump/lane) contrast relative to light; smooth tubes score low. */
      fineStructure: round(fineEnergy / Math.max(1e-9, lum)),
      /** Share of pixels inside r80 darker than 0.6× and redder than their surroundings (dust). */
      darkLaneFraction: round(dark / Math.max(1, inside)),
      /** Share of galaxy pixels with H II-like pink/magenta colour. */
      pinkFraction: round(pinkCount / Math.max(1, rows.length)),
    };
  }
  return out;
}
// `--software` forces SwiftShader for GPU-less cloud or CI machines; omit it on a
// workstation so the captures use its GPU. `OVU_QA_CHANNEL=chrome` selects system Chrome.
const browser = await chromium.launch({
  headless: true,
  ...(process.env.OVU_QA_CHANNEL ? { channel: process.env.OVU_QA_CHANNEL } : {}),
  args: process.argv.includes("--software")
    ? ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]
    : ["--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 900, height: 900 }, deviceScaleFactor: 1 });
page.setDefaultTimeout(120000);
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
/** Loads the look-dev page; returns the registered reference once the page is ready. */
async function openLookdev(key, view, waitForBake) {
  const url = `${origin}/scripts/galaxy-lookdev/index.html?galaxy=${key}&view=${view}${optics ? "&optics=1" : ""}`;
  await page.goto(url, { waitUntil: "load" });
  await page.waitForFunction(() => window.__galaxyLookdev?.ready, null, { timeout: 60000 });
  if (waitForBake) {
    // Wait for the progressive density-cache bake, then let exposure settle.
    await page.waitForFunction(() => window.__galaxyLookdev.cacheFade() > 0.97, null, {
      timeout: bakeTimeoutMs,
      polling: 1000,
    });
    await page.waitForTimeout(settleMs);
  }
  return page.evaluate(() => window.__galaxyLookdev.reference);
}

/** Writes the side-by-side sheet and the indicator JSON for one render. */
async function composeSheet(stem, renderUri, ref, key, view) {
  // A clockwise CSS rotation by the AVM rotation puts north up for east-left
  // frames; checked with M51, whose companion NGC 5195 lies north. East-right
  // (mirrored) frames are un-mirrored first; that branch is not yet checked
  // against a landmark.
  const refTransform = ref
    ? ref.mirrored
      ? `rotate(${-ref.rotation}deg) scaleX(-1)`
      : `rotate(${ref.rotation}deg)`
    : "";
  const html = `<body style="margin:0;background:#000;display:flex;gap:8px;font:12px sans-serif;color:#aaa">
      <figure style="margin:0"><img src="${renderUri}" style="width:600px;height:600px;object-fit:contain;display:block"><figcaption>OVU reconstruction · ${key} · ${view}${optics ? " · optics" : ""}</figcaption></figure>
      ${ref ? `<figure style="margin:0;overflow:hidden"><img src="${origin}${ref.url}" style="width:600px;height:600px;object-fit:contain;display:block;background:#000;transform:${refTransform}"><figcaption style="position:relative;background:#000">Telescope image, north up (${ref.light}; credits in public/textures/galaxies/CREDITS.md)</figcaption></figure>` : ""}
    </body>`;
  const sheet = await browser.newPage({ viewport: { width: ref ? 1208 : 600, height: 620 } });
  // Same-origin document, so the reference image can be read back for metrics.
  await sheet.goto(`${origin}/textures/galaxies/CREDITS.md`);
  await sheet.setContent(html, { waitUntil: "networkidle" });
  await sheet.screenshot({ path: `${stem}.png` });
  const metrics = await sheet.evaluate(imageMetrics);
  fs.writeFileSync(`${stem}.json`, JSON.stringify({ key, view, optics, ...metrics }, null, 2));
  await sheet.close();
  console.log("wrote", `${stem}.png`, JSON.stringify(metrics));
}

for (const key of galaxies) {
  for (const view of views) {
    const stem = path.join(out, `${key}-${view}${optics ? "-optics" : ""}`);
    let renderUri;
    let ref;
    if (recompute) {
      if (!fs.existsSync(`${stem}-render.png`)) {
        console.log("skip (no saved render)", `${stem}-render.png`);
        continue;
      }
      ref = await openLookdev(key, view, false);
      renderUri = `data:image/png;base64,${fs.readFileSync(`${stem}-render.png`).toString("base64")}`;
    } else {
      ref = await openLookdev(key, view, true);
      // preserveDrawingBuffer keeps the last frame; reading it avoids waiting for a
      // compositor screenshot, which can time out under software rendering.
      renderUri = await page.evaluate(() =>
        document.querySelector("canvas").toDataURL("image/png"),
      );
      fs.writeFileSync(`${stem}-render.png`, Buffer.from(renderUri.split(",")[1], "base64"));
    }
    // Stop the continuous software-rendered frame loop before composing the sheet.
    await page.goto("about:blank");
    await composeSheet(stem, renderUri, ref, key, view);
  }
}
await browser.close();
if (errors.length) console.log("page errors:", [...new Set(errors)].slice(0, 10));

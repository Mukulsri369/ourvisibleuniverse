import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium, origin, browserOptions, captureErrors } from "./nearby-qa/browser-tools.mjs";
fs.mkdirSync(".taste-skill/nearby-qa", { recursive: true });
const browser = await chromium.launch(browserOptions),
  results = [];
try {
  for (const viewport of [
    { width: 1280, height: 720 },
    { width: 390, height: 844 },
  ]) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1, reducedMotion: "reduce" }),
      errors = captureErrors(page);
    const ensureMap = async () => {
      if (!(await page.getByLabel("Galaxy explorer map").isVisible()))
        await page.getByRole("button", { name: "Open explorer map" }).click();
    };
    await page.goto(origin + "/scripts/nearby-qa/navigation.html");
    await page.getByLabel("Galaxy explorer map").waitFor({ timeout: 60000 });
    await page.getByText("Nearby galaxies · filters", { exact: true }).click();
    const groups = await page.getByLabel("Galaxy association").locator("option").count();
    assert(groups > 5);
    await page.getByLabel("Galaxy distance range").selectOption("30-100");
    assert.match(await page.getByRole("status").textContent(), /\d+ galaxies · nearest first/);
    await page.getByLabel("Galaxy morphology").selectOption("dwarf");
    await page.getByText("No galaxies match these filters.").waitFor();
    await page.getByLabel("Galaxy morphology").selectOption("all");
    await page.getByLabel("Galaxy distance range").selectOption("all");
    await page.getByLabel("Galaxy association").selectOption("M31 subgroup");
    assert.match(await page.getByRole("status").textContent(), /[1-9]\d* galaxies/);
    await page.screenshot({ path: `.taste-skill/nearby-qa/discovery-${viewport.width}.png` });
    await page.getByLabel("Galaxy association").selectOption("all");
    await page.getByLabel("Featured destinations", { exact: true }).check();
    assert(await page.getByRole("status").textContent());
    await page.getByLabel("Featured destinations", { exact: true }).uncheck();
    await page.getByText("Nearby galaxies · filters", { exact: true }).click();
    const visits = [];
    for (const alias of ["UGC12894", "And IX", "NGC1311"]) {
      const search = page.getByLabel("Search the explorer");
      await search.fill(alias);
      const name = await page.evaluate(async (alias) => {
        const { getGalaxyByAnyName } = await import("/src/stars/galaxy-catalog.ts");
        return getGalaxyByAnyName(alias).name;
      }, alias);
      await page
        .getByLabel("Explorer search results")
        .getByRole("button")
        .filter({ hasText: name })
        .first()
        .click();
      assert.equal(
        await page.evaluate(() => window.__nearbyNavigation.useExploration.getState().phase),
        "outside",
      );
      await page.getByRole("button", { name: "Minimize explorer map" }).click();
      await page
        .getByRole("button", { name: "View information about " + name, exact: true })
        .click();
      await page.getByRole("button", { name: "Science", exact: true }).click();
      await page.getByLabel("Scientific catalogue details").waitFor();
      if (viewport.width < 640)
        assert(
          !(await page.getByRole("button", { name: "Open explorer map" }).isVisible()),
          "Mobile shortcuts must not cover the information panel",
        );
      if (alias === "And IX")
        assert(
          !(await page.getByLabel("Scientific catalogue details").innerText()).includes(
            "209.39999",
          ),
          "Published velocity must not expose FITS floating point artifacts",
        );
      assert.match(
        await page.getByLabel("Scientific catalogue details").innerText(),
        /Catalogue edition|Source row/,
      );
      if (alias === "And IX")
        assert.match(await page.getByLabel("Scientific catalogue details").innerText(), /four|4 ×/);
      await page.screenshot({
        path: `.taste-skill/nearby-qa/details-${viewport.width}-${alias.replace(/\W/g, "")}.png`,
      });
      await page.getByRole("button", { name: "Hide panel", exact: true }).click();
      await ensureMap();
      await page
        .getByRole("button", { name: /^Visit galaxy/ })
        .last()
        .click();
      await page.waitForFunction(
        () => window.__nearbyNavigation.useExploration.getState().phase === "inside",
        { timeout: 60000 },
      );
      const inside = await page.evaluate(() => {
        const { scene, camera, useExploration } = window.__nearbyNavigation;
        let previews = 0,
          volumes = 0;
        scene.traverse((o) => {
          if (o.name.startsWith("galaxy-catalog-3d:")) previews++;
          if (o.name.startsWith("galaxy-radiance:")) volumes++;
        });
        return {
          host: useExploration.getState().galaxy,
          camera: camera.position.toArray(),
          previews,
          volumes,
        };
      });
      assert.equal(inside.host, name);
      assert(inside.camera.every(Number.isFinite));
      assert(inside.previews <= (viewport.width < 640 ? 5 : 9));
      assert(inside.volumes <= 3);
      visits.push({ alias, name, ...inside });
      await ensureMap();
      if (alias === "NGC1311") {
        await page.evaluate(async () => {
          const { exploreGalaxyAssociation } = await import("/src/stars/exploration-navigation.ts");
          exploreGalaxyAssociation("Virgo Cluster", [0, 54_000_000, 0]);
        });
        const dialog = page.getByRole("dialog");
        await dialog.getByText("Exit this galaxy first", { exact: true }).waitFor();
        assert.equal(
          await page.evaluate(() => window.__nearbyNavigation.useExploration.getState().phase),
          "inside",
        );
        await dialog.getByRole("button", { name: "Exit galaxy", exact: true }).click();
      } else await page.getByRole("button", { name: "Exit galaxy", exact: true }).click();
      await page.waitForFunction(
        () => window.__nearbyNavigation.useExploration.getState().phase === "outside",
        { timeout: 60000 },
      );
      assert.equal(
        await page.evaluate(() => window.__nearbyNavigation.useExploration.getState().queued),
        null,
      );
      await ensureMap();
      if (alias === "NGC1311") {
        await page.waitForFunction(
          () =>
            document.querySelector('[aria-label="Galaxy association"]').value === "Virgo Cluster",
        );
        assert.equal(
          await page.evaluate(() => window.__nearbyNavigation.useStore.getState().visitGalaxy),
          null,
        );
      }
    }
    // Current NED parser: namespaced schema, zero and missing values, provider failure.
    const ned = await page.evaluate(async () => {
      const { parseNedOverview } = await import("/src/stars/ned-votable.ts");
      const xml =
        '<VOTABLE xmlns="http://www.ivoa.net/xml/VOTable/v1.3"><RESOURCE><PARAM name="QUERY_STATUS" value="OK"/><TABLE><FIELD ID="v" datatype="double"/><FIELD ID="empty" datatype="double"/><DATA><TABLEDATA><TR><TD>0</TD><TD/></TR></TABLEDATA></DATA></TABLE></RESOURCE></VOTABLE>';
      const parsed = parseNedOverview(xml);
      let rejected = false;
      try {
        parseNedOverview("<broken>");
      } catch {
        rejected = true;
      }
      return { parsed, rejected };
    });
    assert.equal(ned.parsed.tables[0].rows[0].v, 0);
    assert.equal(ned.parsed.tables[0].rows[0].empty, null);
    assert(ned.rejected);
    await page.route("https://ned.ipac.caltech.edu/**", (route) => route.abort());
    const fallback = await page.evaluate(async () => {
      const { queryNedOverview } = await import("/src/stars/galaxy-catalog.ts");
      return queryNedOverview("UGC12894", 500);
    });
    assert(fallback.success);
    assert.match(fallback.source, /Local atlas fallback/);
    const pageWidth = await page.evaluate(() => ({
      width: innerWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    assert(pageWidth.scroll <= pageWidth.width);
    assert.equal(errors.page.length, 0);
    assert(!errors.console.some((e) => /WebGL|shader|THREE\.WebGLProgram/i.test(e)));
    results.push({ viewport, visits, groups, errors });
    await page.close();
  }
  fs.writeFileSync(
    "docs/nearby-galaxy-browser-results.json",
    JSON.stringify(
      {
        kind: "Isolated actual React/camera/render components; not authenticated full app",
        results,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    "PASS: responsive filters, aliases, details, preview, real camera entry/exit/re-entry, bounded resources, NED null/outage handling",
  );
} finally {
  await browser.close();
}

# Galaxy interiors as stars, no star crosses, per-object time (15 November 2026)

## Request

The owner asked for three changes:

1. Remove the old "+"-shaped crosses on the stars near the Sun without changing any star.
2. Inside spiral and irregular galaxies, show millions of stars as in reality, with no fake glow or dust carried over from the exterior look.
3. Run every object at normal time, keep the Solar System at its current default, and make the Time control change only the selected object.

## 1. Star crosses removed

- **Cause:** `makeAntiAliasedStarTexture` (`src/stars/color-science.ts`) drew four diffraction spikes plus a fainter diagonal pair into the Gaia star-field sprite (`StarField.tsx`). The `diffractionSpikesEnabled` store flag was on by default.
- **Change:**
  - The spike drawing is deleted. The halo and the Airy core are unchanged, so star positions, colours, sizes and brightness stay the same.
  - The store flag and toggle are removed, along with the Optics panel switch and the Rendering Benchmark list line.
- **Check:** the rendered sprite has the same opacity on its axis and its diagonal at equal radius (10/10 at 60 px, 3/2 at 90 px). See [star-sprite-after.jpg](galaxy-interior-stars-20261115/star-sprite-after.jpg).

## 2. Galaxy interiors

**Diagnosis** (same poses, before the change; [m51-inside-before](galaxy-interior-stars-20261115/m51-inside-before.jpg), [lmc-inside-before](galaxy-interior-stars-20261115/lmc-inside-before.jpg)):

- Interiors were the exterior volume at 8× gain: brown fog with few stars.
- One 40k-star tile stood in for the resolved stars.
- The mid-plane "sheet" that keeps H II and dust sharp from outside became flat pink pancakes from inside.
- Association points showed as flat discs.

**Changes (rendering only; no catalogue, orientation or host value changed; the Milky Way is untouched):**

- **Nested resolved-star levels** (`GalaxyInteriorField.tsx`). These replace the single tile.
  - Tiles start at 1,300 ly. Each level is 4× wider, with stars 16× as luminous and an inverse-square flux, so every level shows the same apparent-brightness mix. Up to five levels reach the whole galaxy.
  - Levels much wider than the thin disk place their stars in the disk (sech² heights at the local scale height) instead of in empty cube volume.
  - Stars follow the maps (arms, vertical profile, spheroid) and are dimmed by the dust column.
  - Hot O/B stars crowd the young arms.
  - Each level fades in where the level inside it fades out. Faint stars are culled before rasterising.
  - Stars per level by quality tier: 90k performance, 220k standard, 360k scientific-high.
  - Nearby stars show parallax as you move.
  - Association points hand over to the resolved levels during the reveal.
- **Band resolved into stars** (`galaxy-volume-shader.ts`, `bandStars`).
  - The bright band's light becomes point stars: one candidate per sky cell about 1.6 px wide, present with a probability that rises with the band's light. Brightness follows a heavy-tailed draw with mean 1.
  - The band keeps its mean light, star clouds and dark lanes; the faint sky between bands keeps no fog.
  - The grid is a cube map of directions fixed in the galaxy: distant stars, no parallax.
- **Volume once inside:**
  - Nearby light is mostly resolved, so the glow keeps 20% at the eye, rising to 100% by 0.45 disk radii.
  - The flattened H II/dust sheet is off.
  - The glow is 35% less saturated, so faint orange no longer reads as brown fog.
- **Exterior views:** unchanged. The exterior code paths are gated by `uReveal`/`uExteriorView`; an M51 front view matches the pinned control visually.

**Evidence** (headless Edge, AMD integrated GPU):

- After views: [m51-inside-after](galaxy-interior-stars-20261115/m51-inside-after.jpg), [lmc-inside-after](galaxy-interior-stars-20261115/lmc-inside-after.jpg).
- Mid-entry above the disk: [before](galaxy-interior-stars-20261115/m51-entry-before.jpg) and [after](galaxy-interior-stars-20261115/m51-entry-after.jpg).

**Cost** (pinned `HEAD` control on port 31757, 1280×800 at DPR 2, optics off, 8 s means, two interleaved rounds):

| Pose | Control | Change |
| --- | --- | --- |
| M51 interior | 146 / 146 ms | 156 / 125 ms (within noise) |
| LMC interior | 163 / 153 ms | 182 / 182 ms (about 12–19% slower) |

This is a stress mode on one loaded integrated GPU, not a frame-rate claim.

**Limits:**

- Stars are representative, not measured.
- A faint diagonal moiré in the LMC's glow predates this change.
- Not checked: an authenticated full-app run, the flight in motion frame by frame, other GPUs and phones.

## 3. Per-object time

- **Clocks** (`sim-clock.ts`):
  - The Solar System keeps its clock (`systemSpeed`, default 7 days/s), which drives planets, moons, the Sun and its Galactic drift.
  - Every other object runs at real time (`NORMAL_TIME_RATE`, 1 s/s) unless `store.objectTimeRates[key]` sets its own rate.
  - Per-object offsets are integrated, so changing a rate never jumps an object's phase.
- **Keys:**
  - Observed objects (black holes, pulsars, quasars, catalogue stars) use their catalogue id.
  - Exoplanet systems use their star's name.
  - Galaxies use their name. Systems hosted in other galaxies, including Andromeda's, share their galaxy's time.
  - The Milky Way's differential rotation uses "Milky Way".
- **Time control** (Settings): it now reads "Time · <object>" and sets only `timeTargetKey()`.
  - The target is the most specific selection: exoplanet visit, Solar System planet (or a hosted galaxy's planet → that galaxy), observed object, star (the Sun → Solar System), visited or entered galaxy, otherwise the Solar System.
  - "Default" is 7 days/s for the Solar System and real time for everything else.
- **Consequence:** at real time, animations driven by display units (accretion-flow texture, pulsar rotors, galaxy rotation, star granulation, exoplanet orbits) are effectively still until the user raises that object's time. To pick a different "normal", change the single constant `NORMAL_TIME_RATE`.
- **Test:** `scripts/galaxy-experience-validation.ts` now checks the following: real-time objects; a rate set for one object changes only it, with no phase jump; the Solar System clock is unaffected.

## Checks run

- `npx tsc --noEmit`, Prettier, and ESLint on the changed files (0 errors; 3 existing fast-refresh warnings).
- `tsx scripts/galaxy-experience-validation.ts`.
- `test:` suites: `galaxy-disk-layer`, `galaxies`, `galaxy-entry`, `galaxy-observed`, `galaxy-populations`, `galaxy-clarity`, `galaxy-explorer`, `galaxy-landmarks`, `galaxy-empty-space`, `scene-depth`, `rendering`, `visual`, `navigation`, `3d`, `solar-controls`, `solar-galactic-motion`, `exploration-camera`, `black-holes`, `compact`, `object-rendering`, `nebulae`, `nebula-journey`. All passed.

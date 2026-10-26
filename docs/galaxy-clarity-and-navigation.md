# Galaxy clarity, exclusive layers and interior travel

## Rendering changes

The former near view evaluated multiple noise fields and galaxy populations at every ray sample, cut thin disks against a rectangular integration interval, and mixed a projected photograph into the ray. Emissivity remained nonzero at the box boundary. This made the selected galaxy look like a blurry rectangular patch and kept a luminous veil inside.

The replacement has one presentation owner per detailed galaxy. A full-resolution observed exterior is used where a whole-galaxy reference exists. Its diffuse footprint masks the surrounding photographic frame. On deliberate orbit inspection it blends to the reconstructed volume; entry progressively hands over to the volume and individual stars. The photographed plane is entirely hidden inside. Unresolved sources retain labelled morphology-based reconstructions; a photograph of another galaxy is never substituted.

Stellar emission and dust are baked in three GPU slices per frame to one 128×256×128 RGBA half-float texture (80×160×80 for performance). Each ray sample then reads the cache once. Bake state restores renderer target, layer, viewport and scissor. Native-resolution rays use 24/32/48 samples by quality tier. Background Milky Way/Andromeda caches do not allocate GPU targets before they become visible. Caches are disposed with their owning selected galaxy. There are no production GPU readbacks.

All reconstructed populations have compact support before the box boundary. Centaurus A has an elliptical stellar spheroid and a separate warped absorbing dust lane, rather than the old lenticular spiral pattern. Its optical diameter is approximately 97,186 ly, calculated from the catalogue’s 25.7 arcmin major axis and 13 Mly distance; these observed inputs have uncertainty. The image framing accounts for ESO’s 33.87 arcmin field of view.

Centaurus A’s old 1460×1130 asset and preview were overwritten by the 4000×3912 ESO observation. Full-galaxy observations of M33, LMC and SMC were added with their credits. The reference set now contains 16 images. Infrared/composite colours are mapped instrument bands, not an assertion of naked-eye colour. Elliptical galaxies physically have smooth light distributions; they are not given invented spiral arms or dust structures to make them look sharper.

The old 1,200-glint near field and embedded ray-photo projection were removed. Named atlas portraits fade out when the detailed owner takes over. The small local Milky Way background and its far portrait are suppressed while its entered population is active. Six conservative named/survey coincidences are suppressed in the 2MRS renderer and picker, while raw survey data remains untouched: NGC 1316, NGC 1365, M100, NGC 1275, 3C 273 and Cygnus A. Matching requires both angular separation below 0.035° and radial velocity within 60 km/s; uncertain or distinct neighbours are retained. Selected unresolved survey points are also suppressed while their detailed owner is visible.

## Entry and interior

The original continuous camera trajectory and return pose remain. The cached field reduces repeated work during the approach. Dust and unresolved glow clear progressively; at full entry the galaxy volume contributes no residual veil. The 100,000 entered stars use small, tight cores and very faint halos. Bloom strength drops temporarily as galaxy or nebula interiors clear, without changing the user’s saved optics. Journey buffers retain at least one drawing pixel per CSS pixel, with the existing upper device-DPR bound preserved.

Only explicit entry allocates the 100,000-star population. Every selected galaxy has an 18,000-point exterior sample, visible only as its 3D volume takes over. It is replaced on entry; its stars form a deterministic subset of the entered population. Photographed exteriors do not have an extra stellar overlay. Exit releases the entered geometry and material. The Places panel and catalogue visits remain available.

Interior free-look automatically caps its local travel scale at 0.0015 galaxy radii or 0.006 nebula scale units. This prevents inheriting the huge arrival radius or accelerating exponentially away from the entry anchor. Wheel thrust is bounded too. Fine close-up movement, user speed multiplier, Shift boost, damping and ordinary free-look outside interiors are preserved.

Galaxy, nebula and black-hole passage panels have accessible Hide controls and compact Show buttons. Hiding a galaxy panel also hides its Places tray. Hiding chrome does not reset, pause, exit or mute the simulation. Escape/return functionality remains intact.

## Scientific sources

- [ESO’s deep optical Centaurus A observation](https://www.eso.org/public/images/eso1221a/), including 33.87 arcmin field and optical filters.
- [ESO: Centaurus A’s spheroid and dust](https://www.eso.org/public/images/cena/) and [its warped merger remnant](https://www.spitzer.caltech.edu/image/ssc2004-09a1-dusty-elliptical-galaxy-centaurus-a).
- [ESO Triangulum](https://www.eso.org/public/images/eso1424a/), [VISTA LMC](https://www.eso.org/public/images/eso1914a/) and [VISTA SMC](https://www.eso.org/public/images/eso1714a/).
- [NASA galaxy types](https://science.nasa.gov/universe/galaxies/types/) and [Hubble galaxies](https://science.nasa.gov/mission/hubble/science/universe-uncovered/hubble-galaxies/).
- [NASA Sombrero dust ring](https://science.nasa.gov/asset/hubble/sombrero-galaxy-visible-and-infrared-views/) and [Webb Cartwheel rings](https://science.nasa.gov/missions/webb/webb-captures-stellar-gymnastics-in-the-cartwheel-galaxy/).
- [ESA Gaia interstellar dust map](https://www.esa.int/ESA_Multimedia/Images/2022/06/Gaia_map_of_interstellar_dust_in_the_Milky_Way).

Per-image source and credit are retained in public/textures/galaxies/CREDITS.md and galaxy-references.ts. Photographs constrain one observed projection. Other viewpoints, dust depth and individual generated stars remain visual reconstructions, not measured 3D star catalogues.

## Validation

Native 1100×800 isolated production-component checks for Centaurus A and M51 loaded 4000-pixel exterior textures with no shader errors, verified 100,000 stars only after entry, zero photo visibility at full entry, bounded W movement, all three panel hide/show controls, and star disposal on exit. GPU-completed interior frame-work medians in that run were 3.6 ms (Centaurus A) and 2.3 ms (M51), with p95 5.0 and 12.7 ms. These are isolated hardware/viewport-specific measurements, not a universal FPS guarantee or a whole-site benchmark.

Run test:galaxy-clarity for extent, spheroidal population and movement bounds. Existing galaxy-entry, galaxy-rendering, navigation-flight, solar-galactic-motion and nebula-journey validations remain relevant. Browser QA files and downloaded intermediate originals stay ignored under .taste-skill.

Final catalogue audit also keeps dwarf irregulars distinct from spheroidals, removes artificial spiral arms from lenticular stellar samples, and includes a central population inside ring galaxies. The known distant portrait remains until the selected photo/cache is ready, avoiding a dark loading gap. The integrated named/survey scene also passed for Centaurus A, M51 and the Milky Way; the named portrait was hidden after handoff.

The final 128×256×128 version passed real pointer dragging into the reconstructed view and screenshots at 1440, 900 and 390 px widths. A complete 6-second accelerated test passage with GPU completion measured 3.9 ms median / 6.6 ms p95 across 342 sampled frames in its final isolated run. Exterior particles are a stable subset of entered stars, and changing population count no longer disposes the retained shader material.

Wide-field LOD is retained: once the selected galaxy becomes subpixel, its inexpensive catalogue marker takes over again. Only one owner dominates at each scale; the old marker is not left superimposed on the nearby detailed galaxy. Unresolved survey proxies follow the same ownership threshold.

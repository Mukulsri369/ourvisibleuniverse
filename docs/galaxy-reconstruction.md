# Galaxy reconstruction

The scene uses three-dimensional stellar emissivity, absorbing dust and nested star populations. There are no galaxy photo planes or portrait sprites in the catalogue, selected view or interior. Distant 2MRS sources integrate representative oriented 3D densities in one batched point draw; their observed positions are retained.

The resolved field is cached only for selected galaxies. Catalogue bodies use 24–56 ray samples and 4,096 representative stars, selected bodies use 36,000 stars, and explicit entry streams 100,000. The star generator is deterministic so the exterior stars keep their positions when the larger population appears. Six dust samples shade stars behind dark lanes. The ray volume remains visible inside, clearing only the immediate camera neighborhood. No blur filter is added.

Scientific scope: we can observe these galaxies from Earth, not from arbitrary directions or from inside. Unseen depth and individual stellar positions are reconstructions, not measured 3D maps. The catalogue retains its existing distance, orientation and physical extent; this change does not claim to have remeasured those values. Broadband stellar colors and restrained H-alpha regions are used; JWST infrared false colors are morphology references rather than naked-eye colors.

## Research

- [NASA: galaxy types](https://science.nasa.gov/universe/galaxies/types/) constrains disks, bars, bulges, stellar halos and populations.
- [NASA/IPAC NED](https://ned.ipac.caltech.edu/) is the existing catalogue authority. The object rows below link to individual NED searches; unknown roll angles and depths remain illustrative.
- [VST snaps a very detailed view of the Triangulum Galaxy | ESO](https://www.eso.org/public/images/eso1424a/)
- [The Large Magellanic Cloud revealed by VISTA | ESO](https://www.eso.org/public/images/eso1914a/)
- [VISTA’s view of the Small Magellanic Cloud | ESO](https://www.eso.org/public/images/eso1714a/)
- [Out of this whirl: The Whirlpool Galaxy (M51) and companion galaxy | ESA/Hubble](https://esahubble.org/images/heic0506a/)
- [Largest ever galaxy portrait - stunning HD image of Pinwheel Galaxy | ESA/Hubble](https://esahubble.org/images/heic0602a/)
- [Hubble photographs grand design spiral galaxy M81 | ESA/Hubble](https://esahubble.org/images/heic0710a/)
- [Hubble mosaic of the majestic Sombrero Galaxy | ESA/Hubble](https://esahubble.org/images/opo0328a/)
- [The magnificent starburst galaxy Messier 82 | ESA/Hubble](https://esahubble.org/images/heic0604a/)
- [A poster-size image of the beautiful barred spiral galaxy NGC 1300 | ESA/Hubble](https://esahubble.org/images/opo0501a/)
- [A &#39;wallpaper&#39; of distant galaxies is a stunning backdrop for a runaway galaxy | ESA/Hubble](https://esahubble.org/images/heic0206a/)
- [A deep look at the strange galaxy Centaurus A | ESO](https://www.eso.org/public/images/eso1221a/)
- [Colliding galaxies make love, not war | ESA/Hubble](https://esahubble.org/images/heic0615a/)
- [Stephan’s Quintet (NIRCam + MIRI Imaging) | ESA/Webb](https://esawebb.org/images/weic2208a/)
- [The Andromeda galaxy | ESO](https://www.eso.org/public/images/b07/)
- [A Wheel within a Wheel | ESA/Hubble](https://esahubble.org/images/opo0221a/)
- [Cartwheel Galaxy (NIRCam and MIRI Composite Image) | ESA/Webb](https://esawebb.org/images/weic2211a/)

## Catalogue coverage

All 63 model entries use the same 3D renderer. Milky Way and Andromeda have dedicated navigation integration and use that renderer as well. Profiles vary by recorded morphology, dimensions, arm pitch, bar and ring size; their seeded populations are stable across entry and exit.

| Galaxy | Structure | Diameter (ly) | Additional feature | Catalogue |
| --- | --- | ---: | --- | --- |
| Triangulum (M33) | spiral | 60,000 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=Triangulum%20(M33)) |
| Large Magellanic Cloud | irregular | 14,000 | Asymmetric population, off-center bar and star-forming knot | [NED](https://ned.ipac.caltech.edu/byname?objname=Large%20Magellanic%20Cloud) |
| Small Magellanic Cloud | irregular | 7,000 | Elongated irregular population with greater depth | [NED](https://ned.ipac.caltech.edu/byname?objname=Small%20Magellanic%20Cloud) |
| M51 (Whirlpool) | spiral | 76,000 | Two grand-design arms and a compact companion | [NED](https://ned.ipac.caltech.edu/byname?objname=M51%20(Whirlpool)) |
| M81 (Bode's Galaxy) | spiral | 90,000 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=M81%20(Bode's%20Galaxy)) |
| M82 (Cigar Galaxy) | starburst | 37,000 | Thick starburst disk and bipolar H-alpha wind | [NED](https://ned.ipac.caltech.edu/byname?objname=M82%20(Cigar%20Galaxy)) |
| Centaurus A (NGC 5128) | elliptical | 97,186 | Spheroidal population with a warped absorbing dust disk | [NED](https://ned.ipac.caltech.edu/byname?objname=Centaurus%20A%20(NGC%205128)) |
| M87 (Virgo A) | elliptical | 240,000 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=M87%20(Virgo%20A)) |
| M104 (Sombrero) | edge-on | 50,000 | Large spheroidal bulge and outer dust ring | [NED](https://ned.ipac.caltech.edu/byname?objname=M104%20(Sombrero)) |
| M101 (Pinwheel) | spiral | 170,000 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=M101%20(Pinwheel)) |
| Cartwheel Galaxy | ring | 150,000 | Outer star-forming ring with radial spokes | [NED](https://ned.ipac.caltech.edu/byname?objname=Cartwheel%20Galaxy) |
| Hoag's Object | ring | 120,000 | Detached blue ring around an old central spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=Hoag's%20Object) |
| NGC 4038/4039 (Antennae) | interacting | 90,000 | Two disturbed cores, overlap clusters and tidal tails | [NED](https://ned.ipac.caltech.edu/byname?objname=NGC%204038%2F4039%20(Antennae)) |
| Stephan's Quintet (HCG 92) | interacting | 220,000 | Separate group cores with depth offsets and tidal structure | [NED](https://ned.ipac.caltech.edu/byname?objname=Stephan's%20Quintet%20(HCG%2092)) |
| Tadpole Galaxy (UGC 10214) | interacting | 280,000 | Distorted spiral and one extended tidal tail | [NED](https://ned.ipac.caltech.edu/byname?objname=Tadpole%20Galaxy%20(UGC%2010214)) |
| Mayall's Object (Arp 148) | ring | 140,000 | Collision ring and elongated companion | [NED](https://ned.ipac.caltech.edu/byname?objname=Mayall's%20Object%20(Arp%20148)) |
| Sagittarius Dwarf | dwarf | 10,000 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=Sagittarius%20Dwarf) |
| Canis Major Dwarf | irregular | 5,000 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=Canis%20Major%20Dwarf) |
| NGC 205 (M110) | dwarf | 17,000 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=NGC%20205%20(M110)) |
| M32 | elliptical | 6,500 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=M32) |
| IC 10 | starburst | 5,000 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=IC%2010) |
| NGC 6822 (Barnard) | irregular | 7,000 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=NGC%206822%20(Barnard)) |
| Leo I | dwarf | 3,000 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=Leo%20I) |
| Leo II | dwarf | 2,000 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=Leo%20II) |
| Draco Dwarf | dwarf | 2,500 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=Draco%20Dwarf) |
| Sculptor Dwarf | dwarf | 2,800 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=Sculptor%20Dwarf) |
| Fornax Dwarf | dwarf | 3,000 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=Fornax%20Dwarf) |
| Carina Dwarf | dwarf | 1,600 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=Carina%20Dwarf) |
| Sextans Dwarf | dwarf | 2,200 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=Sextans%20Dwarf) |
| Ursa Minor Dwarf | dwarf | 2,000 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=Ursa%20Minor%20Dwarf) |
| WLM | irregular | 8,000 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=WLM) |
| IC 1613 | irregular | 10,000 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=IC%201613) |
| NGC 185 | dwarf | 8,000 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=NGC%20185) |
| NGC 147 | dwarf | 9,000 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=NGC%20147) |
| NGC 253 (Sculptor Galaxy) | spiral | 90,000 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=NGC%20253%20(Sculptor%20Galaxy)) |
| M83 | barred | 55,000 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=M83) |
| M94 | spiral | 50,000 | Enhanced inner ring | [NED](https://ned.ipac.caltech.edu/byname?objname=M94) |
| M64 (Black Eye) | spiral | 54,000 | Asymmetric dark inner-disk cloud | [NED](https://ned.ipac.caltech.edu/byname?objname=M64%20(Black%20Eye)) |
| M106 | spiral | 135,000 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=M106) |
| M65 | spiral | 90,000 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=M65) |
| M66 | barred | 95,000 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=M66) |
| NGC 3628 | edge-on | 100,000 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=NGC%203628) |
| NGC 4631 (Whale) | edge-on | 140,000 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=NGC%204631%20(Whale)) |
| NGC 891 | edge-on | 120,000 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=NGC%20891) |
| M49 | elliptical | 160,000 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=M49) |
| M60 | elliptical | 120,000 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=M60) |
| M86 | lenticular | 150,000 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=M86) |
| M84 | lenticular | 110,000 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=M84) |
| M100 | spiral | 107,000 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=M100) |
| NGC 4565 (Needle) | edge-on | 200,000 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=NGC%204565%20(Needle)) |
| NGC 1365 | barred | 200,000 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=NGC%201365) |
| NGC 1316 (Fornax A) | lenticular | 160,000 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=NGC%201316%20(Fornax%20A)) |
| NGC 1300 | barred | 110,000 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=NGC%201300) |
| Perseus Cluster (NGC 1275) | elliptical | 200,000 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=Perseus%20Cluster%20(NGC%201275)) |
| Coma Cluster (NGC 4889) | elliptical | 300,000 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=Coma%20Cluster%20(NGC%204889)) |
| Hercules A | elliptical | 500,000 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=Hercules%20A) |
| 3C 273 (Quasar Host) | elliptical | 200,000 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=3C%20273%20(Quasar%20Host)) |
| Cygnus A | elliptical | 300,000 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=Cygnus%20A) |
| Malin 1 | spiral | 650,000 | Extended low surface brightness disk | [NED](https://ned.ipac.caltech.edu/byname?objname=Malin%201) |
| GN-z11 | starburst | 4,000 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=GN-z11) |
| JADES-GS-z14-0 | starburst | 1,600 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=JADES-GS-z14-0) |
| GLASS-z12 | starburst | 2,000 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=GLASS-z12) |
| HUDF-JD2 | starburst | 2,500 | Morphology-dependent disk / spheroid | [NED](https://ned.ipac.caltech.edu/byname?objname=HUDF-JD2) |

## Resolved population update

The 35 previously similar dwarf, irregular, compact and smooth early-type hosts now use separate stellar population profiles. Diffuse spheroidals use sparse old stars with a modest hot horizontal-branch component, not bright gas spheres. Compact M32 has a smaller central concentration. Fornax includes five representative globular clusters. IC 1613 is nearly dust-free; IC 10 is clumpy and star-forming; M110 and NGC 185 have localized absorbing dust. Depth, cluster coordinates, colors and population sampling remain illustrative, constrained by the cited descriptions and existing catalogue. These are not measured individual-star catalogues.

Affected population shaders are compiled separately; they add no branch or sampler work to the Milky Way shader. Off-screen galaxy bodies and stars are now culled using their actual bounding volumes. The 100,000-star interior is generated in a module worker and transferred to the renderer; the existing exterior remains in place while it loads. The overview information panel no longer stacks behind the interior places panel. Ray counts, density-cache resolution and final star counts remain unchanged.

| Galaxy | Distinctive population | Reference |
| --- | --- | --- |
| Sagittarius Dwarf | Elongated, tidally disrupted spheroidal body and a compact illustrative M54 region. Axes 1 : 0.34 : 0.46, relative core 0.46. | [Source](https://www.esa.int/ESA_Multimedia/Images/2018/09/The_Sagittarius_dwarf_galaxy_in_Gaia_s_all-sky_view) |
| Canis Major Dwarf | Diffuse Canis Major stellar overdensity; its interpretation as a separate dwarf galaxy is disputed. Axes 1 : 0.16 : 0.42, relative core 0.62. | [Source](https://arxiv.org/abs/astro-ph/0603385) |
| NGC 205 (M110) | Elongated dwarf elliptical with localized dust and a modest younger central population. Axes 1 : 0.52 : 0.57, relative core 0.24. | [Source](https://science.nasa.gov/image-article/apod-2008-september-9-m110-satellite-of-the-andromeda-galaxy/) |
| M32 | Compact, centrally concentrated elliptical with a bright old stellar nucleus. Axes 1 : 0.77 : 0.82, relative core 0.13. | [Source](https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-32/) |
| Leo I | Diffuse old stellar population; blue horizontal-branch stars are not new star formation. Axes 1 : 0.67 : 0.76, relative core 0.29. | [Source](https://science.nasa.gov/image-article/apod-2024-april-26-regulus-and-the-dwarf-galaxy/) |
| Leo II | Diffuse old stellar population; blue horizontal-branch stars are not new star formation. Axes 1 : 0.78 : 0.91, relative core 0.43. | [Source](https://academic.oup.com/mnras/article/532/4/4157/7718108) |
| Draco Dwarf | Diffuse old stellar population; blue horizontal-branch stars are not new star formation. Axes 1 : 0.51 : 0.69, relative core 0.36. | [Source](https://academic.oup.com/mnras/article/532/4/4157/7718108) |
| Sculptor Dwarf | A diffuse, ancient metal-poor stellar population, not a luminous gas cloud. Axes 1 : 0.54 : 0.68, relative core 0.37. | [Source](https://www.eso.org/public/news/eso1536/) |
| Fornax Dwarf | Broad mixed-age stellar population with five representative globular clusters; cluster positions are illustrative. Axes 1 : 0.59 : 0.7, relative core 0.48. | [Source](https://www.eso.org/public/archives/techdocs/pdf/report_0009.pdf) |
| Carina Dwarf | Diffuse old stellar population; blue horizontal-branch stars are not new star formation. Axes 1 : 0.49 : 0.65, relative core 0.47. | [Source](https://academic.oup.com/mnras/article/532/4/4157/7718108) |
| Sextans Dwarf | Very low surface brightness, extended stellar body with no invented gas clouds. Axes 1 : 0.56 : 0.7, relative core 0.66. | [Source](https://academic.oup.com/mnras/article/532/4/4157/7718108) |
| Ursa Minor Dwarf | Diffuse old stellar population; blue horizontal-branch stars are not new star formation. Axes 1 : 0.36 : 0.45, relative core 0.49. | [Source](https://academic.oup.com/mnras/article/532/4/4157/7718108) |
| NGC 185 | Dwarf elliptical with a dusty central region and a small young central component. Axes 1 : 0.65 : 0.84, relative core 0.24. | [Source](https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-caldwell-catalog/caldwell-18/) |
| NGC 147 | Gas-poor elongated dwarf spheroidal, with diffuse outer stellar structure. Axes 1 : 0.44 : 0.59, relative core 0.43. | [Source](https://ned.ipac.caltech.edu/level5/March01/Mateo/Mateo4.html) |
| WLM | Elongated dwarf irregular with resolved cool giants and blue stellar associations. Axes 1 : 0.3 : 0.35, relative core 0.6. | [Source](https://esawebb.org/images/WLMa/) |
| IC 1613 | Sparse blue associations and pink emission regions, with exceptionally little dust. Axes 1 : 0.38 : 0.84, relative core 0.64. | [Source](https://www.eso.org/public/news/eso1603/) |
| IC 10 | Compact starburst dwarf: dense young blue associations, dusty knots and H-alpha regions. Axes 1 : 0.42 : 0.83, relative core 0.4. | [Source](https://science.nasa.gov/missions/hubble/hubble-captures-elusive-irregular-galaxy/) |
| NGC 6822 (Barnard) | Loose stellar bar, irregular blue associations and separate HII complexes. Axes 1 : 0.28 : 0.6, relative core 0.6. | [Source](https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-caldwell-catalog/caldwell-57/) |
| Large Magellanic Cloud | Asymmetric stellar bar with an off-center Tarantula-like star-forming complex. Axes 1 : 0.22 : 0.68, relative core 0.52. | [Source](https://www.eso.org/public/images/eso1914a/) |
| Small Magellanic Cloud | Elongated three-dimensional stellar body with asymmetric young associations. Axes 1 : 0.45 : 0.59, relative core 0.54. | [Source](https://www.eso.org/public/images/eso1714a/) |
| GN-z11 | Unresolved high-redshift galaxy: compact illustrative young stellar body; its interior is not measured. Axes 1 : 0.53 : 0.76, relative core 0.18. | [Source](https://science.nasa.gov/missions/webb/nasas-webb-finds-early-galaxies-werent-too-big-for-their-britches-after-all/) |
| JADES-GS-z14-0 | Unresolved early galaxy; illustrative compact blue population rather than a measured resolved image. Axes 1 : 0.51 : 0.8, relative core 0.25. | [Source](https://science.nasa.gov/missions/webb/nasas-james-webb-space-telescope-finds-most-distant-known-galaxy/) |
| GLASS-z12 | Unresolved high-redshift source; depth and stellar detail are representative. Axes 1 : 0.46 : 0.64, relative core 0.29. | [Source](https://science.nasa.gov/universe/galaxies/types/) |
| HUDF-JD2 | Unresolved catalogue source; historical high-redshift interpretation is uncertain. Internal structure is illustrative. Axes 1 : 0.58 : 0.9, relative core 0.22. | [Source](https://science.nasa.gov/universe/galaxies/types/) |
| M87 (Virgo A) | Massive, nearly round old stellar spheroid; halo globular populations remain representative. Axes 1 : 0.86 : 0.93, relative core 0.22. | [Source](https://science.nasa.gov/universe/galaxies/types/) |
| M49 | Diffuse old stellar population; blue horizontal-branch stars are not new star formation. Axes 1 : 0.62 : 0.78, relative core 0.3. | [Source](https://academic.oup.com/mnras/article/532/4/4157/7718108) |
| M60 | Diffuse old stellar population; blue horizontal-branch stars are not new star formation. Axes 1 : 0.7 : 0.84, relative core 0.2. | [Source](https://academic.oup.com/mnras/article/532/4/4157/7718108) |
| M86 | Diffuse old stellar population; blue horizontal-branch stars are not new star formation. Axes 1 : 0.59 : 0.7, relative core 0.35. | [Source](https://academic.oup.com/mnras/article/532/4/4157/7718108) |
| M84 | Diffuse old stellar population; blue horizontal-branch stars are not new star formation. Axes 1 : 0.73 : 0.86, relative core 0.23. | [Source](https://academic.oup.com/mnras/article/532/4/4157/7718108) |
| NGC 1316 (Fornax A) | Merger-shaped early-type host with localized absorbing dust rather than a generic spiral disk. Axes 1 : 0.56 : 0.73, relative core 0.32. | [Source](https://academic.oup.com/mnras/article/532/4/4157/7718108) |
| Perseus Cluster (NGC 1275) | Old central galaxy with separate central emission complexes; cluster galaxies remain separate objects. Axes 1 : 0.74 : 0.86, relative core 0.24. | [Source](https://academic.oup.com/mnras/article/532/4/4157/7718108) |
| Coma Cluster (NGC 4889) | Diffuse old stellar population; blue horizontal-branch stars are not new star formation. Axes 1 : 0.53 : 0.68, relative core 0.37. | [Source](https://academic.oup.com/mnras/article/532/4/4157/7718108) |
| Hercules A | Diffuse old stellar population; blue horizontal-branch stars are not new star formation. Axes 1 : 0.68 : 0.81, relative core 0.28. | [Source](https://academic.oup.com/mnras/article/532/4/4157/7718108) |
| Cygnus A | Diffuse old stellar population; blue horizontal-branch stars are not new star formation. Axes 1 : 0.58 : 0.73, relative core 0.2. | [Source](https://academic.oup.com/mnras/article/532/4/4157/7718108) |
| 3C 273 (Quasar Host) | Resolved host reconstruction only; the separate quasar rendering retains ownership of the active nucleus. Axes 1 : 0.8 : 0.92, relative core 0.18. | [Source](https://academic.oup.com/mnras/article/532/4/4157/7718108) |

### Entry timing check

A local Chrome run on Intel Iris Xe at 960 × 640, standard quality, measured the interior draw calls falling from 126 to 43. The worst sampled handoff frame fell from 451.7 ms to 45.5 ms; mean sampled interior frame interval fell from 14.33 ms to 10.49 ms. The same 100,000 interior stars and native pixel resolution were retained. These are observations from this device and test path, not a frame-rate guarantee for every GPU or viewport. Raw browser runs remain in the ignored QA directory.

The interface now keeps free-look movement and the interior places panel available at the flight handoff. The full toolbar opens with Show interface or the movement-settings button, avoiding a large menu rebuild during the cinematic. Normal interface visibility is restored on exit. Volumetric rays sample the cached field three times per crossed voxel, capped at the existing quality-tier budget; short sky rays avoid repeating many samples of the same cached cells.

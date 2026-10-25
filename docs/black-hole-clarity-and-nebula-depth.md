# Black-hole clarity and nebula depth

## Black-hole rendering

The optical pass now keeps a native render target (up to an 8192-pixel dimension guard), including during camera motion. It no longer reduces the image to 35–70% resolution. Distant optical work is scissored to a conservative influence rectangle; physical target coordinates are converted to renderer scissor coordinates at fractional DPR and the previous state is restored. The complete scene keeps its normal adaptive pixel ratio; an active black-hole view has a one-pixel-per-CSS-pixel floor.

The shadow, inner disk and photon-ring region use Schwarzschild null-ray integration with spin-informed emission, gravitational frequency shift and Doppler beaming. Outer primary rays blend toward a second-order weak-field approximation between impact parameters 7 and 10 Schwarzschild radii, with geodesic fallback for ambiguous/grazing intersections. This avoids spending full integration cost on the whole native frame. It is not a full Kerr or GRMHD plasma calculation.

The disk uses procedural 1024² turbulence with bounded, continuously blended advection. It does not wind into ever-finer rings during a long simulation. Curved disk intersections use a quadratic solve, and the critical curve has pixel-aware additional rays. The post-process bloom blur is disabled while the black-hole optical pass is active; the original manual bloom configuration remains unchanged outside these views.

Reference: [NASA black-hole anatomy](https://science.nasa.gov/universe/black-holes/anatomy/), [EHT Sagittarius A*](https://eventhorizontelescope.org/blog/astronomers-reveal-first-image-black-hole-heart-our-galaxy). EHT images constrain a reconstructed radio-emission view; this is an illustrative close-up, not an ultra-HD photograph.

## Galactic-centre approach

The Milky Way, far portrait, navigation targets, Sun-reference orbit ring and floating-origin anchor now use the same 26,673-light-year scene reference as the existing Sagittarius A* catalogue entry. The separate historical 26,000-light-year astrometry benchmark is unchanged. The old painted core sphere and broad core sprite have been removed. A lightweight representative nuclear stellar population takes over as the bulk galactic glow fades near the centre. Its individual positions are illustrative.

Zooming within 25 light-years of a settled Milky Way centre switches context to Sagittarius A* without starting a new fly-to or resetting the orbit angles. Fine manual zoom slows near the hole and stops outside 1.08 navigation Schwarzschild radii. The explicit 42-second time-compressed descent begins at the actual camera radius, rather than teleporting to a fixed close orbit. Pause, return and Escape retain their normal controls. The sequence ends at the horizon; no interior is claimed.

## Nebular geometry and stars

There is no thin photographic sheet in the nebula renderer. Photographs constrain the colour palette; gas and dust come from a three-dimensional density field. The same density function integrates emission and the optical depth between each modelled star and the camera. Consequently a foreground star, an embedded cluster star and a star behind a dense globule have different attenuation. Stars render separately at native resolution, with perspective and parallax.

Dust does not physically move out of the way of the camera. Cavities and gaps reveal stars as the viewpoint changes. Dense globules remain optically opaque. A small near-plane feather prevents a hard clipping wall. The reference palette fades in smoothly once decoded. Colour-guide decode caps are 2048 pixels for high quality, 1280 for standard and 768 for performance, avoiding the memory cost of repeatedly decoding huge observatory mosaics. Volumetric geometry and stars are not limited to those image dimensions. Original source JPEGs remain unchanged.

Cluster identities and illuminating sources are observed, but local stellar offsets, unresolved members, fine knots and much of the depth are reconstructed. These normalized morphology studies are not measured voxel tomograms. Some source images show small regions of much larger catalogue nebulae (notably the Eagle pillars, Cosmic Cliffs and Lagoon close-up); individual feature sizes and positions in this illustrative view must not be treated as precise astrometry. Infrared and narrowband source colours retain their mapped palettes.

| Object                   | Reconstructed structure                                                                      | Scientific reference                                                                                                    |
| ------------------------ | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Orion / M42              | Open blister cavity, molecular wall, foreground bar; Trapezium cluster                       | [Source](https://science.nasa.gov/missions/hubble/nasa-space-telescopes-provide-a-3d-journey-through-the-orion-nebula/) |
| Eagle / M16              | Four separated pillar clouds, including the two left-hand components; NGC 6611               | [Source](https://science.nasa.gov/asset/webb/pillars-of-creation-model-for-3d-printing/)                                |
| Carina / Cosmic Cliffs   | Corrugated cavity wall, eroded ridges and depth-separated dust                               | [Source](https://science.nasa.gov/missions/webb/new-visualization-from-nasas-webb-telescope-explores-cosmic-cliffs/)    |
| Pleiades                 | Separated reflection wisps surrounding a passing stellar cluster                             | [Source](https://www.eso.org/public/images/b11/)                                                                        |
| Witch Head               | Elongated, curved reflection cloud illuminated from outside by Rigel                         | [Source](https://www.nasa.gov/image-article/witch-head-nebula/)                                                         |
| Horsehead                | A three-dimensional molecular neck and overhanging head, backed by ionised gas               | [Source](https://esahubble.org/images/heic1307a/)                                                                       |
| Barnard 68               | Opaque, irregular Bok globule; foreground and background stars, no invented embedded cluster | [Source](https://www.eso.org/public/images/eso0102a/)                                                                   |
| Ring / M57               | Equatorial torus pierced by an elongated, end-on shell                                       | [Source](https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-57/)      |
| Helix                    | Inner disk and strongly tilted outer ring with clumpy inner material                         | [Source](https://science.nasa.gov/missions/hubble/a-new-twist-on-an-old-nebula/)                                        |
| Cat’s Eye                | Intersecting ellipsoids, nested shells and a central star                                    | [Source](https://arxiv.org/abs/2209.01313)                                                                              |
| Butterfly / NGC 6302     | Hollow bipolar lobes pinched by a dense equatorial dust torus                                | [Source](https://science.nasa.gov/asset/hubble/planetary-nebula-ngc-6302/)                                              |
| Crab / M1                | Filament cage surrounding a softer synchrotron-emitting interior and pulsar                  | [Source](https://science.nasa.gov/asset/hubble/crab-nebula-the-multiwavelength-structure-of-a-pulsar-wind-nebula/)      |
| Veil                     | Thin, folded shock ribbons in an open section of an expanding shell                          | [Source](https://esahubble.org/images/heic1520a/)                                                                       |
| Cassiopeia A             | Ruptured, clumpy ejecta shell with irregular filaments                                       | [Source](https://esawebb.org/images/weic2330a/)                                                                         |
| Rosette                  | Hollow wind-carved cavity around a young cluster, with scalloped cloud walls                 | [Source](https://www.esa.int/ESA_Multimedia/Images/2025/04/Rosette_Nebula)                                              |
| Tarantula                | Overlapping wind bubbles, dense bridges and the R136 cluster                                 | [Source](https://www.esa.int/Science_Exploration/Space_Science/Webb/Webb_captures_a_cosmic_tarantula)                   |
| Lagoon / M8              | Open ionised basin, dense dividing ridge and compact Hourglass region                        | [Source](https://esahubble.org/images/heic1808a/)                                                                       |
| Trifid / M20             | Ionised volume crossed by branching dust lanes, plus a separate reflection cloud             | [Source](https://www.eso.org/public/images/eso0930a/)                                                                   |
| SN 1987A                 | Equatorial ring and two spatially offset polar rings                                         | [Source](https://science.nasa.gov/asset/hubble/mysterious-ring-structure-around-supernova-1987a/)                       |
| Eta Carinae / Homunculus | Distinct hollow bipolar lobes and an equatorial dusty skirt                                  | [Source](https://esahubble.org/images/heic1912a/)                                                                       |
| WR104                    | Colliding-wind dust spiral with reconstructed shallow conical depth                          | [Source](https://www.hq.eso.org/sci/publications/messenger/archive/no.135-mar09/messenger-no135-26-31.pdf)              |

## Validation

- Production build completed successfully. Scoped lint: zero errors, four existing Fast Refresh export warnings. The repository type check still reports six pre-existing errors in auth, ExoSystem, GalaxyDestinationGrid and Planets.
- All 13 black-hole targets rendered at native framebuffer resolution without runtime or shader errors; additional face-on, edge-on, rear and close views were checked. The shadow test measured a 90-pixel radius versus the analytic 89.777-pixel reference (about 0.25% difference).
- The complete Milky Way centre handoff and descent test passed: no viewpoint reset, pause holds position, return keeps Sagittarius A* selected, and manual zoom remains outside the horizon.
- All 21 nebula profiles rendered from front, side and interior views without shader errors. Representative colours and embedded-star visibility were reviewed through the production HDR pipeline. Seeded geometry, depth distribution, target resolution and fractional-DPR scissor restoration checks passed.
- An isolated native-resolution black-hole run at 1100 × 800 on Intel Iris Xe measured 21.5 ms median and 27.5 ms 95th-percentile frame time. This is a component benchmark, not a guarantee for the complete universe on every device.

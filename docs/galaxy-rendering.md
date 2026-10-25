# Galaxy rendering and observational sources

The 65 named appearances (63 catalogue models, Milky Way and Andromeda) share a camera-correct, depth-aware stellar/dust renderer. These are reconstructions, not measured 360-degree photographs. Only the observing directions available from Earth are photographed.

## Observations and display

Thirteen resolved systems have locally hosted observatory image guides and small distant portraits. The other models use catalogue morphology, with illustrative unresolved substructure. Dwarf spheroidals use diffuse spheroidal populations, not spiral arms; ring, irregular, edge-on, interacting, lenticular and barred systems have distinct density profiles. The highest-redshift sources are unresolved observations; their rendered depth and any fine grain are illustrative.

Full image files are unchanged observatory JPEGs, loaded only for mounted near detail. Decode limits are 1024 (performance), 2048 (standard), and up to 4096 (high), preserving original aspect ratio. Sources smaller than this remain at native resolution. Small distant portraits are decoded separately. The photographed layer fades before entry, yielding to reconstructed stars and absorbing dust rather than a growing opaque picture.

Webb infrared composites use mapped colours. This application uses enhanced photographic exposure, not a naked-eye brightness prediction. Adaptive exposure and bloom are damped and bounded relative to the manual settings, with a switch in Optics. Nearby Solar System, selected-star and hosted-system views keep their manual baseline.

## Wide field

`public/data/2mrs-galaxies.bin` contains 42,541 rows of Galactic longitude (degrees), latitude (degrees), and heliocentric/barycentric catalogue recession velocity (km/s), float32 little endian, selected from 44,599 2MRS entries with cz > 1500 km/s. Positions use d = cz / 70 Mpc and 3,261,563.8 light-years/Mpc. This is a low-redshift Hubble-law approximation; peculiar velocities limit distance accuracy. Nearby named galaxies retain their existing independently supplied distances.

The field uses measured directions and redshifts. Galaxy morphology, disk inclination, roll and size in this unresolved field are representative visual reconstructions, not measurements of each survey object. The real survey selection mask and missing regions are retained. No synthetic galaxies are added to fill gaps. One points batch renders the field, with bounded screen footprint and no per-frame position uploads. The existing cosmic-web diagram remains a separate layer.

Source: Huchra et al. (2012), The 2MASS Redshift Survey, ApJS 199, 26; [CDS catalogue DOI](https://doi.org/10.26093/cds/vizier.21990026). [VizieR data access and acknowledgements](https://vizier.cds.unistra.fr/viz-bin/VizieR?-source=J/ApJS/199/26/table3). This research has made use of the VizieR catalogue access tool, CDS, Strasbourg, France.

[Survey download query](https://vizier.cfa.harvard.edu/viz-bin/asu-tsv?-source=J/ApJS/199/26/table3&-out=GLON,GLAT,cz&-out.max=50000). The source query originally also requested an unavailable Kmag field, so no observed magnitude or morphology is claimed for this binary.

[Hubble deep-field reference](https://science.nasa.gov/mission/hubble/science/universe-uncovered/hubble-deep-fields/) explains why thousands of galaxy images in one frame represent deep telescope exposures rather than an unaided view.

## Image credits

- **m51**: [Out of this whirl: The Whirlpool Galaxy (M51) and companion galaxy | ESA/Hubble](https://esahubble.org/images/heic0506a/). NASA , ESA , S. Beckwith ( STScI ), and The Hubble Heritage Team ( STScI / AURA ).
- **m101**: [Largest ever galaxy portrait - stunning HD image of Pinwheel Galaxy | ESA/Hubble](https://esahubble.org/images/heic0602a/). Image: European Space Agency & NASA Acknowledgements: Project Investigators for the original Hubble data: K.D. Kuntz (GSFC), F. Bresolin (University of Hawaii), J. Trauger (JPL), J. Mould (NOAO), and Y.-H. Chu (University of Illinois, Urbana) Image processing: Davide De Martin ( ESA / Hubble ) CFHT image: Canada-France-Hawaii Telescope/J.-C. Cuillandre/Coelum NOAO image: George Jacoby, Bruce Bohannan, Mark Hanna/NOAO/AURA/NSF.
- **m81**: [Hubble photographs grand design spiral galaxy M81 | ESA/Hubble](https://esahubble.org/images/heic0710a/). NASA , ESA and the Hubble Heritage Team ( STScI / AURA ). Acknowledgment: A. Zezas and J. Huchra (Harvard-Smithsonian Center for Astrophysics).
- **m104**: [Hubble mosaic of the majestic Sombrero Galaxy | ESA/Hubble](https://esahubble.org/images/opo0328a/). NASA / ESA and The Hubble Heritage Team ( STScI / AURA ).
- **m82**: [The magnificent starburst galaxy Messier 82 | ESA/Hubble](https://esahubble.org/images/heic0604a/). NASA , ESA and the Hubble Heritage Team ( STScI / AURA ). Acknowledgment: J. Gallagher (University of Wisconsin), M. Mountain ( STScI ) and P. Puxley (NSF)..
- **ngc1300**: [A poster-size image of the beautiful barred spiral galaxy NGC 1300 | ESA/Hubble](https://esahubble.org/images/opo0501a/). NASA , ESA , and The Hubble Heritage Team ( STScI / AURA ).
- **tadpole**: [A &#39;wallpaper&#39; of distant galaxies is a stunning backdrop for a runaway galaxy | ESA/Hubble](https://esahubble.org/images/heic0206a/). NASA , Holland Ford (JHU), the ACS Science Team and ESA.
- **cena**: [A giant galaxy | ESO](https://www.eso.org/public/images/cena/). ESO/IDA/Danish 1.5 m/R. Gendler, J.-E. Ovaldsen & S. Guisard ( www.eso.org/~sguisard ) (ESO).
- **antennae**: [Colliding galaxies make love, not war | ESA/Hubble](https://esahubble.org/images/heic0615a/). Credit: NASA , ESA , and the Hubble Heritage Team ( STScI / AURA )- ESA / Hubble Collaboration. Acknowledgement: B. Whitmore ( Space Telescope Science Institute ) and James Long (ESA/Hubble)..
- **quintet**: [Stephan’s Quintet (NIRCam + MIRI Imaging) | ESA/Webb](https://esawebb.org/images/weic2208a/). NASA, ESA, CSA, and STScI.
- **m31full**: [The Andromeda galaxy | ESO](https://www.eso.org/public/images/b07/). ESO/S. Brunier.
- **hoag**: [A Wheel within a Wheel | ESA/Hubble](https://esahubble.org/images/opo0221a/). NASA / ESA and The Hubble Heritage Team ( STScI / AURA ).
- **cartwheel**: [Cartwheel Galaxy (NIRCam and MIRI Composite Image) | ESA/Webb](https://esawebb.org/images/weic2211a/). NASA, ESA, CSA, STScI.

[ESA/Hubble image usage](https://esahubble.org/copyright/), [ESA/Webb image usage](https://esawebb.org/copyright/), [ESO image usage](https://www.eso.org/public/outreach/copyright/). Credits apply to the original and preview images.

## Validation

- Catalogue approach validation passed for all 63 generic models at 480, 800, 1440 and 2160-pixel viewport heights. All 13 guide/preview dimensions and all 42,541 survey rows validated.
- Browser rendering visited all 65 appearances with no shader errors. The isolated 42,541-object field used one draw call; at 1280×800 the final run measured 8.3 ms median and 9.1 ms 95th-percentile frame time. This is a scene-specific headless benchmark, not a guarantee for all hardware or the complete universe.
- Full StarsApp navigation checked galaxy destination grids, hosted-body visits, manual optics presets, adaptive exposure bounds/restoration, finite cameras and real drag input, with no browser exceptions.
- Scoped lint has no errors; existing Fast Refresh export warnings remain. Production client/server build succeeds. The repository-wide TypeScript check reports existing errors in unchanged auth.tsx, ExoSystem.tsx, GalaxyDestinationGrid.tsx and Planets.tsx; no changed-file type errors were reported.

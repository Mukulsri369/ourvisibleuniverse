# What real galaxies look like, and why

The visual facts a reconstruction must reproduce, by component, with the physics that causes each one. Values are typical ranges from the literature, not measurements of any particular OVU object. Per-object values belong in the catalogue under `ovu-object-intake`.

## 1. Stellar disk

- **Profile.** Surface brightness falls exponentially with radius: I(R) = I₀ exp(−R/h) (Freeman 1970). Most optical light lies within 3–4 scale lengths h, and many disks truncate or steepen beyond that. A disk that is equally bright out to its edge looks wrong at once.
- **Colour.** Disks get bluer outwards: younger populations, lower metallicity and less dust. Inter-arm light is smooth and yellow-white, from old stars. It is not grey haze.
- **Thickness.** The thin stellar disk is about 0.1–0.2 of a scale length thick. Edge-on, it is a thin luminous blade with a dust lane along its mid-plane.

## 2. Bulge and nucleus

- **Profile.** Classical bulges follow a Sérsic profile with n ≈ 4, the de Vaucouleurs law (de Vaucouleurs 1948; Sérsic 1963). Pseudobulges are flatter, with n ≲ 2, and are often disky or barred (Kormendy & Kennedy 2004).
- **Brightness.** The central surface brightness is orders of magnitude above the outer disk. Telescope images show both only because of a non-linear stretch (§8). A render with a dim, flat core reads as "not a galaxy".
- **Colour.** Bulges are older and metal-rich, so yellow to orange. The bulge-to-disk colour contrast is the single strongest colour cue in spiral images.

## 3. Spiral arms

- **Shape.** Arms are roughly logarithmic spirals, r = r₀ exp(θ tan φ). The pitch angle φ is about 10–40°: tighter in Sa types, more open in Sc types (Kennicutt 1981). Real arms are not perfect spirals. They have segments, kinks, branches and uneven brightness along their length.
- **Classes.** Grand-design spirals have two long symmetric arms. Multi-armed spirals have several. Flocculent spirals have many short, patchy fragments (Elmegreen & Elmegreen 1987). A flocculent galaxy drawn as two clean arms is wrong.
- **Contrast depends on the light.** In old-star (near-infrared) light, spiral arms are modest density waves in a smooth disk (Rix & Zaritsky 1995 measured them in K-band). In blue optical light the contrast is far higher, because the arms hold the young stars. Check the paper before quoting a number. Model the arms as a modest old-star density enhancement plus concentrated young emission. Do not model them as a bright tube on an empty disk.
- **Order across an arm** (density-wave shock picture: Lin & Shu 1964; Roberts 1969), moving downstream in the rotation direction:
  1. A narrow, sharp dust lane on the inner (concave) edge, where gas is shocked.
  2. HII regions and young clusters a few hundred parsecs downstream. Examples: Hα offset from dust lanes in M100 (Knapen & Beckman 1996); dust lane to mid-arm offset of about 340 ± 56 pc in the Milky Way (Vallée 2016).
  3. A broader, smoother band of older stars.
- **Spurs and feathers.** Thin dust filaments jut from the arms into the inter-arm region at large angles, and they are common in Hubble images of grand-design spirals (La Vigne, Vogel & Ostriker 2006). They give the "feathered" look that smooth renders lack.
- **Trailing arms.** Arm tips point opposite to the rotation. If the volume rotates, rotate the pattern consistently with the arm sense.

## 4. Dust

- **Extinction and reddening.** Dust absorbs blue light more than red. The Cardelli, Clayton & Mathis (1989) law with R_V = 3.1 gives roughly A_B : A_V : A_R ≈ 1.3 : 1 : 0.75. Thin dust reddens light to brown and orange. Thick dust is opaque black-brown. Lanes have sharp edges and filamentary texture, not soft blur.
- **Geometry.** In massive spirals, dust is thinner than the stars, with a vertical scale height about half the stellar one. It extends further radially: scale length about 1.4× (Xilouris et al. 1999) to about 1.8× the stellar one (Casasola et al. 2017, face-on DustPedia). In low-mass disks the dust is about as thick as the stars and shows no sharp lane (Dalcanton, Yoachim & Bernstein 2004; Mosenkov et al. 2022).
- **Inclined disks.** Dust lanes are most obvious on the near side, where they are silhouetted against the bright bulge behind them. This depth cue comes for free from a correct volume integral; do not flatten it away.
- **Infrared images.** In Webb MIRI and NIRCam composites, dust glows and appears bright. These are structure references, not visible-light colours. `docs/galaxy-reconstruction.md` already records this.

## 5. Star formation: HII regions and young clusters

- **HII regions.** Ionised hydrogen around hot young stars emits Hα at 656.3 nm. Composites that map Hα to red, with Hβ and [O III] in the bluer channels, show them as compact pink, magenta or red knots, tens to a few hundred parsecs across. They often form strings along an arm. Their colour strength depends on the filter set, so label the choice.
- **Young clusters and OB associations.** Blue-white clumps sit next to the HII regions. In nearby galaxies, individual blue and red supergiants are resolved as points.
- **Ring and irregular systems.** Star formation dominates the light, as in the Cartwheel's ring or the LMC's patchy disk.

## 6. Other morphologies

- **Ellipticals.** Smooth Sérsic profiles with n ≈ 4, no arms and little cold dust. Their colour is yellow-orange, slightly bluer outwards. Globular clusters show as faint points in the halo.
- **Lenticulars (S0).** A bulge and disk with no arms. Dust rings are sometimes present.
- **Irregulars and dwarfs.** Clumpy star formation with no organised arms. Bars may be off-centre, as in the LMC.
- **Interacting systems.** Long, thin tidal tails and bridges (Toomre & Toomre 1972). Tails are fainter than the disks and studded with blue clumps.
- **Edge-on systems.** A thin luminous blade, bisected by the dust lane, with a boxy or peanut bulge where a bar is present.

## 7. Foreground and instrument features

Foreground Milky Way stars and diffraction spikes (four for Hubble, six plus two for Webb) belong to the photograph, not to the galaxy. Never bake them into a 3D galaxy volume. If an optics effect adds spikes, it must be an optional, labelled camera effect.

## 8. How observatory colour images are made

Observatory colour images are exposures through several filters, mapped to RGB and given a non-linear stretch. The standard stretch is asinh, which preserves colour across brightness (Lupton et al. 2004), followed by a saturation adjustment. A "Hubble-like" look is therefore a display choice, separate from the physical model. Keep the emissivity physically ordered, apply the stretch at display time, and label the result as enhanced photographic exposure, as `docs/galaxy-rendering.md` does.

## References

- Cardelli, J. A., Clayton, G. C. & Mathis, J. S. 1989, ApJ 345, 245.
- Casasola, V. et al. 2017, A&A 605, A18 (DustPedia scale lengths).
- Dalcanton, J. J., Yoachim, P. & Bernstein, R. A. 2004, ApJ 608, 189.
- de Vaucouleurs, G. 1948, Annales d'Astrophysique 11, 247.
- Elmegreen, D. M. & Elmegreen, B. G. 1987, ApJ 314, 3 (arm classes).
- Freeman, K. C. 1970, ApJ 160, 811.
- Kennicutt, R. C. 1981, AJ 86, 1847 (pitch angle versus type).
- Knapen, J. H. & Beckman, J. E. 1996, MNRAS 283, 251 (M100 stars, gas and dust; arXiv:astro-ph/9607028).
- Kormendy, J. & Kennedy, R. C. 2004, ARA&A 42, 603.
- La Vigne, M. A., Vogel, S. N. & Ostriker, E. C. 2006, ApJ 650, 818 (spurs and feathers).
- Lin, C. C. & Shu, F. H. 1964, ApJ 140, 646.
- Lupton, R. et al. 2004, PASP 116, 133 (asinh RGB composites; `astropy.visualization.make_lupton_rgb`).
- Mosenkov, A. V. et al. 2022, MNRAS (dust in edge-on galaxies; arXiv:2207.11589).
- Rix, H.-W. & Zaritsky, D. 1995, ApJ 447, 82.
- Roberts, W. W. 1969, ApJ 158, 123.
- Sérsic, J. L. 1963, Boletín de la Asociación Argentina de Astronomía 6, 41.
- Toomre, A. & Toomre, J. 1972, ApJ 178, 623.
- Vallée, J. P. 2016, ApJ 821, 53 (arXiv:1603.08871).
- Xilouris, E. M. et al. 1999, A&A 344, 868.

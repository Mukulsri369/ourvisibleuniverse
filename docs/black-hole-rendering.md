# Black-hole optical reconstruction

The universe uses one optical renderer for nine black-hole targets and four quasar cores. Gravitational-wave localization regions retain their own uncertainty-region visualisation; they are not treated as resolved photographs of a merger.

## Transport and appearance

Backward null rays use the Schwarzschild metric, in units Rs = 2GM/c². The affine central-force equation is d²x/dλ² = -3 L² x/(2 r⁵), integrated with adaptive velocity Verlet. Local-static-observer initial directions include the Schwarzschild lapse. Rays crossing Rs are captured. Equatorial emission-plane crossings produce direct and higher-order disk images; no decorative Einstein/photon rings or opaque shadow sphere are drawn. The analytic distant critical impact parameter is 3√3 Rs/2.

The disk has a radially declining emissivity, a bounded inner edge, deterministic advected filament detail, approximate gravitational frequency shift and relativistic Doppler beaming. Spin informs the emitting inner edge through the prograde Kerr ISCO, clamped outside 1.25 Rs because the transport metric remains Schwarzschild. This is not a full Kerr, GRMHD, spectral radiative-transfer, or EHT model-fitting simulation. Hot-flow profiles for Sgr A*, M87* and HLX-1 are visual approximations, not measured plasma geometry. Colours represent a visible-light interpretation; X-ray/radio observations are not naked-eye photos.

Actual scene starlight is sampled through deflected directions. A cached HDR cube of the same scene supplies directions outside the current viewport. Cube faces are captured across six frames, not all at once. Finite-distance sources are approximated as sky directions. Dormant Gaia BH1/BH3 have zero disk/corona emission and no jets. Jets remain scene geometry only where supported by catalogue metadata. Binary companions use physical approximate stellar radii/separations and slow orbital periods rather than decorative orbit rings.

## Scale and descent

Mass-derived physical Schwarzschild radii are used except below a navigation floor of 1.4e-8 ly. These tiny targets are enlarged explicitly for navigation; physical measurements in the dossier are unchanged. Quasar core size is independent of host-galaxy diameter. Visits start at 32 displayed Rs. The optional 26-second camera sequence uses a time-compressed radial path and free-fall-inspired aberration. It is not a dynamically solved timelike Kerr orbit. It stops at a dark horizon endpoint; it does not invent a visible interior or assert that an infalling observer sees a physical blackout at horizon crossing. Pause, resume, Escape, return-to-orbit and target changes remain available. Surrounding panels are temporarily hidden during descent and restored afterward. Restoring the scale navigator preserves the active camera target rather than replaying its initial step.

## Cost and verification

The optical pass runs before bloom/output mapping, uses bounded half-float buffers, and keeps native scene detail outside the lens footprint. Resolution adapts conservatively; distant/subpixel targets disable the pass and cube capture. Noise and render targets are reused and explicitly disposed. Animation uses the shared simulation clock; camera-sequence progress is independent of astronomical time-rate controls.

Validation: catalogue coverage/dormant-state tests, analytic ISCO constants, monotonic descent/lifecycle tests, browser shader checks across the 13 cores, multi-angle review, actual-universe descent/pause/return/Escape tests, and a GPU silhouette check against the analytic Schwarzschild critical curve. The measured 512px test shadow radius was 90px versus 89.7774px analytic (0.25% larger at finite integration/resampling resolution).

## Primary visual and scientific references

- EHT observations of M87* and Sagittarius A*: https://www.eso.org/public/images/eso2208-eht-mwd/ (EHT Collaboration; millimetre radio images, not 360-degree photographs).
- NASA black-hole anatomy: https://science.nasa.gov/universe/black-holes/anatomy/
- NASA/JPL multi-angle accretion-disk and bare-hole visualisations: https://svs.gsfc.nasa.gov/14619/ and https://svs.gsfc.nasa.gov/14620/ (NASA/JPL-Caltech/R. Hurt (IPAC)). These are comparison references, not textures copied into the renderer.
- NASA horizon approach: https://science.nasa.gov/universe/black-holes/supermassive-black-holes/new-nasa-black-hole-visualization-takes-viewers-beyond-the-brink/ (NASA’s Goddard Space Flight Center/J. Schnittman and B. Powell).
- Gralla, Holz & Wald, Black hole shadows, photon rings, and lensing rings, Phys. Rev. D 100, 024018 (2019): https://doi.org/10.1103/PhysRevD.100.024018

# Solar motion relative to the Milky Way

The previous display translated the Sun along a constant vector and aligned the ecliptic normal with that vector. That geometry has been removed. Motion is now a numerical orbit in a smooth axisymmetric potential, with a separately defined astronomical orientation.

## Evidence and assumptions

- [Schönrich, Binney & Dehnen (2010)](https://academic.oup.com/mnras/article/403/4/1829/1054839) measures solar peculiar velocity (U,V,W) = (11.1,12.24,7.25) km/s. U points inward, V along Galactic rotation, W toward Galactic north.
- Adopted circular speed is 233 km/s; adding peculiar V gives 245.24 km/s. Radius preserves the existing 26,673 light-year catalogue anchor, approximately 8.18 kpc. These are adopted model parameters, not exact universal constants.
- [Astropy Galactocentric documentation](https://docs.astropy.org/en/stable/coordinates/galactocentric.html) illustrates modern adopted parameters and a 20.8 pc solar height. This model uses that height with the above peculiar velocity; alternative observational choices yield different trajectories.
- [A&A: solar-system acceleration (2013), section 2](https://www.aanda.org/articles/aa/full_html/2013/11/aa21806-13/aa21806-13.html) describes vertical oscillations, with historical estimates of 52–74 Myr. We adopt 74 Myr, giving roughly 90 pc vertical amplitude with these initial conditions. This period is potential-dependent, not a measured periodic schedule.
- [NASA solar-system orientation](https://www.nasa.gov/wp-content/uploads/2017/07/niac_2012_phasei_nosanov_ssears_tagged.pdf) describes approximately 60° between the ecliptic and Galactic planes. The IAU J2000 equatorial-to-Galactic rotation and J2000 obliquity give approximately 60.19°. The full basis, not just its tilt, now transforms planets, moons, belts and overlays together.
- [Vondrák, Capitaine & Wallace (2011)](https://doi.org/10.1051/0004-6361/201117274) distinguishes precession of the equator from the ecliptic and limits its long-term model to ±200,000 years. Earth's approximately 26,000-year axial precession must not be applied to the entire planetary plane. A Galactic revolution also does not itself rotate the ecliptic relative to fixed Galactic axes.

## Implementation and limits

Planar acceleration is -vc² (x,z)/(x²+z²), corresponding to a flat-rotation-curve logarithmic potential. Initial velocities include inward peculiar motion and Galactic rotation toward positive scene Z (Galactic longitude 90°). Radial motion and nonclosing azimuthal motion emerge from integration, rather than a closed ellipse around the central black hole. Vertical motion uses a separable harmonic potential. The nominal circular timescale is about 210–220 Myr; the noncircular trajectory has no single exact return period.

A deterministic RK4 table at 0.25 Myr intervals covers ±500 Myr. Cubic Hermite interpolation uses stored positions and velocities, making position and velocity continuous. Initialization occurs once, uses about 128 KB, and each frame does constant work with no allocations or React updates. The existing Sun/planet registry and parent-before-child frame ordering remain intact. Trail recording and camera follow continue to use the resulting live world positions.

At J2000 the Sun remains at the original scene origin. Vertical displacement is measured relative to its initial 20.8 pc height; the existing illustrative galaxy background and fixed observational catalogue are not moved or re-integrated. The model is not a self-consistent dynamical integration of every star or the Galaxy's evolving disk. It omits bar/spiral perturbations, migration and encounters, so there is no claim of an exact past/future solar orbit.

Physical time (default 1×) follows the existing planetary clock. Optional Galactic-only acceleration integrates elapsed time continuously, so changing rate does not jump phase; pause and reverse apply to both. Explicit dates reset the Galactic epoch; one-day steps move it by one physical day. At ±500 Myr the Galactic epoch stops rather than wrapping or extrapolating. Turning Galactic motion off keeps the existing Sun-centred view; re-enabling shows the current Galactic epoch.

The reference frame remains J2000, consistent with the existing ephemeris vectors. It is not artificially rotated once per Galactic year. Long-term changes of individual planetary planes are outside this simplified Galactic model; the whole-system orientation remains a fixed reference approximation. Planetary ephemeris data must not be interpreted as valid millions of years in the future merely because Galactic time was accelerated.

## Checks

Run the solar-galactic-motion validation for initial position/velocity, rotation sign, vertical crossings, numerical energy/angular momentum conservation, interpolation continuity, reference-plane angle, and clock lifecycle. Existing navigation and galaxy-entry regressions cover follow/selection integration.

The controls also report Earth’s instantaneous orbital-plane inclination from its heliocentric position/velocity angular momentum, transformed into Galactic axes. Existing date-dependent secular inclination/node rates remain active. This is an approximate Earth-plane angle at the planetary date, distinct from the fixed J2000 reference plane and from the invariable plane of the entire system.

Validation results: production build passed; numerical orbit and clock regressions passed; existing navigation-flight regression passed. Native HDR browser checks compiled 17 shader programs with no failures and kept moving Earth and Jupiter centred (maximum sampled normalized-screen offsets below 0.004). These tests do not establish accuracy of a unique real Galactic trajectory or a universal frame-rate guarantee.

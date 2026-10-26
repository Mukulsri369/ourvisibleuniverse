# Nebula journeys and object view controls

Select a nebula and use **Enter in nebula**. Each of the 21 volumes has a distinct 48-second route (64 seconds with reduced motion). Pause/resume and Return to viewpoint remain available; Escape returns. The final pose hands over to existing free look. Selecting another object cancels the old passage. Hidden tabs pause it. Return restores position, orientation and field of view.

Object details include **Adjust this object’s view**: exposure in EV, brightness and contrast. Nebulae add balanced lighting, dust opacity, starlight and Interior clarity. Preferences persist per catalogue ID. Resetting one leaves other objects and global optics unchanged. Black-hole exposure grades disk emission rather than background sky or the dark horizon.

## Rendering

Density and static scattering colour are baked incrementally into two half-float 3D textures for the selected volume only: four slices per frame, 128³ samples for standard/performance and 160³ for scientific high. Renderer target, layer, viewport and scissor state are restored. Resources are disposed on unmount. Production performs no CPU pixel readbacks.

Analytic morphology and observation colour guides feed the cache; this remains a 3D volume. Clouds fade in when ready. Stars share the cached density for extinction. Native-resolution stellar cores and procedural grain retain close-up detail. Empty samples skip radiance work. Ray counts adapt to quality tier and frame budget.

Passages gradually soften nearby dust, reduce its optical depth and emphasize starlight. This clearing aids visibility; it does not model physical evaporation. Dark clouds retain their silhouettes, and foreground/background stars are not represented as embedded clusters. Named anchors reuse the stellar catalogue; unmeasured positions and depth remain illustrative.

Black-hole strong-field rays now use the scalar Schwarzschild orbit equation in a fixed orbital plane, with RK4 and analytic disk-plane crossings. This removes repeated Cartesian vector accelerations while retaining native render targets, the capture shadow, higher-order disk images and the existing descent trajectory. The documented Schwarzschild/spin-informed-emission limitations remain.

## Scientific basis

- [NASA: 3D journey through Orion](https://science.nasa.gov/missions/hubble/nasa-space-telescopes-provide-a-3d-journey-through-the-orion-nebula/) describes its wind-carved cavity and visible/infrared layers.
- [NASA: Hubble/Webb Pillars visualization](https://science.nasa.gov/missions/hubble/new-hubble-webb-pillars-of-creation-visualization/) describes distinct cold gas/dust clouds, young stars and outflows.
- Per-object observation and morphology sources remain in [the nebula depth notes](black-hole-clarity-and-nebula-depth.md).

## Validation

Run npm run test:nebula-journey for all 21 transformed routes, continuous entry, exact return, free-look handoff, pause, selection cancellation and preference isolation. Browser checks exercise the production camera controller and HDR optics. Native timings include GPU completion. Measurements are specific to hardware and viewport; they do not guarantee a universal frame rate.

HLX-1 also needed a world-coordinate precision correction. Its navigation radius now has a distance-dependent Float64 floor (4096 coordinate increments). The same shared model supplies selection distance, orbit floor, ray transport and descent. Physical radii are preserved; the existing navigation-enlargement notice explains the presentation scale. Regression checks reconstruct near-horizon camera offsets at the actual world coordinates of all 13 cores and bound rounding error below 0.001 navigation radii.

In the isolated 960×720 native black-hole benchmark, early-inspiral median frame costs changed from 32.0 to 15.6 ms (HLX-1) and 31.5 to 15.0 ms (Sagittarius A*). At 1100×800, the sampled nebula exterior medians changed from 80.9–100.3 ms to 32.7–33.6 ms; interior medians changed from 66.8–86.1 ms to 41.3–45.0 ms. These include GPU completion and retain native image resolution. High-percentile timings still vary with GPU load; use the existing adaptive rendering tiers on slower hardware.

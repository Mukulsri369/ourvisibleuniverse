# Navigation and close-up rendering

## Orbit stability

Manual control resolves the live scene anchor for the Sun, planets and moons, hosted galaxy systems, and catalogue targets. The Sun's galactic drift is carried into the orbit target every frame. A drag no longer switches the Sun's anchor back to its catalogue origin, and planet/moon selection ignores pointer drags beyond four pixels.

## Free look

The visible Free look button and F shortcut enter real camera translation. Drag or arrow keys turn at the observer position; W/S travel, A/D strafe, Q/E descend and rise. Shift provides a temporary 3× boost. Wheel and pinch translate along the viewing direction. The on-screen controls support touch and keyboard activation. F, Escape, or the close button returns to orbit without changing camera position; orientation reacquires the retained target smoothly.

Movement starts at the current zoom scale and matches the existing held-key zoom rate at 1×. Settings provides a 0.05×–20× multiplier. Scale adapts smoothly during travel, and the observer remains within the existing universe navigation range. Transient input and velocities stay outside React state. Both navigation modes update clipping, the floating origin, LOD and the distance HUD.

## Outer planet orbits

Settings → Outer planet orbits controls Jupiter through Pluto independently from shared simulation time. The default is 1×, preserving the existing JPL motion. Faster presets include a 1000× Helical view; the slider reaches 2000×.

Extra orbital days accumulate from elapsed simulation time. Adjusting the multiplier changes subsequent motion without moving a planet to a different phase. Pause freezes it; an explicit simulation-date selection resets illustrative offsets. These enhanced rates are a visual aid and do not represent a single physical date across all planets. Orbital shapes remain those of the JPL model, and velocity/Lagrange/distance overlays use the displayed outer-planet states.

## Close-up precision

Planet, moon, atmosphere and ring vertex projection uses the CPU-composed model-view matrix instead of subtracting large world coordinates on the GPU. Sun illumination is a normalized relative direction, while relief uses normalized surface coordinates with a bounded normal perturbation. The same approach stabilizes tiny exoplanets near distant host stars. Irregular moons retain their intended sculpted shapes; camera limits leave room for their longest axes. Resolved planet and moon meshes have smoother silhouettes without adding frame-by-frame geometry updates.

## Verification

- Continuous orbital-rate and free-flight lifecycle regression: npm run test:navigation.
- Browser checks passed for live-Sun dragging, free-look entry and rotation without translation, travel on three axes, release damping, touch movement, returning to the retained selection, and settings/default-rate behavior.
- GPU checks passed for Mercury, Venus, the Moon, Phobos, Enceladus, Triton and a Proxima Centauri exoplanet, without runtime or shader errors.
- A 100,000-unit scene translation preserved Mercury's relative camera pose to about 1e-8; the settled 1200×900 screenshot comparison measured 2.79/255 RGB RMS difference.

- Responsive controls passed at 320 px and 390 px with no horizontal overflow; settings and keyboard activation of touch buttons were checked. Free look collapses the sitemap to keep travel controls visible.
- Production build and scoped lint passed (existing Fast Refresh warnings only). Four unrelated pre-existing type errors remain in auth.tsx and GalaxyDestinationGrid.tsx.
- Free look also passed an interrupted Sagittarius A* descent regression: returning to orbit retains the nearby position rather than restoring the old distant descent start.

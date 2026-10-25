# Black-hole zoom continuity, seamless disk flow and descent

## Continuous optical compositing

The optical render target previously inherited an opaque clear alpha. When ray work was scissored to a small rectangle, untouched pixels stayed opaque black and replaced the galaxy. The target now clears transparently with scissor disabled, then restores the renderer clear colour/alpha and scissor state. Outside the deflecting region, the native scene is preserved.

Optical activation blends over 1800–1100 navigation Schwarzschild radii. The close-field coverage changes continuously over 70–24 radii, removing the former full-screen coverage switch. Bloom follows the same blend and remains disabled in the close lens view to retain sharpness and avoid expensive blur passes.

## A disk without an angular joint

The old texture coordinates directly scaled atan's angle, which has a branch cut at ±π. That sampled unrelated texture values on either side of the cut. Both turbulence layers now use circular sine/cosine embeddings with integer angular harmonics. Values and derivatives wrap continuously, including the existing bounded 48-second advection cycle.

## Cinematic spiral descent

The 52-second route begins at the actual observer position. It approaches the emitting region, settles toward the disk plane, spirals inward with increasing angular speed, then plunges toward the horizon. Disk coordinates are transformed using each object's existing orientation. Phase is analytic rather than accumulated frame-by-frame, so pause and resume preserve it.

Late in the sequence, a bounded, optically thin local tracer field develops longer radial correlations to suggest tidal stretching. It is evaluated only during the relevant descent phase and uses the same periodic angular sampling. The horizon sequence fades to black. Manual orbiting, return, selection retention and free-look cancellation remain available.

This route and the local tracer effect are cinematic reconstructions. They do not add a full Kerr camera geodesic or a general-relativistic plasma simulation. Dormant objects retain their lack of an emitting disk.

## Designed spatial audio

Audio is synthesized locally after the user presses Begin descent. A restrained low-frequency foundation, filtered turbulent air and a quiet harmonic layer rise with the flight; stereo motion follows orbital phase. Gain ramps, a compressor and bounded control values avoid abrupt peaks. Pause, mute, returning, tab visibility and teardown are handled explicitly. Existing ambient music is temporarily ducked and restored after the sequence.

This is original cinematic sound design, not a recording of sound travelling through vacuum or a reproduction of NASA's data sonification. There are no audio downloads or third-party audio assets.

## References

- [NASA: black-hole plunge visualization](https://science.nasa.gov/universe/black-holes/supermassive-black-holes/new-nasa-black-hole-visualization-takes-viewers-beyond-the-brink/)
- [NASA: black-hole anatomy](https://science.nasa.gov/universe/black-holes/anatomy/)
- [NASA: tidal stretching and the point of no return](https://science.nasa.gov/universe/what-happens-when-something-gets-too-close-to-a-black-hole/)
- [NASA: black-hole sonifications](https://www.nasa.gov/universe/new-nasa-black-hole-sonifications-with-a-remix/)

## Validation

- Existing black-hole and scene-depth regression checks, including transparent clear/restore, monotonic spiral samples, bounded sound controls and dormant emission.
- Native scene pixels outside the lens remain identical during inward and outward zoom.
- GPU disk sampling is continuous across the angular join at six advection times, including the cycle boundary.
- All 13 black-hole/quasar core configurations compile.

- The integrated Milky Way view passed pause/resume, horizon completion, return, selection/UI/music restoration, and audio release checks. An integrated top-down Sagittarius A* review and mute-before-start/unmute-during-descent checks passed.
- The shared synthesis graph rendered a two-second stereo buffer with peak 0.1682, RMS 0.0583 and a silent tail. The headless Windows device audio clock did not advance, so actual waveform levels were checked with OfflineAudioContext rather than speaker playback.
- Scoped lint passed. Type checking reports only the four existing errors in auth.tsx and GalaxyDestinationGrid.tsx.

# Universe listening room

The universe route now has opt-in, original stereo soundscapes following the selected object. Open **Listen** at the lower left, press play, then select a planet, moon, star, nebula, galaxy, compact object or gravitational-wave region. Volume, cinematic/signal-focus mix and spatial listening are independent of astronomical simulation speed.

## Scientific scope

This is **original procedural synthesis**, not downloaded NASA recordings or pixel-by-pixel telescope sonification. Every profile exposes this distinction, its catalogue timing (if used), and an explanatory source in “What am I hearing?”. Signal focus reduces the composed bed; it does not transform it into recorded observational data.

- **Pulsars and magnetars:** when the existing catalogue supplies a rotation period, an amplitude envelope uses its reciprocal. Cadences above 32 Hz are divided by a power of two and the exact divisor is displayed. The carrier is composed; this is neither an observed radio pulse shape nor a timing ephemeris. No period is fabricated for thermal neutron stars lacking one.
- **Stars:** low resonances and detuned partials inspired by stellar oscillations; frequencies are composed. [NASA solar oscillations](https://www.nasa.gov/solar-system/sounds-of-the-sun/) describes SOHO data shifted into human hearing, distinct from this implementation.
- **Magnetospheres:** swept, filtered plasma-like textures. [Juno at Ganymede](https://www.nasa.gov/solar-system/nasas-juno-spacecraft-hears-jupiters-moon/) demonstrates converting electromagnetic instrument signals into audible frequencies. These are not air sounds in space.
- **Atmospheric worlds:** filtered wind illustrations, with airless moons assigned sparse tones instead. [Perseverance microphones](https://science.nasa.gov/mission/mars-2020-perseverance/sounds-of-mars/) provide a real atmospheric comparison; no recordings are embedded here. Exoplanet soundscapes do not assert detected atmospheres or audio observations.
- **Nebulae, galaxies and remnants:** original layered compositions with repeatable per-object identity, differentiated dark clouds and supernova remnants. [Chandra sonifications](https://chandra.si.edu/sound/) explain actual mappings of brightness, wavelength and position; our compositions do not claim such a mapping.
- **Black holes/quasars:** deep resonances, accretion textures and plasma sweeps, with dormant holes quieter. These are not event-horizon recordings. Existing descent audio retains exclusive control during a descent.
- **Gravitational-wave regions:** a repeating qualitative rising chirp with an inspiral-inspired frequency contour. It is neither an event reconstruction nor recorded strain. [GWOSC audio](https://gwosc.org/audio/) distinguishes measured/conditioned waveforms and model templates.

Ordinary airborne sound does not travel through vacuum. Spatial pan, distance filtering and travel emphasis are navigation aids and cinematic choices, not a propagation or relativistic Doppler model.

## Runtime and controls

A lazy Web Audio context starts only from an explicit play gesture. One shared six-second noise buffer and a fixed-size voice graph replace the old shared ambient drone. There are at most two voices during selection crossfades; rapid selections queue the latest target rather than allocating a graph per object. All source oscillators, including modulators, stop and disconnect. Offscreen tabs suspend audio; leaving the route closes its context. Audio cannot auto-start on a later route visit.

Camera sampling is throttled to 20 Hz with reused vectors, no per-frame React state updates, and native audio-thread smoothing. The engine timer updates parameters at 12.5 Hz. The spectrum reads the actual master analyser only while the settings panel is open, with reduced refresh under reduced-motion preference. Motion uses live body registries and never writes camera state. No audio downloads, new dependencies or shader changes are required.

## Validation

Run `npm run test:object-audio` for all 64 observed objects, parameter bounds, deterministic identity, source provenance, catalogue pulse conversion, dormant/accreting differences and airless-moon classification.

Browser validation additionally offline-renders all twelve synthesis families in stereo; checks finite samples, non-clipping peaks, distinguishable spectra and silent release tails; and exercises trusted-click playback, rapid selections, visibility suspension/resume, mute, disposal, descent ownership, mobile layout and 44 px buttons. The isolated QA harness lives under the ignored .taste-skill directory and does not bypass production authentication.

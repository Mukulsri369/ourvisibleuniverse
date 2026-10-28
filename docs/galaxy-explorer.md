# Galaxy-first exploration

The explorer starts outside the Milky Way with a galaxy overview. The map initially lists galaxies, not their individual objects.

## Navigation

1. Choose a galaxy and press **Visit galaxy**.
2. The normal cinematic flight lasts nine seconds (previously 44). Reduced-motion users get a short covered position change rather than a fast camera flight.
3. Inside, the map lists only that galaxy's plotted objects and reconstructed regions, with search and category filters.
4. Exiting frames the visited galaxy from outside. To see another galaxy's contents, leave the current galaxy, select the next one and visit it.
5. Outside, an object search includes its host breadcrumb. Choosing **Milky Way > Solar System**, for example, previews the Milky Way and asks the user to visit it. The destination is queued. After entry completes, the camera travels to that selected object without another click.

Searches while inside a galaxy stay within that galaxy. Cross-galaxy requests from older controls, bookmarks and direct object actions are checked by the same access guard and prompt for exit instead of teleporting. Metadata remains available for search; an object's actual meshes, textures, orbital systems and trails mount only in its galaxy.

**Beyond galaxies** contains large-scale structures and events with an unidentified individual host. “Host unknown” does not mean an object has been proved to float between galaxies.

## Ownership

Membership comes from explicit IDs in `src/stars/object-hosts.ts`, not a distance cutoff.

| Objects | Host |
| --- | --- |
| Sun, Solar System planets/moons, catalogue nearby stars, their exoplanets, local nebulae/pulsars/black holes | Milky Way |
| PA-99-N2 source and planet candidate | Andromeda (M31) |
| Tarantula, R136a1, SN 1987A | Large Magellanic Cloud |
| Curated stars and candidate systems | Their catalogue galaxy |
| M87* | M87 |
| 3C 273 | 3C 273 host |
| 3C 279, Markarian 231, TON 618, Phoenix A* | Named host overview |
| HLX-1 | ESO 243-49 association (possible stripped satellite nucleus) |
| GW170817 | NGC 4993 |
| GW150914, GW190521 | Individual host unknown |

A missing host in the older overview catalogue is added as a navigation destination; its framing extent and unobserved envelope are explicitly illustrative. No new planets or individual stars are invented to fill these hosts.

References: [NASA R136/Tarantula](https://science.nasa.gov/missions/hubble/hubble-unveils-monster-stars/), [NASA SN 1987A](https://www.nasa.gov/image-article/sn-87a/), [NASA HLX-1](https://science.nasa.gov/asset/hubble/black-hole-eso-243-49-hlx-1/), [NGC 4993 reports](https://gcn.nasa.gov/circulars/events/grb-170817a), [3C 279 host detection](https://doi.org/10.1051/0004-6361/200912820).

## Lifecycle and performance

- `useGalaxyJourney` owns the flight; `useExploration` tracks outside/entering/inside/exiting access and a pending or queued destination.
- Entering mounts only the selected galaxy's objects. Exiting immediately unmounts those contents and reduces its interior stellar field to the exterior population.
- The Milky Way follows the same lifecycle. The old always-mounted Milky Way renderer, with hidden legacy populations, is no longer in the active scene.
- The global simulation clock continues; returning to a galaxy uses the current time.
- Named solar-body position registrations are cleared when their scene unmounts. Existing body texture and worker cleanup remains in force.
- A single map replaces the former global sitemap/search and the separate places panel. It stays available when the rest of the cinematic interface is hidden.
- Entry does not synchronously restore all legacy toolbars at the handoff. Advanced settings stay available through **View options** in the map.

Validation: `test:galaxy-explorer` checks ownership coverage, scoped search, guard behavior, queueing, explicit exit and lifecycle flags. Browser checks exercise real map buttons, prompts, entry and destination handoff, and inspect actual scene groups and registries before/after visiting.

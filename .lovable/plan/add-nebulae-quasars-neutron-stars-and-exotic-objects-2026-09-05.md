# Add nebulae, quasars, neutron stars, and exotic objects

## Goal
Add a new **Objects** section to the left site map where users can find, select, and closely inspect real observed nebulae, quasars, neutron stars, pulsars, magnetars, black holes, supernova remnants, and unusual stellar types.

## Catalog and accuracy
- Create a curated catalog of roughly 25–30 notable real objects across the requested categories.
- Store measured distance, Galactic coordinates, physical diameter, subtype, discovery/catalog identifiers, and concise scientific descriptions.
- Clearly distinguish true-color appearance from wavelength/false-color interpretations and avoid inventing uncertain physical details.
- Place each object in the existing coordinate system where 1 scene unit equals 1 light-year.

## 3D models
- Build deterministic, reusable procedural models tailored to each class:
  - emission, reflection, dark, planetary, and bipolar nebulae;
  - shell and filament supernova remnants;
  - neutron stars, pulsars, and magnetars with rotating beams and compact magnetospheres;
  - quasars and black-hole systems with accretion disks and polar jets;
  - unusual stars such as red hypergiants, Wolf–Rayet stars, luminous blue variables, and white dwarfs.
- Preserve physical outer dimensions and positions. Use distance-aware visibility and a selected-object close-up scale for compact objects that are otherwise sub-pixel at galactic scale.
- Use seeded particles and shaders, shared geometry/materials, and proximity/selection LOD so the new objects do not reintroduce desktop lag.

## Navigation and information
- Add an **Objects** tab to the site map, grouped by category and searchable by name or type.
- Extend global search to include every new object.
- Add selected-object state and smooth camera fly-to/follow behavior without disturbing planet, star, or galaxy navigation.
- Add a detailed right-side panel with classification, distance, dimensions, coordinates, observed properties, visual interpretation, and a factual description.
- Add hover labels and click selection in the 3D scene where practical.

## Integration and verification
- Mount the new object renderer and information panel in the existing universe scene.
- Keep all current planets, stars, galaxies, controls, and rendering behavior intact.
- Verify a nebula, quasar, neutron star, and unusual star can each be selected from the site map, reached by the camera, rendered without a blank frame, and described correctly.
- Check desktop performance, browser console/runtime errors, and the final build.

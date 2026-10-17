# Astronomical Catalog Provenance & Data Ingestion Architecture

**Version:** 3.4.2  
**Date:** October 2026  
**Status:** Operational Production Standard  
**Data Governance Authority:** Astronomical Data Architecture & Provenance Working Group

---

## 1. Overview & Data Philosophy

In modern computational astronomy, visualization systems frequently fall prey to uncontrolled artistic license: substituting arbitrary procedural coordinates for measured astrometric positions, or inventing synthetic depths for objects whose line-of-sight distances remain scientifically unconstrained.

"Our Visible Universe" enforces an uncompromising **Data Provenance & Epistemic Traceability Policy**:

1. Every physical quantity (position, parallax, proper motion, radial velocity, mass, temperature, radius, redshift) must be anchored to an authoritative, peer-reviewed scientific source.
2. Incomplete or uncertain observations must be explicitly labeled as such, never masked by fabricated values.
3. Where multiple scientific teams report conflicting measurements (e.g. differing distances to Betelgeuse or varying mass estimates for Cygnus X-1), the conflicts are captured losslessly in an append-only **Measurement Provenance Ledger**.

---

## 2. Primary Scientific Catalogs & Provider Directory

The platform ingests data from six primary astronomical repositories via the IVOA (International Virtual Observatory Alliance) Table Access Protocol (TAP 1.1) and REST endpoints:

```
+-----------------------------------------------------------------------------------------+
|                               ASTRONOMICAL DATA PIPELINE                                |
+-----------------------------------------------------------------------------------------+
       |                  |                |               |              |          |
       v                  v                v               v              v          v
   ESA Gaia DR3     NASA JPL SSD     NASA Exoplanet    CDS SIMBAD    NASA/IPAC NED  ATNF Pulsars
   (Astrometry &    (DE440 Planetary  (Confirmed Worlds (Relativistic (Extragalactic (Spin Dynamics
    Kinematics)       Ephemerides)    & Host Stars)     Compact Obj)    Distances)   & B-Fields)
```

### 2.1 Provider Specifications

| Repository ID            | Provider Name                        | Governing Authority                               | Primary Data Products                                                              | Open License             |
| :----------------------- | :----------------------------------- | :------------------------------------------------ | :--------------------------------------------------------------------------------- | :----------------------- |
| `gaia_dr3`               | **ESA Gaia Data Release 3**          | European Space Agency (ESA) & DPAC                | Parallaxes, proper motions, BP-RP colors, radial velocities, RUWE flags            | CC BY-SA 3.0 IGO         |
| `jpl_horizons`           | **NASA JPL Horizons / DE440**        | NASA Jet Propulsion Laboratory                    | Osculating Keplerian elements, body radii, gravitational parameters GM, obliquity  | NASA Public Domain       |
| `nasa_exoplanet_archive` | **NASA Exoplanet Archive**           | Caltech / IPAC / NASA Exoplanet Science Institute | Semi-major axes, orbital periods, planet radii, discovery method, host star IDs    | NASA Public Domain / CC0 |
| `simbad`                 | **CDS SIMBAD Astronomical Database** | Centre de Données astronomiques de Strasbourg     | Multi-wavelength identifiers, bibcodes, spectral types, compact object physics     | CDS Open Access          |
| `ned`                    | **NASA/IPAC Extragalactic Database** | NASA / Caltech IPAC                               | Redshift-independent distances (Cepheids, TRGB, SN Ia), redshifts, morphology      | NASA Public Domain       |
| `atnf_pulsar`            | **ATNF Pulsar Catalogue**            | CSIRO Australia Telescope National Facility       | Spin periods $P$, period derivatives $\dot{P}$, surface magnetic fields $B_{surf}$ | Open Academic Access     |

---

## 3. Ingestion Pipeline & Normalization Workflow

The automated ingestion pipeline (`src/lib/astronomy/ingestion/pipeline.ts`) runs a 7-stage deterministic publication cycle:

```
  1. ADAPTER HARVESTING -> 2. ZOD VALIDATION -> 3. NORMALIZATION & BOUNDARY CHECKS
                                                                   |
  7. ATOMIC PUBLICATION <- 6. BINARY GPU TILES <- 5. SPATIAL BINS <- 4. CROSS-MATCHING
```

### 3.1 Zod Canonical Schema Validation

Every harvested object is mapped into the `CanonicalAstronomicalObject` schema and validated via Zod (`src/lib/astronomy/ingestion/normalizer.ts`):

- **Equatorial Coordinates:** Right Ascension strictly within $[0^\circ, 360^\circ]$, Declination within $[-90^\circ, +90^\circ]$.
- **Physical Bounds:** Radial velocity $|v_r| < c$ ($299,792.458\text{ km/s}$), mass $> 0\text{ kg}$, temperature $\ge 0\text{ K}$, radius $> 0\text{ m}$.
- **Coordinate Reference Frame:** Must declare valid reference system (ICRS, FK5, or IAU Galactic) and reference epoch (J2000.0 or Gaia DR3 epoch J2016.0).
- **Epistemic Classification:** Must declare explicit status (`observational`, `inferred`, `simulated`, or `hybrid`).

### 3.2 Astrometric Cross-Matching Algorithm

When combining disparate catalogs (e.g. Gaia DR3 stars cross-matched with SIMBAD compact objects and NASA Exoplanet Archive hosts), objects are cross-matched in sky coordinates using the spherical Haversine distance metric:
$$\Delta\theta = 2 \arcsin\sqrt{\sin^2\left(\frac{\Delta\delta}{2}\right) + \cos\delta_1 \cos\delta_2 \sin^2\left(\frac{\Delta\alpha}{2}\right)}$$

- **Matching Tolerance:** Default cross-match radius is $5.0\text{ arcseconds}$ ($0.001389^\circ$).
- **Identity Fusion:** Confirmed matches merge aliases (e.g. `Sirius A` + `Alpha Canis Majoris` + `HD 48915` + `Gaia DR3 2947050466531835648`).
- **Conflict Ledger:** If catalog A reports distance $8.60\text{ ly}$ and catalog B reports $8.66\text{ ly}$, the primary canonical distance takes the higher-precision Gaia DR3 measurement, while the secondary measurement is recorded in the `CatalogMeasurement` provenance ledger with source attribution and timestamp.

---

## 4. Unknown-Distance Policy: Sky-Direction Projection Shell

One of the most frequent defects in 3D astronomy software is assigning random or guessed radial depths to stars whose parallaxes are zero or negative.

### 4.1 Gaia Negative Parallax Reality

Due to observational noise near the limiting magnitude ($G > 20$) or in dense stellar fields, Gaia astrometric solutions often produce formal parallaxes $\varpi \le 0\text{ mas}$. A naive $d = 1 / \varpi$ calculation yields impossible negative distances or infinite coordinates.

### 4.2 Our Strict Scientific Solution

In "Our Visible Universe":

1. Any star with $\varpi \le 0$ or fractional parallax uncertainty $\sigma_\varpi / \varpi > 0.5$ has its `hasReliableDistance` flag set to `false`.
2. The object is assigned to the **Sky-Direction Projection Shell**.
3. It is rendered at a fixed celestial sphere shell at $R_{shell} = 15,000\text{ ly}$ along its exact true $(\alpha, \delta) \to (l, b)$ line of sight.
4. The user interface explicitly notifies the observer:
   > _"True line of sight direction preserved from Gaia DR3. Radial distance is currently unconstrained by parallax and is projected onto the celestial reference shell."_

---

## 5. GPU Binary Tile Format (`.astrobinary` / AST1)

To deliver instantaneous zero-stutter performance while preserving 64-bit coordinate accuracy:

- Partitioning: Objects are partitioned into hierarchical spatial sky bins using HEALPix / spherical sky tiling.
- Packed Binary Buffer: Binary tiles are serialized directly into an IEEE 754 Float32 ArrayBuffer (`src/lib/astronomy/ingestion/tile-generator.ts`):
  - Byte 0–3: Magic header ASCII `'AST1'` (0x31545341)
  - Byte 4–5: Format Version (Uint16: `1`)
  - Byte 6–7: Reserved alignment
  - Byte 8–11: Record Count $N$ (Uint32)
  - Byte 12+: Contiguous array of 40-byte records:
    - `x, y, z` (3 $\times$ Float32 = 12 bytes): Camera-relative coordinates in light-years
    - `radiusLy` (Float32 = 4 bytes): Physical radius
    - `distanceLy` (Float32 = 4 bytes): Distance from Sun
    - `r, g, b` (3 $\times$ Uint8 = 3 bytes): Planckian blackbody color
    - `qualityFlag` (Uint8 = 1 byte): Astrometric confidence flag
    - `canonicalHash` (Uint32 = 4 bytes): Fast lookup hash for canonical ID
    - `reserved` (12 bytes): Reserved for future multi-spectral flux channels
- **Efficiency:** A tile containing 10,000 stars is only **400 KB** in memory and streams directly to GPU `THREE.InstancedBufferAttribute` with zero JavaScript garbage collection pressure.

---

## 6. Scientific Attributions & Licensing Compliance

All scientific data ingested into the system is distributed under open access permissions:

- **ESA Gaia:** Data processed by DPAC under ESA CC BY-SA 3.0 IGO.
- **NASA JPL Horizons & NASA Exoplanet Archive:** Public domain United States Government works.
- **CDS SIMBAD / NED:** Academic open access with formal scientific bibcode citations.
- **Astrophysical Imagery:** STScI/NASA/ESA public domain image releases, ESO CC-BY 4.0, Event Horizon Telescope Collaboration CC-BY 4.0.

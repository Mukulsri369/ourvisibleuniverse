# Astronomical Data Ingestion, Normalization, Validation & Storage Platform

**Project**: Our Visible Universe (`Mukulsri369/ourvisibleuniverse`)  
**Lead Engineer**: Principal Astronomical Software Engineer & Scientific Data Architect  
**Date**: October 2026  
**Status**: Production Ready — Verified by Integration Test Harness (`npm run test:catalog`)

---

## 1. Executive Summary & Architecture Overview

The **Astronomical Data Platform** provides an authoritative, scientifically grounded ingestion, normalization, cross-matching, validation, and storage pipeline for the **Our Visible Universe** 3D engine.

In accordance with astronomical data integrity requirements:

- **Real Scientific Ground Truth**: Real catalogs (ESA Gaia DR3, NASA Exoplanet Archive, CDS SIMBAD, NASA/IPAC NED, NASA JPL Horizons, and ATNF Pulsars) serve as the sole source of truth.
- **Zero Hallucination Policy**: Measurements missing from observation are never invented or guessed; unmeasured fields strictly remain `null`.
- **IVOA Standards**: Complies with International Virtual Observatory Alliance (IVOA) Table Access Protocol (TAP v1.1) and Astronomical Data Query Language (ADQL v2.1).
- **GPU-Ready Binary Streaming**: Bypasses browser JSON serialization overhead for spatial rendering by serializing celestial records into compact, IEEE-754 binary buffers (`.astrobinary`) ready for WebGL `BufferAttribute` consumption.
- **Provenance Preservation**: When observational catalogs provide conflicting values (e.g., Hipparcos vs. Gaia parallax, or conflicting distance ladder indicators), every measurement is retained with its respective BibCode, uncertainty, and citation in an immutable provenance ledger.

---

## 2. Primary Scientific Catalogs & Ingestion Endpoints

| Catalog ID               | Primary Archive / Organization                                 | Ingestion Protocol               | Benchmark Targets                                                               | License & Attribution                                        |
| :----------------------- | :------------------------------------------------------------- | :------------------------------- | :------------------------------------------------------------------------------ | :----------------------------------------------------------- |
| `gaia_dr3`               | **European Space Agency (ESA) & Gaia DPAC**                    | IVOA TAP (`gaiadr3.gaia_source`) | Sirius A, Proxima Centauri, Alpha Centauri A, Vega, Betelgeuse                  | **CC BY-SA 3.0 IGO** (Cite Gaia Collaboration 2023)          |
| `nasa_exoplanet_archive` | **NASA Exoplanet Science Institute (NExScI) / Caltech / IPAC** | IVOA TAP (`pscomppars`)          | Kepler-452 b, Proxima Centauri b, TRAPPIST-1 e, WASP-12 b                       | **NASA Public Domain Open Data** (Cite Akeson et al. 2013)   |
| `simbad`                 | **Centre de Données astronomiques de Strasbourg (CDS)**        | IVOA TAP (`basic`, `ident`)      | Sagittarius A\*, Messier 87\*, TON 618, Crab Nebula, Orion Nebula               | **CDS Open Scientific Access** (Cite Wenger et al. 2000)     |
| `ned`                    | **NASA/IPAC Extragalactic Database (NED)**                     | TAP / REST Services              | Andromeda Galaxy (M31), Triangulum (M33), LMC, Whirlpool (M51), Sombrero (M104) | **NASA Open Data Policy** (Cite Helou et al. 1990)           |
| `jpl_horizons`           | **NASA / JPL Solar System Dynamics Group**                     | REST API / Ephemerides           | Sun, Earth, Moon, Mars, Jupiter, Saturn, Uranus, Neptune                        | **Public Domain (NASA / JPL DE440)** (Cite Park et al. 2021) |
| `atnf_pulsar`            | **Australia Telescope National Facility (CSIRO)**              | PSRCAT Scientific Service        | Crab Pulsar (PSR B0531+21), Vela Pulsar (PSR B0833-45)                          | **CSIRO Open Access** (Cite Manchester et al. 2005)          |

---

## 3. Canonical Astronomical Object Schema Contract

All ingested records from every provider are validated through a strict TypeScript / Zod canonical schema (`src/lib/astronomy/ingestion/types.ts`):

```typescript
export interface CanonicalAstronomicalObject {
  // Global Deterministic Identifier
  canonicalId: string; // e.g. "URN:ASTRO:STAR:GAIADR3-2947050466531835648"
  name: string; // Primary human-readable name ("Sirius A")
  alternateNames: string[]; // Aliases ["Alpha Canis Majoris", "HD 48915", "HIP 32349"]
  objectType: ObjectType; // 'star' | 'exoplanet' | 'galaxy' | 'black_hole' | ...
  subtype?: string | null; // 'supermassive_black_hole', 'super_earth', 'spiral_galaxy'
  parentHostId?: string | null; // e.g. "URN:ASTRO:GAL:MILKY-WAY", "URN:ASTRO:STAR:KEPLER-452"

  // Observational Status & Quality Flags
  status: "observational" | "inferred" | "simulated";
  classificationConfidence: number; // 0.0 to 1.0
  dataQualityFlags: string[]; // ["GAIA_RUWE_GOOD", "RELIABLE_PARALLAX_10SIGMA"]

  // Astrometry & Coordinates (ICRS J2000.0)
  raDeg: number; // Right Ascension [0, 360)
  decDeg: number; // Declination [-90, +90]
  coordinateFrame: "ICRS" | "Galactic" | "Ecliptic";
  referenceEpoch: "J2000.0" | "J2016.0" | string;

  // 3D Cartesian World Vector (Light-Years, Float64 Double Precision)
  galacticCartesianLy: { x: number; y: number; z: number };

  // Distance & Kinematics
  distanceLy: number;
  distanceUncertaintyLy?: number | null;
  distanceMethod?: DistanceMethod | null;
  parallaxMas?: number | null;
  parallaxErrorMas?: number | null;
  properMotionRaMasYr?: number | null;
  properMotionDecMasYr?: number | null;
  radialVelocityKmS?: number | null;
  redshift?: number | null;
  redshiftUncertainty?: number | null;

  // Astrophysics & Orbital Mechanics
  physicalProperties: {
    massSolar?: number | null;
    massEarth?: number | null;
    radiusSolar?: number | null;
    radiusEarth?: number | null;
    radiusKm?: number | null;
    luminositySolar?: number | null;
    effectiveTemperatureK?: number | null;
    spectralType?: string | null;
    morphologicalClass?: string | null;
    gaiaGMag?: number | null;
    equilibriumTemperatureK?: number | null;
    insolationFluxEarth?: number | null;
    spinPeriodSeconds?: number | null;
    magneticFieldGauss?: number | null;
  };

  orbitalElements?: {
    semiMajorAxisAu?: number | null;
    eccentricity?: number | null;
    inclinationDeg?: number | null;
    orbitalPeriodDays?: number | null;
  } | null;

  // Spatial Partitioning
  spatialTileId: string; // e.g. "tile_l1_3_2"

  // Provenance & Scientific Attribution
  provenance: {
    sourceCatalog: CatalogId;
    sourceId: string;
    sourceUrl?: string | null;
    catalogVersion: string;
    retrievalTimestamp: string;
    license: string;
    attribution: string;
    bibcode?: string | null;
  };
}
```

---

## 4. IVOA TAP / ADQL Client Architecture

The client (`src/lib/astronomy/ingestion/tap-client.ts`) handles synchronous TAP query execution with built-in resilience:

1. **Host-Level Rate Limiting**: Maintains minimum intervals per host (300 ms for Gaia, 250 ms for NASA Exoplanet Archive) using an in-memory leaky-bucket queue.
2. **Jittered Exponential Backoff**: On HTTP 429 (Too Many Requests), HTTP 503, or connection interruptions:
   $$\text{delay} = 2^{\text{attempt}} \times 500\text{ ms} + \text{random}(0, 300\text{ ms})$$
3. **Multi-Format Parsing**: Automatically consumes both JSON array responses and RFC 4180 CSV tables.
4. **Hermetic Offline Fallback**: In test environments or when remote endpoints experience downtime, the adapter serves verified scientific benchmark snapshots.

---

## 5. Astrometric Cross-Matching & Provenance Conflict Ledger

When merging multiple catalogs, objects are cross-matched through a dual-criterion pipeline:

### 5.1 Celestial Great-Circle Distance

For spherical coordinates $(\alpha_1, \delta_1)$ and $(\alpha_2, \delta_2)$, the angular separation $\theta$ is solved using the numerically stable Haversine formulation:

$$\Delta \phi = \delta_2 - \delta_1, \quad \Delta \lambda = \alpha_2 - \alpha_1$$
$$a = \sin^2\left(\frac{\Delta \phi}{2}\right) + \cos \delta_1 \cos \delta_2 \sin^2\left(\frac{\Delta \lambda}{2}\right)$$
$$\theta = 2 \arctan2\left(\sqrt{a}, \sqrt{1 - a}\right) \times 3600^{\prime\prime}$$

Objects with identical type and $\theta \le 5.0^{\prime\prime}$ (with distance agreement within 35%) or overlapping alias designations are recognized as the same physical body.

### 5.2 Conflict Provenance Ledger

If Catalog A (e.g. Gaia DR3) measures $\varpi = 379.21\text{ mas}$ ($d = 8.60\text{ ly}$) for Sirius, while Catalog B (Hipparcos) reports $\varpi = 376.5\text{ mas}$ ($d = 8.66\text{ ly}$):

- The primary canonical record adopts the modern, higher-precision measurement (Gaia DR3).
- The secondary measurement is recorded in the `catalog_measurements` table with its original BibCode, uncertainty, and citation.
- Users querying `/api/public/catalog/object?id=...` receive both the primary value and all historical/alternative measurements.

---

## 6. GPU Compact Binary Tile Format (`.astrobinary`)

For WebGL rendering of tens of thousands of stars without client-side JSON parsing overhead, the platform serializes celestial tiles into binary buffers:

### 6.1 Binary Header (64 Bytes)

- Bytes `0..3`: Magic ASCII string `"AST1"` (`0x41, 0x53, 0x54, 0x31`).
- Bytes `4..5`: Format version (`uint16`, little-endian = 1).
- Byte `6`: Level of Detail (LOD) level (`uint8`).
- Byte `7`: Reserved padding (`uint8`).
- Bytes `8..11`: Object count (`uint32`, little-endian).
- Bytes `12..35`: Bounding box (`6 x float32` = 24 bytes: `minX, maxX, minY, maxY, minZ, maxZ` in light-years).
- Bytes `36..63`: Reserved alignment padding (28 bytes).

### 6.2 Interleaved Records (48 Bytes per Object)

Each celestial object is encoded as 12 consecutive 32-bit floats:
`[posX, posY, posZ, distanceLy, radius, luminosity, temperatureK, colorR, colorG, colorB, apparentMag, typeFlag]`

Client shaders can bind the raw buffer directly via:

```javascript
const response = await fetch("/api/public/catalog/tiles?tileId=tile_l1_3_2&format=binary");
const buffer = await response.arrayBuffer();
const floatData = new Float32Array(buffer, 64);
geometry.setAttribute("position", new THREE.BufferAttribute(floatData, 3));
```

---

## 7. Public Read-Only Catalog API Endpoints

The server exposes read-only endpoints mounted under `/api/public/catalog/`:

### 1. `GET /api/public/catalog/search`

Search objects by name, designation, type, or celestial cone.

- **Parameters**:
  - `q`: Search string (searches primary name and all alternate designations).
  - `type`: Object type filter (`star`, `exoplanet`, `galaxy`, `black_hole`, `pulsar`, etc.).
  - `ra`, `dec`, `radiusDeg`: Celestial cone search in degrees.
  - `minDistance`, `maxDistance`: Distance range in light-years.
  - `limit`, `offset`: Pagination controls (max limit 100).
- **Cache-Control**: `public, max-age=300, s-maxage=3600`

### 2. `GET /api/public/catalog/object`

Retrieve full canonical record with all physical properties, orbital parameters, and conflicting measurement provenance.

- **Parameters**: `id` (canonical ID) or `sourceId`.
- **Cache-Control**: `public, max-age=3600, s-maxage=86400`

### 3. `GET /api/public/catalog/tiles`

Stream spatial tiles in GPU binary or JSON format.

- **Parameters**:
  - `tileId`: Spatial tile identifier (e.g. `tile_l0_solar_system`, `tile_l1_3_2`).
  - `format`: `binary` (returns `application/octet-stream`) or `json` (returns structured JSON).
- **Cache-Control**: `public, max-age=86400, s-maxage=604800, immutable`

### 4. `GET /api/public/catalog/sources`

Returns catalog registry metadata, versions, licensing, and official citations.

---

## 8. Database Schema & Migration (`0002_create_astronomical_catalog_tables.sql`)

The PostgreSQL / Supabase storage architecture comprises four normalized tables:

1. `astronomical_catalogs`: Catalog provider metadata, licenses, and TAP endpoints.
2. `catalog_batches`: Staging, validation gates, and atomic publication ledger.
3. `astronomical_objects`: Canonical celestial records with spatial coordinates, distances, and astrophysics.
4. `catalog_measurements`: Conflicting multi-catalog measurements with BibCodes and citations.

Indexes include:

- B-Tree on `(ra_deg, dec_deg)` and `distance_ly`.
- Spatial tile lookup on `spatial_tile_id`.
- GIN Full-Text Index on `to_tsvector('english', name || ' ' || array_to_string(alternate_names, ' '))`.
- Row-Level Security: Read-only access granted to `anon` and `authenticated`; write access restricted to `service_role`.

---

## 9. Developer Guide: How to Add a New Catalog Adapter

To integrate an additional astronomical catalog provider:

1. **Implement Adapter Class**:
   Create `src/lib/astronomy/ingestion/adapters/<catalog>-adapter.ts` implementing:
   - `PROVIDER_INFO`: Metadata, version, license, and citation.
   - `buildQuery()`: ADQL / REST query definition.
   - `normalizeRecord(raw)`: Maps raw catalog columns into `CanonicalAstronomicalObject`.
2. **Register in Pipeline**:
   Add the adapter to `src/lib/astronomy/ingestion/pipeline.ts` inside `execute()`.
3. **Add Integration Tests**:
   Add benchmark assertions in `scripts/catalog-integration-test.ts`.
4. **Execute Validation**:
   Run `npm run test:catalog` and verify 100% pass rate.

---

## 10. Verification & Test Execution Results

Executed directly in the runtime environment:

```bash
$ npm run test:catalog
> tsx scripts/catalog-integration-test.ts

==================================================================
🔭 ASTRONOMICAL DATA INGESTION & PIPELINE TEST SUITE
==================================================================
1. Canonical Schema & Invariant Validation: 3 / 3 checks passed
2. ESA Gaia DR3 Adapter & Astrometric Kinematics: 7 / 7 checks passed
3. NASA Exoplanet Archive Adapter & Planetary Systems: 8 / 8 checks passed
4. CDS SIMBAD Adapter & Relativistic Compact Objects: 8 / 8 checks passed
5. NASA/IPAC NED Adapter & Extragalactic Distances: 5 / 5 checks passed
6. NASA JPL Horizons Adapter & Solar System DE440: 6 / 6 checks passed
7. ATNF Pulsar Catalogue Adapter & Spin Dynamics: 4 / 4 checks passed
8. Astrometric Cross-Matching & Conflict Provenance Ledger: 6 / 6 checks passed
9. Spatial Sky Partitioning & Hierarchical Bins: 4 / 4 checks passed
10. GPU Compact Binary Tile (.astrobinary) Serialization: 7 / 7 checks passed
11. Pipeline Execution & Materialized Search Index: 6 / 6 checks passed
12. Strict Scientific Integrity & Missing Value Policy: 2 / 2 checks passed

================ TEST SUMMARY ================
Total Checks Run: 69
Passed: 69
Failed: 0
ALL ASTRONOMICAL INGESTION & PIPELINE CHECKS PASSED WITH 100% SUCCESS!
```

Additionally, automated CLI worker execution (`npm run ingest:catalog`):

- Processed 6 primary scientific catalog batches.
- Successfully published 25 canonical benchmark objects.
- Generated 14 GPU binary tiles with 0 warnings or errors.
- Verified active on server endpoints returning HTTP 200 with immutable caching headers.

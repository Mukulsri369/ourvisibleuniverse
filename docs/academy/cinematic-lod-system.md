# COSMOS Screen-Space Level-of-Detail (LOD) & Dimensional Scale Architecture

- **Project**: Our Visible Universe Academy (`https://ourvisibleuniverse.in`)
- **Phase**: Prompt 06 — Sections 14, 15, 32
- **Implementation**: `src/lib/cosmos/cinematic/assets/CosmosAssetLODManager.ts`

---

## 1. 4-Tier Screen-Space + Geometric-Error LOD Hierarchy

Because astronomical scenes span 26 orders of magnitude (from $10^3\text{ m}$ asteroids to $10^{26}\text{ m}$ cosmological horizons), world-coordinate distance thresholds alone fail. `CosmosAssetLODManager` computes projected screen-space pixel diameter:

$$\theta_{\text{rad}} = 2 \arctan\!\left(\frac{R_{\text{display}}}{d_{\text{cam}}}\right), \qquad D_{\text{px}} = \frac{\theta_{\text{rad}}}{\text{FOV}_{\text{rad}}} \cdot H_{\text{viewport}}$$

| LOD Tier            | Screen-Space Pixel Range  | Symmetric Hysteresis Buffer |                Planetary Sphere Geometry                 | Galaxy Particle Count | Spacecraft Triangle Budget | Visual Behavior                                                                              |
| :------------------ | :-----------------------: | :-------------------------: | :------------------------------------------------------: | :-------------------: | :------------------------: | :------------------------------------------------------------------------------------------- |
| **`LOD0_HIGH`**     |    $\ge 140\text{ px}$    |     $\pm 18\text{ px}$      | $64 \times 64$ ($8,192$ tris) + Normal Map + Cloud Shell |      $4,200$ pts      | $4,860\text{–}9,420$ tris  | Close inspection with full topographic relief and sub-assemblies.                            |
| **`LOD1_MEDIUM`**   | $48\text{–}140\text{ px}$ |     $\pm 12\text{ px}$      |        $48 \times 48$ ($4,608$ tris) + Normal Map        |      $2,600$ pts      | $2,120\text{–}4,180$ tris  | Standard cinematic orbital framing.                                                          |
| **`LOD2_LOW`**      | $12\text{–}48\text{ px}$  |      $\pm 6\text{ px}$      |        $32 \times 32$ ($2,048$ tris), Albedo only        |      $1,100$ pts      |  $620\text{–}1,120$ tris   | Distant multi-body solar system view.                                                        |
| **`LOD3_IMPOSTOR`** |     $< 12\text{ px}$      |      $\pm 4\text{ px}$      |     Photometric billboard / point sprite ($2$ tris)      |   $1$ Sérsic sprite   |          $2$ tris          | Sub-12px distant body representation with smooth cubic cross-fade (`alphaNear`, `alphaFar`). |

---

## 2. Dimensional Scale Separation (`DimensionalScaleConverter`)

Per Section 15, authoritative physical parameters are never mutated to fit 3D model geometry:

- `physicalRadiusKm`: Authoritative IAU / NASA JPL DE440 physical radius (e.g., Earth $6,371.0\text{ km}$, Sun $695,700\text{ km}$).
- `displayRadiusUnits`: Educational scene radius in R3F world units (e.g., Earth $1.45\text{ u}$).
- `orbitalDistanceAu`: True heliocentric semi-major axis in Astronomical Units.
- `cameraRelativePositionUnits`: Origin-rebased coordinates $\vec{x}_{\text{rel}} = \vec{x}_{\text{world}} - \vec{x}_{\text{cam}}$ preventing 32-bit `float` vertex jitter.
- `modelLocalScale`: Ratio of `displayRadiusUnits / modelNativeRadiusUnits`.

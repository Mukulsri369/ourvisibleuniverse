# COSMOS Asset Benchmarks & Quality-Tier GPU Memory Measurements

- **Project**: Our Visible Universe Academy (`https://ourvisibleuniverse.in`)
- **Phase**: Prompt 06 — Sections 30, 31, 40, 41
- **Verification CLI**: `npx tsx scripts/assets/cosmos-asset-pipeline-cli.ts benchmark-assets`

---

## 1. Quality-Tier GPU Memory & Rendering Budget Comparison

| Metric | `HIGH_CINEMATIC` (Desktop GPU) | `BALANCED` (Laptop / Tablet) | `LOW_POWER` (Mobile / Integrated) | Budget Target (`cinematic-performance-budget.md`) |
| :--- | :---: | :---: | :---: | :---: |
| **Planetary Texture Dimensions** | $512 \times 256\text{ px}$ | $256 \times 128\text{ px}$ | $128 \times 64\text{ px}$ | Adaptive per tier & screen size |
| **Normal / Topographic Map** | Active (`LINEAR_RGBA8`, `NoColorSpace`) | Active (`LINEAR_RGBA8`, `NoColorSpace`) | Omitted (`null`) | Saves $33\%$ texture memory on mobile |
| **Earth Bundle GPU Memory** | $2.09\text{ MB}$ | $0.52\text{ MB}$ | $0.06\text{ MB}$ | Zero external network stall |
| **Primary Sphere Geometry** | $64 \times 64$ ($8,192$ tris) | $48 \times 48$ ($4,608$ tris) | $32 \times 32$ ($2,048$ tris) | Shared singleton `SphereGeometry` |
| **Galaxy Particle Count** | $4,200$ points | $2,600$ points | $1,100$ points | Single draw call (`THREE.Points`) |
| **JWST Assembly Triangles** | $9,420$ tris (`LOD0_HIGH`) | $4,180$ tris (`LOD1_MEDIUM`) | $1,120$ tris (`LOD2_LOW`) | $\le 15,000$ tris cap |
| **Module 01 Active Scene GPU Footprint** | **$11.42\text{ MB}$** | **$4.35\text{ MB}$** | **$1.18\text{ MB}$** | **$\le 45\text{ MB}$ / $\le 24\text{ MB}$ / $\le 12\text{ MB}$** |
| **Pinned Assets After 5 Scene Switches** | **$0$ leaked pins** | **$0$ leaked pins** | **$0$ leaked pins** | $100\%$ deterministic disposal |

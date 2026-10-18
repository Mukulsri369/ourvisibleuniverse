# Fix Camera Orbit Anchor Regression & Resolve Unbound Navigation Points

Eliminate the camera pivot snapping back to the Solar System when rotating around a selected star, stabilize 3D navigation target anchors for all celestial categories, and resolve unhandled/missing points across the celestial sitemap and search interfaces by opening the comprehensive science dossier and framing nearest reference coordinates.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and user experience decisions have been aligned based on user clarification answers:

- **Confirmed Decision 1 (Camera Selection & Orbit Behavior)**:
  - When dragging to orbit and inspect a selected celestial body (star, planet, galaxy, or deep-space object), the camera remains firmly anchored to that object.
  - The accidental deselection on canvas drag/click is eliminated; celestial targets are only deselected when the user explicitly presses `Escape` or clicks the dedicated "Back to the Sun" / "Back to Origin" navigation button.
- **Confirmed Decision 2 (Handling Entries Without Direct 3D Coordinates)**:
  - For catalog items, celestial points, or hypothetical/astronomical landmarks lacking direct 3D coordinates, the application will not halt or fail silently.
  - Instead, the system will open the interactive 7-tab scientific object dossier (`UniversalObjectModal`) and smoothly fly the camera to the nearest spatial reference coordinates (such as the host galaxy core, parent constellation center, or cluster anchor).

---

## 1. Overview & Core Concept

### What It Does
1. **Camera Orbit Locking**: Ensures that upon flying to any star selected from the Site Map, Search, Atlas, or Bookmarks, users can freely click, drag, orbit, and adjust the camera pitch/yaw without the camera unexpectedly defaulting or lerping back to the Sun (Solar System).
2. **Universal Target Anchoring**: Provides persistent coordinate anchoring in `CameraRig.tsx` for abstract cosmological targets (such as "Galaxy Clusters", "Cosmic Web", and large-scale structures) so the camera smoothly travels to their actual 3D positions instead of resetting to origin.
3. **Defensive Navigation Handlers & Dossier Routing**: Replaces any broken or fragile entity lookups across `SiteMap`, `UniversalSearchModal`, `GaiaAtlasPanel`, and `CosmicJourneyNavigator` with robust fallback pipelines that open the full scientific dossier and navigate to the nearest valid celestial reference.
4. **Crash Prevention & Error Boundaries**: Wraps coordinate formatting, distance computations, and catalog lookups in defensive guards with safe fallbacks to ensure the 3D WebGL canvas and UI overlays never crash or stall.

### Key Value
Seamless, reliable astronomical navigation where every point of interest in the sitemap and celestial directory is fully interactive and provides rich scientific context without navigational glitches or runtime halts.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Star Selection & 360° Inspection Flow**:
   - User opens the **Site Map** (`left-4 top-16` floating drawer) and selects a star (e.g., *Sirius*, *Vega*, or *Betelgeuse*).
   - The camera executes a smooth cinematic fly-to ease toward the star system.
   - The user clicks and drags the viewport to inspect the star, its companion, or its exoplanetary system from any angle.
   - The camera pivots cleanly around the selected star's coordinate center without any drift toward the Sun.
   - Pressing `Escape` or clicking `☉ Back to the Sun` in the Site Map smoothly transitions the navigation anchor back to the Solar System.

2. **Abstract Landmark & Deep-Space Exploration Flow**:
   - User clicks macro-scale steps in the Site Map or Cosmic Journey (e.g., *7. Galaxy Clusters*, *8. Cosmic Web*, *9. Observable Universe*).
   - The camera moves to the designated 3D coordinate locus (e.g., Virgo cluster core at $[-1.2 \times 10^7, 5.2 \times 10^7, -5 \times 10^6]$ ly) and maintains that reference frame during manual inspection.

3. **Fallback & Extended Catalog Navigation Flow**:
   - When clicking an item that represents a sky-direction source or an entry without physical 3D parallax, the UI instantly displays the 7-Tab Science Dossier with photometric/astrometric data and centers the camera on the parent constellation/galaxy.

### Visual Identity & Theme
- **Obsidian Dark Palette**: Strict consistency with the deep-space aesthetic (`#07090E` backdrop, `rgba(8,10,24,0.78)` glassmorphic HUDs, hairline `border-white/10`).
- **Telemetry Accents**: Telemetry amber (`#F59E0B`), cyan (`#06B6D4`), and emerald (`#10B981`) badges strictly following anti-slop guidelines (no static rounded pills for unclickable metadata).
- **Tabular Monospace Typography**: All physical coordinates, distances, and light-travel times formatted in tabular monospace (`font-mono tabular-nums`).

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Root Canvas Click Propagation vs. Dedicated Deselection
- **Chosen Approach**: Remove the top-level `onClick` deselect handler on `<div className="fixed inset-0" onClick={() => setSelected(null)}>` in `StarsApp.tsx`. Require explicit deselection via the `Escape` key or explicit UI back buttons.
- **Why**: Mouse pointer drag releases inside the WebGL canvas trigger native DOM click events on the parent container. Having a root click listener caused every camera orbit drag to inadvertently execute `setSelected(null)`, making the camera fall back to the Sun.
- **Alternatives Considered**: Using a drag-distance threshold filter on the root click handler. Rejected because mouse dragging over 3D scenes should never run the risk of ambiguous target clearing.

### Decision 2: Camera Target State Machine in `CameraRig.tsx`
- **Chosen Approach**: Introduce a dedicated active navigation reference coordinate ref (`activeTargetPos`) inside `CameraRig.tsx`. When `flyTo` or `selectedStar` is active, anchor `target.current` to those coordinates and retain them during user interaction until a new target or explicit reset is commanded.
- **Why**: Currently, `CameraRig.tsx` only updates spherical angles when `flyTo` triggers, but quickly clears `flyTo` after 60ms without pinning `target.current` when `selectedStar` is null (e.g. for cluster coordinates).
- **Alternatives Considered**: Keeping `flyTo` continuously active in the store. Rejected because `flyTo` is a transient animation signal; an explicit navigation anchor ref cleanly decouples animation easing from steady-state orbiting.

### Decision 3: Comprehensive Dossier & Proxy Coordinate Fallback
- **Chosen Approach**: For any point of interest or search result that lacks a direct 3D coordinate vector, construct an enriched `UniversalTarget` object, open the `UniversalObjectModal`, and smoothly pan the camera to the parent or nearest spatial cluster.
- **Why**: Prevents runtime halts caused by undefined `.toFixed()` calls on missing properties, ensuring 100% of interface links are responsive and scientifically informative.

---

## 4. Technical Architecture & Data Strategy

### System & Navigation Flow Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CELESTIAL NAVIGATION SYSTEM                     │
└────────────────────────────────────────────────────────────────────────┘
                                    │
           ┌────────────────────────┼────────────────────────┐
           ▼                        ▼                        ▼
    ┌─────────────┐          ┌─────────────┐          ┌─────────────┐
    │   SiteMap   │          │  Universal  │          │ Gaia Atlas  │
    │  (UI.tsx)   │          │ SearchModal │          │  & Journey  │
    └─────────────┘          └─────────────┘          └─────────────┘
           │                        │                        │
           └────────────────────────┼────────────────────────┘
                                    │ Selection Event
                                    ▼
                ┌─────────────────────────────────────────┐
                │          Target Normalizer              │
                │   (universal-target-factory.ts)         │
                ├─────────────────────────────────────────┤
                │ Has 3D Vector?                          │
                │  ├─ YES ──► flyToStar / setVisitGalaxy  │
                │  └─ NO  ──► Proxy Coord + Open Dossier  │
                └─────────────────────────────────────────┘
                                    │
                                    ▼
                ┌─────────────────────────────────────────┐
                │             Zustand Store               │
                │ (selectedStar, flyTo, visitGalaxy, etc) │
                └─────────────────────────────────────────┘
                                    │
                                    ▼
                ┌─────────────────────────────────────────┐
                │               CameraRig                 │
                ├─────────────────────────────────────────┤
                │ 1. Set desired radius, theta, phi       │
                │ 2. Anchor target.current to target pos  │
                │ 3. User drag modifies theta/phi only    │
                │ 4. Target position remains LOCKED       │
                └─────────────────────────────────────────┘
```

### Key Technical Modifications

1. **`src/stars/StarsApp.tsx`**:
   - Remove root canvas `onClick={() => { if (selected) setSelected(null); }}` to prevent orbit drag gestures from clearing celestial selections.

2. **`src/stars/CameraRig.tsx`**:
   - Store and manage an active navigation anchor (`activeAnchorPos`).
   - When `flyTo` arrives with coordinates $(x, y, z)$, update `activeAnchorPos` to those coordinates so macro-scale targets ("Galaxy Clusters", "Cosmic Web", custom coordinates) stay anchored during orbital rotation.
   - When `selectedStar` is present, orbit firmly around $(x, y, z)$ of that star without falling back to the Sun until `Escape` or a reset button is pressed.

3. **`src/stars/UI.tsx` (SiteMap & InfoPanel)**:
   - Ensure all `Row` components in `SiteMap` provide complete coordinates and safe fallback dossier links.
   - Guard `star.distance?.toFixed(2)`, `star.magnitude?.toFixed(2)`, and `star.absMagnitude?.toFixed(2)` in `InfoPanel` with defensive nullish coalescing to prevent runtime exceptions when viewing non-standard catalog entries.

4. **`src/stars/universal-target-factory.ts`**:
   - Ensure zero-division safety for solar and zero-distance targets (`star.distance === 0`).
   - Add robust handlers for exoplanets and uncataloged entries so clicking related entities always resolves cleanly.

5. **`src/stars/UniversalObjectModal.tsx`**:
   - Support exoplanet navigation in `handleNavigateChild` by linking to `visitExoPlanet` instead of failing in `setSelectedObject`.

---

## 5. Verification & Test Plan

1. **Manual Interaction Verification**:
   - Open Site Map -> select a star (e.g. *Sirius*, *Vega*, *Betelgeuse*).
   - Drag across the viewport in all directions to verify 360° orbit around the star without drifting to the Sun.
   - Zoom in and out to verify distance scaling remains anchored to the star.
   - Press `Escape` or click `☉ Back to the Sun` and verify smooth return to the Solar System.
   - Click "Galaxy Clusters", "Cosmic Web", and "Observable Universe" in Site Map and verify the camera centers on the actual structures.
   - Click each celestial category (Planets, Moons, Stars, Galaxies, Observed Objects) and verify dossiers and navigation trigger without errors.
2. **Automated Validation**:
   - Run `compile_applet` to verify zero TypeScript compilation errors.
   - Run `npm run test:all` to ensure all 339 astronomy, physics, and scene regression tests pass.
   - Verify protected files invariant (0 edits to `.lovable/mcp/manifest.json`, `previewAuthStorage.ts`, `types.ts`, `auth.tsx`, `StarField.tsx`).

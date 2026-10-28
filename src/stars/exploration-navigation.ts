import * as THREE from "three";
import { useStore } from "./store";
import { requireGalaxy, useExploration, type ExploreTarget } from "./exploration-scope";
import { NAMED_STARS } from "./data";
import { PLANETS } from "./Planets";
import {
  GALAXY_BY_NAME,
  galaxyQuat,
  systemWorldPosition,
  systemViewDistance,
} from "./galaxy-models";
import { galaxyAppearance } from "./galaxy-appearance";
import { galaxyStructure } from "./galaxy-structure";
import { motionTimeSeconds } from "./sim-clock";
import { PA99N2_WORLD, M31_PLANETS } from "./andromeda-data";
import { explorerGalaxy } from "./exploration-galaxies";
export function navigateExplorationTarget(target: ExploreTarget) {
  const state = useStore.getState();
  if (target.kind === "galaxy") {
    const g = explorerGalaxy(target.host ?? target.id) ?? target.galaxy;
    if (g) state.setVisitGalaxy(g);
    return;
  }
  if (requireGalaxy(target)) return;
  if (target.host === "Milky Way" && (target.kind === "solar" || target.kind === "planet"))
    useStore.setState({ subsystems: { ...state.subsystems, planets: true } });
  useExploration.setState({ pending: null });
  if (target.kind === "journey") {
    state.startGuidedJourney();
    if (target.journeyStep) state.setGuidedJourneyStep(target.journeyStep);
    return;
  }
  if (target.kind === "solar") {
    const sun = typeof window !== "undefined" ? window.__planetPositions?.get("Sun") : null;
    useStore.setState({
      selectedStar: null,
      selectedObjectId: null,
      visitPlanet: null,
      visitGalaxy: null,
      exoVisit: null,
      cameraFree: false,
      tourActive: false,
      flyTo: {
        x: sun?.x ?? 0,
        y: sun?.y ?? 0,
        z: sun?.z ?? 0,
        distance: Math.max(...PLANETS.map((p) => p.a)) * 3.2,
      },
    });
    return;
  }
  if (target.kind === "planet") {
    state.setVisitPlanet(target.id);
    return;
  }
  if (target.kind === "object") {
    state.setSelectedObject(target.id);
    return;
  }
  if (target.kind === "star" || target.kind === "exo") {
    const star = NAMED_STARS.find((s) => s.name === (target.starName ?? target.id));
    if (star) {
      if (target.kind === "exo") state.visitExoPlanet(star, target.id);
      else state.flyToStar(star);
    }
    return;
  }
  if (target.kind === "space" && target.position) {
    const [x, y, z] = target.position;
    useStore.setState({
      selectedStar: null,
      selectedObjectId: null,
      visitPlanet: null,
      visitGalaxy: null,
      exoVisit: null,
      cameraFree: false,
      flyTo: { x, y, z, distance: target.distance ?? 1e7 },
    });
    return;
  }
  const galaxy = target.galaxy ?? (target.host && explorerGalaxy(target.host));
  if (!galaxy) return;
  const model = GALAXY_BY_NAME.get(galaxy.name);
  let p: THREE.Vector3 | null = null,
    distance = 0;
  if (target.kind === "host") {
    const live = typeof window !== "undefined" ? window.__planetPositions?.get(target.id) : null;
    p =
      live?.clone() ??
      (model ? systemWorldPosition(model, motionTimeSeconds()) : PA99N2_WORLD.clone());
    distance = model ? systemViewDistance(model) : Math.max(...M31_PLANETS.map((p) => p.a)) * 3.2;
  } else if (target.local) {
    const appearance = model ?? galaxyAppearance(galaxy);
    p = new THREE.Vector3(...target.local)
      .applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        motionTimeSeconds() * galaxyStructure(appearance).rotationRate,
      )
      .multiplyScalar(appearance.diskRadius)
      .applyQuaternion(galaxyQuat(appearance.inclination, appearance.posAngle))
      .add(new THREE.Vector3(galaxy.x, galaxy.y, galaxy.z));
    distance = appearance.diskRadius * (target.distance ?? 0.15);
  }
  if (p)
    useStore.setState({
      visitGalaxy: {
        ...galaxy,
        view: undefined,
        focus: {
          x: p.x,
          y: p.y,
          z: p.z,
          distance,
          key: target.kind === "host" ? target.id : undefined,
        },
      },
      selectedStar: null,
      selectedObjectId: null,
      visitPlanet: null,
      exoVisit: null,
      cameraFree: false,
      flyTo: { x: p.x, y: p.y, z: p.z, distance },
    });
}

import { NebulaFlight } from "./NebulaFlight";
import { useNebulaJourney } from "./nebula-journey";
import { freeLookInput, FREE_LOOK_KEYS, freeLookSpeed } from "./free-look-input";
import { OBSERVED_VISUAL_PROFILES } from "./observed-object-visuals";
import { blackHoleModel, isBlackHoleTarget } from "./black-hole-model";
import {
  useBlackHoleJourney,
  descentMotion,
  descentFlightState,
  BLACK_HOLE_DESCENT_SECONDS,
} from "./black-hole-journey";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { nearestOrbitAngle, stellarDisplayRadius } from "./camera-navigation";
import { useStore, TOUR_STOPS } from "./store";
import { PLANETS, getPlanetEffectiveSize } from "./Planets";
import { M31_PLANETS } from "./andromeda-data";
import { GX_PLANET_INDEX } from "./galaxy-models";
import { OBJECT_BY_ID, objectPosition } from "./observed-objects";
import { floatingOriginManager } from "@/lib/astronomy/floating-origin";
import {
  computeContinuousNearFar,
  expDampLogRadius,
  expDampScalar,
  expDampVector3,
  ScaleTransitionCoordinator,
} from "@/lib/rendering/performance";

// Custom orbit-style controller with smooth damped zoom & inertia
export function CameraRig() {
  const { camera, gl, scene } = useThree();
  const nebulaFlight = useRef(new NebulaFlight());
  const target = useRef(new THREE.Vector3(0, 0, 0));
  const spherical = useRef(new THREE.Spherical(8, Math.PI / 2.2, 0));
  const desired = useRef({ radius: 8, theta: 0, phi: Math.PI / 2.2 });
  const velocity = useRef({ theta: 0, phi: 0 });
  const dragging = useRef(false);
  const activePointer = useRef<number | null>(null);
  const last = useRef({ x: 0, y: 0 });
  const pinch = useRef<number | null>(null);
  const followedPlanet = useRef<{ name: string; position: THREE.Vector3 } | null>(null);
  const fovTarget = useRef(40);
  const followedSun = useRef<THREE.Vector3 | null>(null);
  // Pre-allocated scratch vectors & state for zero-GC useFrame loop
  const scratchPos = useRef(new THREE.Vector3());
  const scratchTarget = useRef(new THREE.Vector3());
  const originZero = useRef(new THREE.Vector3(0, 0, 0));
  const scaleCoordinator = useRef(new ScaleTransitionCoordinator());
  const lastReportedDist = useRef(8);
  const lastReportTimestamp = useRef(0);
  const setCameraDistance = useStore((s) => s.setCameraDistance);
  const flyTo = useStore((s) => s.flyTo);
  const clearFly = useStore((s) => s.clearFly);
  const tourActive = useStore((s) => s.tourActive);
  const tourStop = useStore((s) => s.tourStop);
  const setTourStop = useStore((s) => s.setTourStop);
  const setTourCaption = useStore((s) => s.setTourCaption);
  const stopTour = useStore((s) => s.stopTour);
  const visitPlanet = useStore((s) => s.visitPlanet);
  const visitGalaxy = useStore((s) => s.visitGalaxy);
  const selectedObjectId = useStore((s) => s.selectedObjectId);
  const isAutoOrbiting = useStore((s) => s.isAutoOrbiting);
  const resetOrientationTrigger = useStore((s) => s.resetOrientationTrigger);

  const descentSession = useRef({ id: "", returnRadius: 0 });
  const coreHandoff = useRef(false);
  const diskFlight = useRef({
    rotation: new THREE.Matrix4(),
    inverse: new THREE.Matrix4(),
    startAngle: 0,
    startElevation: 0,
    baseTheta: 0,
    basePhi: 0,
    bank: 0,
  });
  const flightSpherical = useRef(new THREE.Spherical());
  const cameraFree = useStore((s) => s.cameraFree);
  const freeFlyTarget = useRef<THREE.Vector3 | null>(null);
  const freePosition = useRef(new THREE.Vector3());
  const freeAnchor = useRef(new THREE.Vector3());
  const freeForward = useRef(new THREE.Vector3());
  const freeRight = useRef(new THREE.Vector3());
  const freeMove = useRef(new THREE.Vector3());
  const freeVelocity = useRef(new THREE.Vector3());
  const freeWheel = useRef(0);
  const freeScale = useRef(8);
  const freeEntryScale = useRef(8);
  const freeBoundary = useRef(2e11);
  const resumeLook = useRef<THREE.Quaternion | null>(null);
  const lookQuaternion = useRef(new THREE.Quaternion());
  const minR = 1e-10;
  // Zoom range spans from inside the Solar System out to ~50 Gly
  // (observable-universe scale) so pulling back reveals Local Group,
  // Virgo Supercluster, and cosmic-web filaments.
  const maxR = 5e10;

  const resolveOrbitAnchor = (out: THREE.Vector3) => {
    const state = useStore.getState();
    const registry = window.__planetPositions;
    const livePlanet = state.visitPlanet && registry?.get(state.visitPlanet);
    if (livePlanet) return out.copy(livePlanet);
    const galaxy = state.visitGalaxy;
    if (galaxy) {
      const focus = galaxy.focus;
      const live = focus?.key && registry?.get(focus.key);
      if (live) return out.copy(live);
      return focus ? out.set(focus.x, focus.y, focus.z) : out.set(galaxy.x, galaxy.y, galaxy.z);
    }
    const object = state.selectedObjectId && OBJECT_BY_ID.get(state.selectedObjectId);
    if (object) return out.set(...objectPosition(object));
    const star = state.selectedStar;
    if (star && star.name !== "Sun") return out.set(star.x, star.y, star.z);
    if (!star && freeFlyTarget.current && freeFlyTarget.current.lengthSq() > 1e-6)
      return out.copy(freeFlyTarget.current);
    const sun = registry?.get("Sun");
    return sun ? out.copy(sun) : out.set(0, 0, 0);
  };

  useEffect(() => {
    if (resetOrientationTrigger > 0) {
      desired.current.phi = Math.PI / 2.2;
      desired.current.theta = nearestOrbitAngle(spherical.current.theta, 0);
      velocity.current.theta = 0;
      velocity.current.phi = 0;
    }
  }, [resetOrientationTrigger]);

  const planetMinimumRadius = () => {
    const name = useStore.getState().visitPlanet;
    if (!name) {
      const state = useStore.getState();
      const selected = state.selectedObjectId
        ? OBJECT_BY_ID.get(state.selectedObjectId)
        : undefined;
      if (isBlackHoleTarget(selected)) return blackHoleModel(selected).radiusLy * 1.08;
      const star = state.selectedStar;
      return star ? stellarDisplayRadius(star) * 1.65 : minR;
    }
    const def =
      PLANETS.find((p) => p.name === name) ??
      M31_PLANETS.find((p) => p.name === name) ??
      GX_PLANET_INDEX.get(name)?.planet;
    const currentScaleMode = useStore.getState().scaleMode;
    const exo = (window as Window).__exoSizes?.get(name);
    const effSize =
      exo ?? (def && "aAU" in def ? getPlanetEffectiveSize(def, currentScaleMode) : def?.size) ?? 0;
    return Math.max(minR, effSize * (name.includes(":") ? 1.85 : 1.65));
  };

  // expose for slider
  useEffect(() => {
    (window as unknown as { __setZoom?: (n: number) => void }).__setZoom = (n) => {
      const r = Math.exp(Math.log(minR) + n * (Math.log(maxR) - Math.log(minR)));
      desired.current.radius = Math.max(planetMinimumRadius(), r);
    };
  }, []);

  useEffect(() => {
    const el = gl.domElement;
    const takeControl = () => {
      const state = useStore.getState();
      if (state.cameraFree) return;
      const anchor = resolveOrbitAnchor(scratchTarget.current);
      if (
        !anchor ||
        target.current.distanceTo(anchor) < Math.max(1e-12, desired.current.radius * 0.02)
      )
        return;
      // Interrupt a pending flight at its destination while preserving the camera's
      // actual world position; manual orbiting then owns this reference frame.
      target.current.copy(anchor);
      scratchPos.current.copy(camera.position).sub(anchor);
      spherical.current.setFromVector3(scratchPos.current);
      desired.current.radius = Math.max(planetMinimumRadius(), spherical.current.radius);
      desired.current.theta = spherical.current.theta;
      desired.current.phi = spherical.current.phi;
      if (state.visitPlanet)
        followedPlanet.current = { name: state.visitPlanet, position: anchor.clone() };
      camera.lookAt(anchor);
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "touch" || e.button !== 0 || activePointer.current !== null) return;
      takeControl();
      activePointer.current = e.pointerId;
      velocity.current.theta = velocity.current.phi = 0;
      const state = useStore.getState();
      if (state.tourActive) state.stopTour();
      if (state.isAutoOrbiting) state.toggleAutoOrbit();
      dragging.current = true;
      last.current = { x: e.clientX, y: e.clientY };
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* Pointer may have been cancelled. */
      }
    };
    const onUp = (e: PointerEvent) => {
      if (activePointer.current !== e.pointerId) return;
      activePointer.current = null;
      dragging.current = false;
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging.current || e.pointerId !== activePointer.current || e.pointerType === "touch")
        return;
      if (!Number.isFinite(e.clientX + e.clientY)) return;
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      last.current = { x: e.clientX, y: e.clientY };

      const currentR = useStore.getState().cameraFree ? freeScale.current : desired.current.radius;
      // Adaptive angular speed: reduce sensitivity when inspecting planets close-up
      const sensitivity = currentR < 1e-5 ? 0.0028 : currentR > 1e6 ? 0.004 : 0.005;
      velocity.current.theta = -dx * sensitivity;
      velocity.current.phi = (useStore.getState().cameraFree ? dy : -dy) * sensitivity;
      desired.current.theta += velocity.current.theta;
      desired.current.phi = Math.max(
        0.03,
        Math.min(Math.PI - 0.03, desired.current.phi + velocity.current.phi),
      );
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const state = useStore.getState();
      if (state.cameraFree) {
        const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
        freeWheel.current +=
          -Math.max(-100, Math.min(100, dy)) *
          0.0014 *
          freeLookSpeed(freeScale.current, state.zoomSpeed, state.freeLookSpeed) *
          8;
        return;
      }

      const selected = state.selectedObjectId
        ? OBJECT_BY_ID.get(state.selectedObjectId)
        : undefined;
      const nearHole =
        isBlackHoleTarget(selected) &&
        desired.current.radius < blackHoleModel(selected).radiusLy * 100;
      const speed = (state.zoomSpeed / 50) * (nearHole ? 0.5 : 1);
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      // Logarithmic damping avoids nausea and uncontrolled overshooting
      const dampFactor = Math.min(
        1.2,
        Math.max(0.65, 0.9 + Math.log10(Math.max(1e-10, desired.current.radius)) * 0.015),
      );
      const factor = Math.exp(Math.max(-100, Math.min(100, dy)) * 0.0014 * speed * dampFactor);
      desired.current.radius = Math.max(
        planetMinimumRadius(),
        Math.min(maxR, desired.current.radius * factor),
      );
    };
    const onTouchStart = (e: TouchEvent) => {
      takeControl();
      dragging.current = true;
      velocity.current.theta = velocity.current.phi = 0;
      const state = useStore.getState();
      if (state.tourActive) state.stopTour();
      if (state.isAutoOrbiting) state.toggleAutoOrbit();
      if (e.touches.length === 2) {
        const a = e.touches[0],
          b = e.touches[1];
        pinch.current = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 2 && pinch.current != null) {
        const a = e.touches[0],
          b = e.touches[1];
        const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        if (d < 2 || !Number.isFinite(d)) return;
        if (pinch.current < 2) {
          pinch.current = d;
          return;
        }
        const factor = pinch.current / d;
        if (useStore.getState().cameraFree) {
          const state = useStore.getState();
          freeWheel.current +=
            -Math.log(factor) *
            freeLookSpeed(freeScale.current, state.zoomSpeed, state.freeLookSpeed) *
            5;
          pinch.current = d;
          return;
        }
        desired.current.radius = Math.max(
          planetMinimumRadius(),
          Math.min(maxR, desired.current.radius * factor),
        );
        pinch.current = d;
      } else if (e.touches.length === 1 && pinch.current == null) {
        const touch = e.touches[0];
        if (!touch) return;
        const dx = touch.clientX - last.current.x;
        const dy = touch.clientY - last.current.y;
        last.current = { x: touch.clientX, y: touch.clientY };
        desired.current.theta -= dx * 0.005;
        desired.current.phi = Math.max(
          0.03,
          Math.min(
            Math.PI - 0.03,
            desired.current.phi + dy * (useStore.getState().cameraFree ? 0.005 : -0.005),
          ),
        );
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      dragging.current = e.touches.length > 0;
      pinch.current = null;
      const touch = e.touches[0];
      if (touch) last.current = { x: touch.clientX, y: touch.clientY };
    };
    const onSingleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        if (touch) last.current = { x: touch.clientX, y: touch.clientY };
      }
    };

    const cancel = () => {
      dragging.current = false;
      activePointer.current = null;
      pinch.current = null;
      velocity.current.theta = velocity.current.phi = 0;
    };
    const blur = () => {
      cancel();
      freeLookInput.clear();
      freeVelocity.current.set(0, 0, 0);
      freeWheel.current = 0;
      keys.current.in = keys.current.out = false;
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("lostpointercapture", cancel);
    window.addEventListener("pointercancel", cancel);
    window.addEventListener("blur", blur);
    el.addEventListener("touchcancel", cancel);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointermove", onMove);
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onSingleTouchStart);
    el.addEventListener("touchstart", onTouchStart);
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    return () => {
      cancel();
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("lostpointercapture", cancel);
      window.removeEventListener("pointercancel", cancel);
      window.removeEventListener("blur", blur);
      el.removeEventListener("touchcancel", cancel);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchstart", onSingleTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [gl, camera]);

  // Keyboard zoom — SPACE zooms out, CTRL zooms in. Held keys ramp smoothly
  // via a per-frame factor driven by the user's zoom-speed setting.
  const keys = useRef({ out: false, in: false });
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (
        useStore.getState().cameraFree &&
        FREE_LOOK_KEYS.has(e.code) &&
        !e.ctrlKey &&
        !e.metaKey
      ) {
        e.preventDefault();
        freeLookInput.add(e.code);
        return;
      }
      if (t?.closest("button") && (e.code === "Space" || e.code === "Enter")) return;
      if (e.code === "Space") {
        e.preventDefault();
        keys.current.out = true;
      }
      if (e.key === "Control") {
        e.preventDefault();
        keys.current.in = true;
      }
      // F toggles travel without conflicting with WASD movement.
      if (e.code === "KeyF" && !e.repeat && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        useNebulaJourney.getState().reset();
        useStore.getState().toggleCameraFree();
      }
      // O = toggle auto orbit
      if ((e.key === "o" || e.key === "O") && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        useStore.getState().toggleAutoOrbit();
      }
      // R = reset orientation
      if ((e.key === "r" || e.key === "R") && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        useStore.getState().resetCameraOrientation();
      }
      // ? = keyboard & gestures accessibility helper
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        useStore.getState().setShortcutsModalOpen(true);
      }
      // / or Ctrl+K = universal search
      if (
        (e.key === "/" || ((e.key === "k" || e.key === "K") && (e.ctrlKey || e.metaKey))) &&
        !e.shiftKey
      ) {
        e.preventDefault();
        useStore.getState().setUniversalSearchOpen(true);
      }
      if (e.key === "Escape" && useNebulaJourney.getState().mode !== "idle") {
        e.preventDefault();
        if (useNebulaJourney.getState().mode !== "returning") useNebulaJourney.getState().back();
        return;
      }
      // Escape = clear selections
      if (e.key === "Escape" && useBlackHoleJourney.getState().mode !== "idle") {
        e.preventDefault();
        if (useBlackHoleJourney.getState().mode !== "returning")
          useBlackHoleJourney.getState().returnToOrbit();
        return;
      }
      if (e.key === "Escape" && useStore.getState().cameraFree) {
        useStore.getState().toggleCameraFree();
        return;
      }
      if (e.key === "Escape") {
        useStore.getState().setSelected(null);
        useStore.getState().setVisitPlanet(null);
        useStore.getState().setVisitGalaxy(null);
        useStore.getState().setSelectedObject(null);
        useStore.getState().setUniversalObjectModalOpen(false);
      }
    };
    const up = (e: KeyboardEvent) => {
      freeLookInput.delete(e.code);
      if (e.code === "Space") keys.current.out = false;
      if (e.key === "Control") keys.current.in = false;
    };
    const blur = () => {
      freeLookInput.clear();
      keys.current.out = false;
      keys.current.in = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);

  const followSun = (sun: THREE.Vector3) => {
    if (followedSun.current) {
      target.current.add(sun).sub(followedSun.current);
      followedSun.current.copy(sun);
    } else followedSun.current = sun.clone();
  };

  const previousFree = useRef(false);
  useEffect(() => {
    freeLookInput.clear();
    followedPlanet.current = null;
    followedSun.current = null;
    freeVelocity.current.set(0, 0, 0);
    freeWheel.current = 0;
    velocity.current.theta = velocity.current.phi = 0;
    if (cameraFree) {
      useBlackHoleJourney.getState().reset();
      descentSession.current.id = "";
      freePosition.current.copy(camera.position);
      freeBoundary.current = Math.max(maxR * 4, camera.position.length() * 1.01);
      freeAnchor.current.copy(target.current);
      freeEntryScale.current = freeScale.current = Math.max(minR, spherical.current.radius);
      camera.getWorldDirection(freeForward.current);
      scratchPos.current.copy(freeForward.current);
      spherical.current.setFromVector3(scratchPos.current);
      desired.current.theta = spherical.current.theta;
      desired.current.phi = spherical.current.phi;
      resumeLook.current = null;
    } else if (previousFree.current) {
      resolveOrbitAnchor(target.current);
      scratchPos.current.copy(camera.position).sub(target.current);
      spherical.current.setFromVector3(scratchPos.current);
      desired.current.radius = Math.max(planetMinimumRadius(), spherical.current.radius);
      desired.current.theta = spherical.current.theta;
      desired.current.phi = spherical.current.phi;
      resumeLook.current = camera.quaternion.clone();
    }
    previousFree.current = cameraFree;
  }, [cameraFree, camera]);

  // Fly-to handling — smoothly transition to the target star's system or cosmic coordinate.
  // We set desired radius/orientation and a close FOV, but let useFrame
  // ease the target position for a cinematic sweep instead of snapping.
  useEffect(() => {
    if (!flyTo) return;
    if (useStore.getState().cameraFree) useStore.setState({ cameraFree: false });
    freeFlyTarget.current = new THREE.Vector3(flyTo.x, flyTo.y, flyTo.z);
    const r = Math.max(minR, Math.min(maxR, flyTo.distance));
    desired.current.radius = r;
    // Orbit angle chosen for a pleasant 3/4 view of the star system.
    const offset = new THREE.Vector3(r * 0.6, r * 0.4, r * 0.6);
    const current = useStore.getState().selectedObjectId;
    const hole = current ? OBJECT_BY_ID.get(current) : undefined;
    if (isBlackHoleTarget(hole)) {
      const tilt = OBSERVED_VISUAL_PROFILES[hole.id]?.tilt ?? [0, 0, 0];
      offset
        .set(0.35, 0.22, 0.91)
        .normalize()
        .multiplyScalar(r)
        .applyEuler(new THREE.Euler(...tilt));
    }
    const sph = new THREE.Spherical().setFromVector3(offset);
    desired.current.theta = nearestOrbitAngle(spherical.current.theta, sph.theta);
    desired.current.phi = Math.max(0.3, Math.min(Math.PI - 0.3, sph.phi));
    fovTarget.current = 36;
    // Clear the flyTo flag quickly; selectedStar or freeFlyTarget keeps the camera anchored.
    const id = setTimeout(() => clearFly(), 60);
    return () => clearTimeout(id);
  }, [flyTo, clearFly]);

  // Tour driver
  const tourStartTime = useRef(0);
  useEffect(() => {
    if (!tourActive) return;
    freeFlyTarget.current = null;
    target.current.set(0, 0, 0);
    const stop = TOUR_STOPS[tourStop];
    if (!stop) {
      stopTour();
      return;
    }
    desired.current.radius = stop.distance;
    fovTarget.current = stop.fov;
    setTourCaption(stop.caption);
    tourStartTime.current = performance.now();
    const id = setTimeout(() => {
      if (tourStop + 1 < TOUR_STOPS.length) setTourStop(tourStop + 1);
      else stopTour();
    }, stop.duration);
    return () => clearTimeout(id);
  }, [tourActive, tourStop, setTourCaption, setTourStop, stopTour]);

  const scaleMode = useStore((s) => s.scaleMode);

  // When user selects a planet to visit or toggles scale mode, set an appropriate close zoom
  useEffect(() => {
    followedPlanet.current = null;
    if (!visitPlanet) return;
    const def = PLANETS.find((p) => p.name === visitPlanet);
    const m31 = def ? null : M31_PLANETS.find((p) => p.name === visitPlanet);
    const gx = def || m31 ? null : GX_PLANET_INDEX.get(visitPlanet)?.planet;
    const exo = (window as Window).__exoSizes?.get(visitPlanet);
    const effSize =
      exo ??
      (def && "aAU" in def ? getPlanetEffectiveSize(def, scaleMode) : def?.size) ??
      m31?.size ??
      gx?.size;
    if (effSize == null) return;
    desired.current.radius = Math.max(minR, effSize * 9);
    fovTarget.current = 38;
  }, [visitPlanet, scaleMode]);

  // Frame site-map galaxies at their centers. Other galaxy interactions still
  // retain their close-up star-system visits.
  useEffect(() => {
    if (!visitGalaxy) return;
    const overview = visitGalaxy.view === "overview";
    const width = window.innerWidth;
    const height = window.innerHeight;
    // Reserve room for the site map and the selected galaxy's information.
    // Clamp the reservation on narrow windows so the view remains navigable.
    const visibleWidth = Math.max(width * 0.6, width - (width >= 768 ? 264 + 380 : 0));
    const verticalHalfFov = (42 * Math.PI) / 360;
    const horizontalHalfFov = Math.atan((Math.tan(verticalHalfFov) * visibleWidth) / height);
    const limitingHalfFov = Math.min(verticalHalfFov, horizontalHalfFov);
    const extent = visitGalaxy.size * (/Interacting/i.test(visitGalaxy.type) ? 0.85 : 0.55);
    const r = overview
      ? extent / Math.tan(limitingHalfFov) + extent
      : visitGalaxy.focus
        ? visitGalaxy.focus.distance
        : Math.max(visitGalaxy.size * 2.2, 2000);
    desired.current.radius = r;
    const offset = new THREE.Vector3(r * 0.6, r * 0.35, r * 0.7);
    const sph = new THREE.Spherical().setFromVector3(offset);
    desired.current.theta = nearestOrbitAngle(spherical.current.theta, sph.theta);
    desired.current.phi = Math.max(0.3, Math.min(Math.PI - 0.3, sph.phi));
    fovTarget.current = 42;
  }, [visitGalaxy]);

  const syncView = (r: number, clampedDt: number, free = false) => {
    camera.updateMatrixWorld();
    // Synchronize high-precision 64-bit camera coordinates and active reference frame
    floatingOriginManager.cameraWorldPos64.set(
      camera.position.x,
      camera.position.y,
      camera.position.z,
    );
    floatingOriginManager.cameraTarget64.set(target.current.x, target.current.y, target.current.z);
    const activeFrame = floatingOriginManager.updateActiveFrame(
      floatingOriginManager.cameraWorldPos64,
    );
    const activeRegime = scaleCoordinator.current.updateRadiusWithHysteresis(r);
    (window as unknown as { __activeOriginName?: string }).__activeOriginName = activeFrame.name;
    (window as unknown as { __activeScaleRegimeId?: string }).__activeScaleRegimeId =
      activeRegime.regimeId;
    (window as unknown as { __liveCameraDistance?: number }).__liveCameraDistance = r;

    // Smooth continuous dynamic FOV & clipping plane synchronization (eliminates 25% step-snap flicker)
    const t = Math.min(
      1,
      Math.max(0, (Math.log(r) - Math.log(minR)) / (Math.log(maxR) - Math.log(minR))),
    );
    if (
      !free &&
      !tourActive &&
      !visitPlanet &&
      !selectedObjectId &&
      !visitGalaxy &&
      !useStore.getState().selectedStar
    ) {
      fovTarget.current = 30 + t * 60;
    }
    const pc = camera as THREE.PerspectiveCamera;
    const nextFov = expDampScalar(pc.fov, fovTarget.current, 2.5, clampedDt);
    const clip = computeContinuousNearFar(r, 1e-10, 0.05, 200, 5e11);

    const fovChanged = Math.abs(nextFov - pc.fov) > 0.001;
    const nearChanged = Math.abs(pc.near - clip.near) / Math.max(1e-12, clip.near) > 0.015;
    const farChanged = Math.abs(pc.far - clip.far) / Math.max(1, clip.far) > 0.015;

    if (fovChanged || nearChanged || farChanged) {
      pc.fov = nextFov;
      pc.near = clip.near;
      pc.far = clip.far;
      pc.updateProjectionMatrix();
    }

    // Throttle React Zustand store updates to prevent 60Hz UI re-render storms during zoom
    const now = performance.now();
    const relDistDelta =
      Math.abs(r - lastReportedDist.current) / Math.max(1e-12, lastReportedDist.current);
    const settled =
      Math.abs(r - desired.current.radius) / Math.max(1e-12, desired.current.radius) < 0.005;
    if (
      (relDistDelta > 0.015 && now - lastReportTimestamp.current >= 50) ||
      (settled && relDistDelta > 0.001)
    ) {
      lastReportedDist.current = r;
      lastReportTimestamp.current = now;
      setCameraDistance(r);
    }
  };

  useFrame((_, dt) => {
    const clampedDt = Math.min(dt, 0.1);
    const reg = (window as Window).__planetPositions;
    const st = useStore.getState();
    const selectedStar = st.selectedStar;
    const cameraFree = st.cameraFree;

    const flight = nebulaFlight.current;
    if (flight.update(camera as THREE.PerspectiveCamera, scene, clampedDt)) {
      target.current.copy(flight.center);
      scratchPos.current.copy(camera.position).sub(target.current);
      spherical.current.setFromVector3(scratchPos.current);
      desired.current.radius = spherical.current.radius;
      desired.current.theta = spherical.current.theta;
      desired.current.phi = spherical.current.phi;
      velocity.current.theta = velocity.current.phi = 0;
      fovTarget.current = (camera as THREE.PerspectiveCamera).fov;
      if (useNebulaJourney.getState().mode === "idle")
        resumeLook.current = camera.quaternion.clone();
      syncView(Math.max(minR, flight.scale * 0.2), clampedDt, true);
      return;
    }

    // Held-key zoom
    if (!cameraFree && (keys.current.out || keys.current.in)) {
      const rate = (st.zoomSpeed / 50) * 1.2 * clampedDt;
      const dir = (keys.current.out ? 1 : 0) - (keys.current.in ? 1 : 0);
      desired.current.radius = Math.max(
        planetMinimumRadius(),
        Math.min(maxR, desired.current.radius * Math.exp(dir * rate)),
      );
    }

    // True free flight: turn at the observer position, then translate in that
    // direction. Nothing in this branch follows or re-centres on an object.
    if (cameraFree) {
      const held = freeLookInput;
      desired.current.theta +=
        ((held.has("ArrowLeft") ? 1 : 0) - (held.has("ArrowRight") ? 1 : 0)) * clampedDt;
      desired.current.phi = THREE.MathUtils.clamp(
        desired.current.phi +
          ((held.has("ArrowDown") ? 1 : 0) - (held.has("ArrowUp") ? 1 : 0)) * clampedDt,
        0.01,
        Math.PI - 0.01,
      );
      spherical.current.theta = expDampScalar(
        spherical.current.theta,
        desired.current.theta,
        12,
        clampedDt,
      );
      spherical.current.phi = expDampScalar(
        spherical.current.phi,
        desired.current.phi,
        12,
        clampedDt,
      );
      freeForward.current.setFromSphericalCoords(1, spherical.current.phi, spherical.current.theta);
      freeRight.current.crossVectors(freeForward.current, camera.up).normalize();
      const forward =
        (held.has("KeyW") || keys.current.in ? 1 : 0) -
        (held.has("KeyS") || keys.current.out ? 1 : 0);
      const side = (held.has("KeyD") ? 1 : 0) - (held.has("KeyA") ? 1 : 0);
      const up = (held.has("KeyE") ? 1 : 0) - (held.has("KeyQ") ? 1 : 0);
      const contextScale = Math.max(
        freeEntryScale.current * 0.1,
        Math.min(maxR, freePosition.current.distanceTo(freeAnchor.current)),
      );
      freeScale.current = expDampScalar(freeScale.current, contextScale, 2, clampedDt);
      const boost = held.has("ShiftLeft") || held.has("ShiftRight") ? 3 : 1;
      const speed = freeLookSpeed(freeScale.current, st.zoomSpeed, st.freeLookSpeed) * boost;
      freeMove.current
        .copy(freeForward.current)
        .multiplyScalar(forward)
        .addScaledVector(freeRight.current, side);
      freeMove.current.y += up;
      if (freeMove.current.lengthSq() > 0) freeMove.current.normalize().multiplyScalar(speed);
      // Stop quickly on release, while easing into travel without a velocity step.
      const response = freeMove.current.lengthSq() > 0 ? 7 : 14;
      freeVelocity.current.lerp(freeMove.current, 1 - Math.exp(-response * clampedDt));
      freePosition.current
        .addScaledVector(freeVelocity.current, clampedDt)
        .addScaledVector(freeForward.current, freeWheel.current * clampedDt);
      freeWheel.current *= Math.exp(-8 * clampedDt);
      freePosition.current.clampLength(0, freeBoundary.current);
      camera.position.copy(freePosition.current);
      target.current
        .copy(freePosition.current)
        .addScaledVector(freeForward.current, freeScale.current);
      camera.lookAt(target.current);
      syncView(freeScale.current, clampedDt, true);
      return;
    }

    if (
      visitPlanet ||
      visitGalaxy ||
      selectedObjectId ||
      (selectedStar && selectedStar.name !== "Sun")
    )
      followedSun.current = null;

    // Follow a planet: move target toward live planet position
    if (visitPlanet) {
      freeFlyTarget.current = null;
      const p = reg?.get(visitPlanet);
      if (p) {
        scratchTarget.current.copy(p);
        // Carry the camera along with the moving world, then ease away the
        // initial travel distance. Close up, never lag behind its orbit.
        const previous = followedPlanet.current;
        if (previous?.name === visitPlanet) {
          target.current.add(p).sub(previous.position);
          previous.position.copy(p);
        } else {
          followedPlanet.current = { name: visitPlanet, position: p.clone() };
        }
        const distance = target.current.distanceTo(p);
        const lambda = distance > Math.max(desired.current.radius * 20, 1) ? 1.8 : 6.0;
        expDampVector3(target.current, p, lambda, clampedDt);
      }
    } else if (visitGalaxy) {
      freeFlyTarget.current = null;
      const f = visitGalaxy.focus;
      // Prefer the live position of the focused star system: it orbits its
      // galaxy's centre, so a static point would drift out of frame.
      const live = f?.key ? reg?.get(f.key) : undefined;
      if (live) {
        scratchTarget.current.copy(live);
      } else if (f) {
        scratchTarget.current.set(f.x, f.y, f.z);
      } else {
        scratchTarget.current.set(visitGalaxy.x, visitGalaxy.y, visitGalaxy.z);
      }
      const dist = target.current.distanceTo(scratchTarget.current);
      const reach = f ? f.distance : visitGalaxy.size;
      expDampVector3(target.current, scratchTarget.current, dist > reach ? 1.8 : 4.5, clampedDt);
    } else if (selectedObjectId) {
      freeFlyTarget.current = null;
      const item = OBJECT_BY_ID.get(selectedObjectId);
      if (item) {
        const [x, y, z] = objectPosition(item);
        scratchTarget.current.set(x, y, z);
        const dist = target.current.distanceTo(scratchTarget.current);
        expDampVector3(target.current, scratchTarget.current, dist > 5 ? 1.8 : 4.5, clampedDt);
      }
    } else if (!tourActive && selectedStar && selectedStar.name !== "Sun") {
      if (!freeFlyTarget.current) freeFlyTarget.current = new THREE.Vector3();
      freeFlyTarget.current.set(selectedStar.x, selectedStar.y, selectedStar.z);
      // Smoothly sweep the target from wherever we are toward the selected
      // star's system, then keep it anchored there.
      scratchTarget.current.set(selectedStar.x, selectedStar.y, selectedStar.z);
      const dist = target.current.distanceTo(scratchTarget.current);
      expDampVector3(target.current, scratchTarget.current, dist > 5 ? 1.8 : 4.5, clampedDt);
    } else if (!tourActive && freeFlyTarget.current) {
      if (freeFlyTarget.current.lengthSq() < 1e-6 && desired.current.radius < 100) {
        const sun = reg?.get("Sun");
        if (sun) {
          followSun(sun);
          expDampVector3(target.current, sun, 3.5, clampedDt);
        } else expDampVector3(target.current, originZero.current, 2.0, clampedDt);
      } else {
        const dist = target.current.distanceTo(freeFlyTarget.current);
        expDampVector3(target.current, freeFlyTarget.current, dist > 5 ? 2.2 : 4.5, clampedDt);
      }
    } else if (!tourActive && !flyTo) {
      // Follow the drifting Sun so the user stays with the Solar System
      const sun = reg?.get("Sun");
      if (sun) {
        followSun(sun);
        expDampVector3(target.current, sun, 3.5, clampedDt);
      } else expDampVector3(target.current, originZero.current, 2.0, clampedDt);
    }

    // Same physical anchor across galaxy -> nuclear cluster -> horizon. Change
    // context once at this boundary without a fly-to, radius or angle reset.
    if (
      visitGalaxy?.name === "Milky Way" &&
      desired.current.radius < 25 &&
      spherical.current.radius < 80 &&
      target.current.distanceTo(scratchTarget.current) < 0.5 &&
      !coreHandoff.current
    ) {
      coreHandoff.current = true;
      const core = OBJECT_BY_ID.get("sgr-a")!;
      desired.current.radius = Math.max(blackHoleModel(core).radiusLy * 32, desired.current.radius);
      useStore.setState({
        selectedObjectId: "sgr-a",
        visitGalaxy: null,
        selectedStar: null,
        visitPlanet: null,
        flyTo: null,
      });
    }
    if (visitGalaxy?.name !== "Milky Way") coreHandoff.current = false;
    // Multiplicative logarithmic interpolation keeps close-up zoom smooth across
    // the enormous gap between a galaxy and a planet's surface.
    const anchorDistance =
      visitPlanet ||
      visitGalaxy ||
      selectedObjectId ||
      (selectedStar && selectedStar.name !== "Sun")
        ? target.current.distanceTo(scratchTarget.current)
        : 0;
    let travelRadius = Math.max(desired.current.radius, anchorDistance * 1.2);
    const journey = useBlackHoleJourney.getState();
    const hole = selectedObjectId ? OBJECT_BY_ID.get(selectedObjectId) : undefined;
    if (journey.id === selectedObjectId && journey.mode !== "idle" && isBlackHoleTarget(hole)) {
      const rs = blackHoleModel(hole).radiusLy,
        session = descentSession.current;
      if (session.id !== hole.id || descentMotion.startRadius === 0) {
        session.id = hole.id;
        // Start from the actual vantage point, including a galaxy-scale
        // approach. Never teleport a distant observer to an 80-Rs orbit.
        scratchPos.current.copy(camera.position).sub(scratchTarget.current);
        const actualRadius = Math.max(rs * 1.08, scratchPos.current.length());
        spherical.current.setFromVector3(scratchPos.current);
        desired.current.theta = nearestOrbitAngle(desired.current.theta, spherical.current.theta);
        desired.current.phi = spherical.current.phi;
        session.returnRadius = Math.max(actualRadius, rs * 32);
        descentMotion.startRadius = Math.max(1.08, actualRadius / rs);
        const flight = diskFlight.current;
        const tilt = OBSERVED_VISUAL_PROFILES[hole.id]?.tilt ?? [0, 0, 0];
        flight.rotation.makeRotationFromEuler(new THREE.Euler(...tilt));
        flight.inverse.copy(flight.rotation).invert();
        scratchPos.current.applyMatrix4(flight.inverse);
        flight.startAngle = Math.atan2(scratchPos.current.z, scratchPos.current.x);
        flight.startElevation = Math.asin(
          THREE.MathUtils.clamp(scratchPos.current.y / actualRadius, -1, 1),
        );
        flight.baseTheta = spherical.current.theta;
        flight.basePhi = spherical.current.phi;
        flight.bank = 0;
      }
      target.current.copy(scratchTarget.current);
      if (journey.mode === "falling") descentMotion.elapsed += Math.min(clampedDt, 0.05);
      descentMotion.progress = Math.min(1, descentMotion.elapsed / BLACK_HOLE_DESCENT_SECONDS);
      const model = blackHoleModel(hole);
      const flow = descentFlightState(
        descentMotion.startRadius,
        descentMotion.progress,
        diskFlight.current.startElevation,
        model.outerRs,
        model.innerRs,
      );
      let radius = flow.radiusRs * rs;
      descentMotion.angularSpeed = flow.angularSpeed;
      descentMotion.orbitAngle = flow.angle;
      descentMotion.tidalStretch = flow.tidalStretch;
      if (journey.mode === "returning") {
        if (descentMotion.returnStartRadius === 0)
          descentMotion.returnStartRadius = spherical.current.radius;
        descentMotion.returnElapsed += Math.min(clampedDt, 0.05);
        const p = Math.min(1, descentMotion.returnElapsed / 2),
          ease = p * p * (3 - 2 * p);
        radius = Math.exp(
          Math.log(descentMotion.returnStartRadius) * (1 - ease) +
            Math.log(session.returnRadius) * ease,
        );
        if (p === 1) {
          useBlackHoleJourney.getState().reset();
          session.id = "";
        }
      } else if (journey.mode === "falling" && descentMotion.progress === 1) {
        useBlackHoleJourney.setState({ mode: "crossed" });
      }
      descentMotion.radiusRs = radius / rs;
      desired.current.radius = spherical.current.radius = travelRadius = Math.max(minR, radius);
      if (journey.mode !== "returning") {
        const flight = diskFlight.current,
          angle = flight.startAngle + flow.angle;
        scratchPos.current
          .set(
            Math.cos(angle) * Math.cos(flow.elevation),
            Math.sin(flow.elevation),
            Math.sin(angle) * Math.cos(flow.elevation),
          )
          .applyMatrix4(flight.rotation);
        flightSpherical.current.setFromVector3(scratchPos.current);
        desired.current.theta +=
          nearestOrbitAngle(flight.baseTheta, flightSpherical.current.theta) - flight.baseTheta;
        desired.current.phi = THREE.MathUtils.clamp(
          desired.current.phi + flightSpherical.current.phi - flight.basePhi,
          0.03,
          Math.PI - 0.03,
        );
        flight.baseTheta = flightSpherical.current.theta;
        flight.basePhi = flightSpherical.current.phi;
        flight.bank = flow.bank;
      } else diskFlight.current.bank *= Math.exp(-3 * clampedDt);
    } else if (descentSession.current.id) {
      // Clear a cancelled journey without leaving subsequent navigation at horizon scale.
      desired.current.radius = Math.max(
        desired.current.radius,
        descentSession.current.returnRadius,
      );
      descentSession.current.id = "";
    }
    spherical.current.radius = expDampLogRadius(
      spherical.current.radius,
      travelRadius,
      4.5,
      clampedDt,
      minR,
    );
    spherical.current.theta = expDampScalar(
      spherical.current.theta,
      desired.current.theta,
      6.5,
      clampedDt,
    );
    spherical.current.phi = expDampScalar(
      spherical.current.phi,
      desired.current.phi,
      6.5,
      clampedDt,
    );

    if (tourActive || (isAutoOrbiting && !dragging.current)) {
      desired.current.theta += clampedDt * (tourActive ? 0.05 : 0.06);
    }
    if (!dragging.current) {
      const inertiaRetention = Math.pow(0.92, clampedDt * 60);
      velocity.current.theta *= inertiaRetention;
      velocity.current.phi *= inertiaRetention;
    }

    scratchPos.current.setFromSpherical(spherical.current).add(target.current);
    camera.position.copy(scratchPos.current);
    camera.lookAt(target.current);
    if (journey.id === selectedObjectId && journey.mode !== "idle")
      camera.rotateZ(diskFlight.current.bank);
    if (resumeLook.current) {
      lookQuaternion.current.copy(camera.quaternion);
      camera.quaternion
        .copy(resumeLook.current)
        .slerp(lookQuaternion.current, 1 - Math.exp(-5 * clampedDt));
      resumeLook.current.copy(camera.quaternion);
      if (camera.quaternion.angleTo(lookQuaternion.current) < 0.001) resumeLook.current = null;
    }

    syncView(spherical.current.radius, clampedDt);
  });

  return null;
}

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useStore, TOUR_STOPS } from "./store";
import { PLANETS, SOLAR_SCALE } from "./Planets";


// Custom orbit-style controller with smooth damped zoom & inertia
export function CameraRig() {
  const { camera, gl } = useThree();
  const target = useRef(new THREE.Vector3(0, 0, 0));
  const spherical = useRef(new THREE.Spherical(8, Math.PI / 2.2, 0));
  const desired = useRef({ radius: 8, theta: 0, phi: Math.PI / 2.2 });
  const velocity = useRef({ theta: 0, phi: 0 });
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const pinch = useRef<number | null>(null);
  const fovTarget = useRef(40);
  const setCameraDistance = useStore((s) => s.setCameraDistance);
  const flyTo = useStore((s) => s.flyTo);
  const clearFly = useStore((s) => s.clearFly);
  const tourActive = useStore((s) => s.tourActive);
  const tourStop = useStore((s) => s.tourStop);
  const setTourStop = useStore((s) => s.setTourStop);
  const setTourCaption = useStore((s) => s.setTourCaption);
  const stopTour = useStore((s) => s.stopTour);
  const visitPlanet = useStore((s) => s.visitPlanet);


  // Solar System is scaled down to star-scale, so we can zoom in extremely
  // close to see its planets. Outer bound reaches observable-universe scale.
  const minR = 0.005;
  const maxR = 5e10;


  // expose for slider
  useEffect(() => {
    (window as unknown as { __setZoom?: (n: number) => void }).__setZoom = (n) => {
      const r = Math.exp(Math.log(minR) + n * (Math.log(maxR) - Math.log(minR)));
      desired.current.radius = r;
    };
  }, []);

  useEffect(() => {
    const el = gl.domElement;
    const onDown = (e: PointerEvent) => {
      dragging.current = true;
      last.current = { x: e.clientX, y: e.clientY };
      el.setPointerCapture(e.pointerId);
    };
    const onUp = (e: PointerEvent) => {
      dragging.current = false;
      try { el.releasePointerCapture(e.pointerId); } catch { /* noop */ }
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      last.current = { x: e.clientX, y: e.clientY };
      velocity.current.theta = -dx * 0.005;
      velocity.current.phi = -dy * 0.005;
      desired.current.theta += velocity.current.theta;
      desired.current.phi = Math.max(0.15, Math.min(Math.PI - 0.15, desired.current.phi + velocity.current.phi));
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = Math.exp(e.deltaY * 0.0015);
      desired.current.radius = Math.max(minR, Math.min(maxR, desired.current.radius * factor));
    };
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const a = e.touches[0], b = e.touches[1];
        pinch.current = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinch.current != null) {
        const a = e.touches[0], b = e.touches[1];
        const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        const factor = pinch.current / d;
        desired.current.radius = Math.max(minR, Math.min(maxR, desired.current.radius * factor));
        pinch.current = d;
      }
    };
    const onTouchEnd = () => { pinch.current = null; };

    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointermove", onMove);
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart);
    el.addEventListener("touchmove", onTouchMove);
    el.addEventListener("touchend", onTouchEnd);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [gl]);

  // Fly-to handling — smoothly transition to the target star's system.
  // We set desired radius/orientation and a close FOV, but let useFrame
  // ease the target position for a cinematic sweep instead of snapping.
  useEffect(() => {
    if (!flyTo) return;
    const r = flyTo.distance;
    desired.current.radius = r;
    // Orbit angle chosen for a pleasant 3/4 view of the star system.
    const offset = new THREE.Vector3(r * 0.6, r * 0.4, r * 0.6);
    const sph = new THREE.Spherical().setFromVector3(offset);
    desired.current.theta = sph.theta;
    desired.current.phi = Math.max(0.3, Math.min(Math.PI - 0.3, sph.phi));
    fovTarget.current = 36;
    // Clear the flyTo flag quickly; the selectedStar keeps the camera anchored.
    const id = setTimeout(() => clearFly(), 60);
    return () => clearTimeout(id);
  }, [flyTo, clearFly]);

  // Tour driver
  const tourStartTime = useRef(0);
  useEffect(() => {
    if (!tourActive) return;
    target.current.set(0, 0, 0);
    const stop = TOUR_STOPS[tourStop];
    if (!stop) { stopTour(); return; }
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

  // When user selects a planet to visit, set a close zoom
  useEffect(() => {
    if (!visitPlanet) return;
    const def = PLANETS.find((p) => p.name === visitPlanet);
    if (!def) return;
    desired.current.radius = Math.max(0.01, def.size * 14 * SOLAR_SCALE);
    fovTarget.current = 38;
  }, [visitPlanet]);

  useFrame((_, dt) => {
    const reg = (window as Window).__planetPositions;
    const selectedStar = useStore.getState().selectedStar;
    // Follow a planet: move target toward live planet position
    if (visitPlanet) {
      const p = reg?.get(visitPlanet);
      if (p) {
        target.current.lerp(p, Math.min(1, dt * 5));
      }
    } else if (!tourActive && selectedStar && selectedStar.name !== "Sun") {
      // Smoothly sweep the target from wherever we are toward the selected
      // star's system, then keep it anchored there.
      const sp = new THREE.Vector3(selectedStar.x, selectedStar.y, selectedStar.z);
      const dist = target.current.distanceTo(sp);
      // Slower ease while far away for a cinematic approach, snappier as we arrive.
      const k = dist > 5 ? dt * 1.4 : dt * 4;
      target.current.lerp(sp, Math.min(1, k));
    } else if (!tourActive && !flyTo) {
      // Follow the drifting Sun so the user stays with the Solar System
      const sun = reg?.get("Sun");
      if (sun) target.current.lerp(sun, Math.min(1, dt * 3));
      else target.current.lerp(new THREE.Vector3(0, 0, 0), Math.min(1, dt * 1.5));
    }

    // ease toward desired
    spherical.current.radius += (desired.current.radius - spherical.current.radius) * Math.min(1, dt * 4);
    spherical.current.theta += (desired.current.theta - spherical.current.theta) * Math.min(1, dt * 6);
    spherical.current.phi += (desired.current.phi - spherical.current.phi) * Math.min(1, dt * 6);
    if (tourActive) {
      desired.current.theta += dt * 0.05;
    }
    if (!dragging.current) {
      velocity.current.theta *= 0.92;
      velocity.current.phi *= 0.92;
    }
    const pos = new THREE.Vector3().setFromSpherical(spherical.current).add(target.current);
    camera.position.copy(pos);
    camera.lookAt(target.current);

    // dynamic FOV (unless tour or visit overrides)
    const r = spherical.current.radius;
    const t = Math.min(1, Math.max(0, (Math.log(r) - Math.log(minR)) / (Math.log(maxR) - Math.log(minR))));
    if (!tourActive && !visitPlanet && !(selectedStar && selectedStar.name !== "Sun")) fovTarget.current = 30 + t * 60;
    const pc = camera as THREE.PerspectiveCamera;
    pc.fov += (fovTarget.current - pc.fov) * Math.min(1, dt * 2);
    pc.updateProjectionMatrix();
    setCameraDistance(r);
  });


  return null;
}

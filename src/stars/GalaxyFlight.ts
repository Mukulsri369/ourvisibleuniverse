import { useExploration } from "./exploration-scope";
import { galaxyEntryRoute } from "./galaxy-entry-route";
import { galaxyAppearance } from "./galaxy-appearance";
import * as THREE from "three";
import { useStore } from "./store";
import { useGalaxyJourney, galaxyMotion } from "./galaxy-journey";

const ease = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
/** Owns one camera session. All vectors and curves are reused during flight. */
export class GalaxyFlight {
  id = "";
  elapsed = 0;
  returnTime = 0;
  returning = false;
  matrix = new THREE.Matrix4();
  inverse = new THREE.Matrix4();
  start = new THREE.Vector3();
  startQ = new THREE.Quaternion();
  startFov = 35;
  localStart = new THREE.Vector3();
  direction = new THREE.Vector3();
  approachRotation = new THREE.Quaternion();
  approachStep = new THREE.Quaternion();
  entry = new THREE.Vector3();
  focus = new THREE.Vector3();
  point = new THREE.Vector3();
  center = new THREE.Vector3();
  look = new THREE.Matrix4();
  orientation = new THREE.Quaternion();
  returnStart = new THREE.Vector3();
  returnQ = new THREE.Quaternion();
  returnFov = 35;
  exitPosition = new THREE.Vector3();
  exitOrientation = new THREE.Quaternion();
  curve = new THREE.CatmullRomCurve3();
  scale = 1;
  insideStart = false;
  update(camera: THREE.PerspectiveCamera, scene: THREE.Scene, dt: number) {
    const state = useGalaxyJourney.getState();
    if (state.mode === "idle") {
      this.id = "";
      return false;
    }
    if (!state.galaxy) return false;
    if (state.mode === "inside") return false;
    if (this.id !== state.galaxy.name) {
      const volume = scene.getObjectByName("galaxy-radiance:" + state.galaxy.name);
      if (!volume) return true;
      volume.updateWorldMatrix(true, false);
      this.matrix.copy(volume.matrixWorld);
      this.inverse.copy(this.matrix).invert();
      this.scale = Math.max(1e-10, new THREE.Vector3().setFromMatrixScale(this.matrix).x);
      this.center.setFromMatrixPosition(this.matrix);
      this.id = state.galaxy.name!;
      this.elapsed = this.returnTime = 0;
      this.returning = false;
      this.start.copy(camera.position);
      this.startQ.copy(camera.quaternion);
      this.startFov = camera.fov;
      const width = typeof window !== "undefined" ? window.innerWidth : 1440;
      const fraction = width >= 768 ? Math.max(0.6, 1 - 350 / width) : 1;
      const extent = state.galaxy.size * (/Interacting/i.test(state.galaxy.type) ? 0.85 : 0.55);
      const overviewRadius =
        extent / (Math.tan((42 * Math.PI) / 360) * Math.min(1, camera.aspect * fraction)) + extent;
      this.exitPosition
        .set(
          ...((state.galaxy.name === "Milky Way" ? [0.15, 0.85, 0.5] : [0.6, 0.35, 0.7]) as [
            number,
            number,
            number,
          ]),
        )
        .normalize()
        .multiplyScalar(overviewRadius)
        .add(this.center);
      this.look.lookAt(this.exitPosition, this.center, camera.up);
      this.exitOrientation.setFromRotationMatrix(this.look);
      this.localStart.copy(this.start).applyMatrix4(this.inverse);
      const route = galaxyEntryRoute(galaxyAppearance(state.galaxy));
      this.entry.set(...route.points[0]);
      this.focus.set(...route.focus).applyMatrix4(this.matrix);
      this.direction.copy(this.localStart).normalize();
      this.approachRotation.setFromUnitVectors(
        this.direction,
        this.point.copy(this.entry).normalize(),
      );
      this.insideStart = this.localStart.length() < 1.7;
      this.curve = new THREE.CatmullRomCurve3(
        (this.insideStart
          ? [this.localStart.toArray(), ...route.points.slice(1)]
          : route.points
        ).map((p) => new THREE.Vector3(...(p as [number, number, number]))),
        false,
        "centripetal",
      );
    }
    if (state.mode === "returning") {
      if (!this.returning) {
        this.returning = true;
        this.returnTime = 0;
        this.returnStart.copy(camera.position);
        this.returnQ.copy(camera.quaternion);
        this.returnFov = camera.fov;
      }
      this.returnTime += dt;
      const t = ease(Math.min(1, this.returnTime / (state.reducedMotion ? 1.2 : 2.4)));
      camera.position.lerpVectors(this.returnStart, this.exitPosition, t);
      camera.quaternion.slerpQuaternions(this.returnQ, this.exitOrientation, t);
      camera.fov = THREE.MathUtils.lerp(this.returnFov, 42, t);
      if (state.reducedMotion) {
        camera.position.copy(t < 0.5 ? this.returnStart : this.exitPosition);
        camera.quaternion.copy(t < 0.5 ? this.returnQ : this.exitOrientation);
      }
      galaxyMotion.reveal *= Math.exp(-dt * 2);
      galaxyMotion.progress = 1 - t;
      if (t === 1) state.reset();
      return true;
    }
    if (state.mode === "flying" && !document.hidden) this.elapsed += dt;
    const p = Math.min(1, this.elapsed / state.duration);
    galaxyMotion.progress = p;
    const approach = this.insideStart ? 0 : 0.24;
    if (p < approach) {
      const t = ease(p / approach),
        radius = Math.exp(
          THREE.MathUtils.lerp(
            Math.log(Math.max(0.01, this.localStart.length())),
            Math.log(this.entry.length()),
            t,
          ),
        );
      this.approachStep.identity().slerp(this.approachRotation, t);
      this.point.copy(this.direction).applyQuaternion(this.approachStep).multiplyScalar(radius);
    } else this.curve.getPoint(ease((p - approach) / (1 - approach)), this.point);
    if (state.reducedMotion) {
      this.point.copy(p < 0.5 ? this.localStart : this.curve.getPoint(1));
    }
    camera.position.copy(this.point).applyMatrix4(this.matrix);
    this.look.lookAt(camera.position, this.focus, camera.up);
    this.orientation.setFromRotationMatrix(this.look);
    camera.quaternion.slerpQuaternions(this.startQ, this.orientation, ease(Math.min(1, p / 0.16)));
    camera.fov = THREE.MathUtils.lerp(this.startFov, 48, ease(Math.min(1, p / 0.35)));
    if (state.reducedMotion) {
      camera.quaternion.copy(p < 0.5 ? this.startQ : this.orientation);
      camera.fov = p < 0.5 ? this.startFov : 48;
    }
    galaxyMotion.reveal = THREE.MathUtils.smoothstep(p, 0.45, 0.88);
    if (p === 1) {
      useGalaxyJourney.setState({ mode: "inside" });
      const queued = useExploration.getState().queued;
      useExploration.setState({ phase: "inside", mapOpen: !queued });
      useStore.setState({ cameraFree: false });
    }
    return true;
  }
}

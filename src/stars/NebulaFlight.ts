import * as THREE from "three";
import { useStore } from "./store";
import { useNebulaJourney, nebulaMotion } from "./nebula-journey";
import { NEBULA_ROUTES } from "./nebula-journey-profiles";
const ease = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
/** Owns one camera session. All vectors and curves are reused during flight. */
export class NebulaFlight {
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
  curve = new THREE.CatmullRomCurve3();
  scale = 1;
  insideStart = false;
  update(camera: THREE.PerspectiveCamera, scene: THREE.Scene, dt: number) {
    const state = useNebulaJourney.getState();
    if (state.mode === "idle") {
      this.id = "";
      return false;
    }
    if (useStore.getState().selectedObjectId !== state.id) {
      state.reset();
      this.id = "";
      return false;
    }
    if (state.mode === "inside") return false;
    if (this.id !== state.id) {
      const volume = scene.getObjectByName("nebula-volume:" + state.id);
      if (!volume) return true;
      volume.updateWorldMatrix(true, false);
      this.matrix.copy(volume.matrixWorld);
      this.inverse.copy(this.matrix).invert();
      this.scale = Math.max(1e-10, new THREE.Vector3().setFromMatrixScale(this.matrix).x);
      this.center.setFromMatrixPosition(this.matrix);
      this.id = state.id!;
      this.elapsed = this.returnTime = 0;
      this.returning = false;
      this.start.copy(camera.position);
      this.startQ.copy(camera.quaternion);
      this.startFov = camera.fov;
      this.localStart.copy(this.start).applyMatrix4(this.inverse);
      const route = NEBULA_ROUTES[this.id];
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
      const t = ease(Math.min(1, this.returnTime / 4));
      camera.position.lerpVectors(this.returnStart, this.start, t);
      camera.quaternion.slerpQuaternions(this.returnQ, this.startQ, t);
      camera.fov = THREE.MathUtils.lerp(this.returnFov, this.startFov, t);
      nebulaMotion.reveal *= Math.exp(-dt * 2);
      if (t === 1) state.reset();
      return true;
    }
    if (state.mode === "flying" && !document.hidden) this.elapsed += dt;
    const p = Math.min(1, this.elapsed / state.duration);
    nebulaMotion.progress = p;
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
    camera.position.copy(this.point).applyMatrix4(this.matrix);
    this.look.lookAt(camera.position, this.focus, camera.up);
    this.orientation.setFromRotationMatrix(this.look);
    camera.quaternion.slerpQuaternions(this.startQ, this.orientation, ease(Math.min(1, p / 0.16)));
    camera.fov = THREE.MathUtils.lerp(this.startFov, 48, ease(Math.min(1, p / 0.35)));
    nebulaMotion.reveal = THREE.MathUtils.smoothstep(p, 0.45, 0.88);
    if (p === 1) {
      useNebulaJourney.setState({ mode: "inside" });
      useStore.setState({ cameraFree: true, uiHidden: false });
    }
    return true;
  }
}

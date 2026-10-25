import * as THREE from "three";
import { Pass, FullScreenQuad } from "three/examples/jsm/postprocessing/Pass.js";
import { BLACK_HOLE_VERTEX, BLACK_HOLE_FRAGMENT, BLACK_HOLE_COMPOSITE } from "./black-hole-shader";
import { blackHoleModel, isBlackHoleTarget } from "./black-hole-model";
import { OBSERVED_VISUAL_PROFILES } from "./observed-object-visuals";
import { objectPosition, type ObservedObject } from "./observed-objects";
import { useBlackHoleJourney, descentMotion } from "./black-hole-journey";
import { motionTimeSeconds } from "./sim-clock";
function diskNoise() {
  const size = 1024,
    data = new Uint8Array(size * size);
  let seed = 937;
  for (let i = 0; i < data.length; i++) {
    seed = Math.imul(seed ^ (seed >>> 15), 2246822519);
    data[i] = seed >>> 24;
  }
  const t = new THREE.DataTexture(data, size, size, THREE.RedFormat);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.magFilter = THREE.LinearFilter;
  t.generateMipmaps = true;
  t.needsUpdate = true;
  return t;
}
/** Native-resolution optical transport. Original scene detail outside the lens
 * stays at native resolution. The cubemap contains this scene, not invented stars. */
export class BlackHoleLensPass extends Pass {
  private ray: THREE.ShaderMaterial;
  private composite: THREE.ShaderMaterial;
  private rayQuad: FullScreenQuad;
  private compositeQuad: FullScreenQuad;
  private target = new THREE.WebGLRenderTarget(1, 1, {
    type: THREE.HalfFloatType,
    depthBuffer: false,
  });
  private sky = new THREE.WebGLCubeRenderTarget(512, {
    type: THREE.HalfFloatType,
    generateMipmaps: false,
    minFilter: THREE.LinearFilter,
    depthBuffer: true,
  });
  private cubeCamera = new THREE.CubeCamera(1e-10, 1e11, this.sky);
  private noise = diskNoise();
  private position = new THREE.Vector3();
  private rotation = new THREE.Matrix4();
  private worldToDisk = new THREE.Matrix3();
  private cameraRotation = new THREE.Matrix3();
  private face = 6;
  private id = "";
  private width = 1;
  private height = 1;
  private rs = 1;
  private resolution = 1;
  private frameAverage = 1 / 60;
  private model: ReturnType<typeof blackHoleModel> | null = null;
  private lastEye = new THREE.Vector3();
  private lastRotation = new THREE.Quaternion();
  private idleSeconds = 0;
  private maxWidth = 8192;
  private maxHeight = 8192;
  private bounds = new THREE.Vector4();
  private projected = new THREE.Vector3();
  private viewPosition = new THREE.Vector3();
  private scissor = new THREE.Vector4();
  private clearColor = new THREE.Color();
  /** Continuous optical weight shared with bloom; enabling the pass is visually inert. */
  blend = 0;
  constructor(private scene: THREE.Scene) {
    super();
    this.cubeCamera.coordinateSystem = THREE.WebGLCoordinateSystem;
    this.cubeCamera.updateCoordinateSystem();
    this.enabled = false;
    this.ray = new THREE.ShaderMaterial({
      vertexShader: BLACK_HOLE_VERTEX,
      fragmentShader: BLACK_HOLE_FRAGMENT,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
      uniforms: {
        tDiffuse: { value: null },
        uNoise: { value: this.noise },
        uSky: { value: this.sky.texture },
        uSkyReady: { value: 0 },
        uActivation: { value: 0 },
        uTidal: { value: 0 },
        uJourneyProgress: { value: 0 },
        uFlightTime: { value: 0 },
        uCameraToDisk: { value: new THREE.Matrix3() },
        uDiskToWorld: { value: new THREE.Matrix3() },
        uWorldToCamera: { value: new THREE.Matrix3() },
        uEye: { value: new THREE.Vector3() },
        uView: { value: new THREE.Vector2() },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uTime: { value: 0 },
        uInner: { value: 3 },
        uOuter: { value: 19 },
        uIntensity: { value: 1 },
        uOpacity: { value: 0.8 },
        uDisk: { value: 1 },
        uHotFlow: { value: 0 },
        uFall: { value: 0 },
        uStep: { value: 0.085 },
      },
    });
    this.composite = new THREE.ShaderMaterial({
      vertexShader: BLACK_HOLE_VERTEX,
      fragmentShader: BLACK_HOLE_COMPOSITE,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
      uniforms: { tDiffuse: { value: null }, uLensed: { value: this.target.texture } },
    });
    this.rayQuad = new FullScreenQuad(this.ray);
    this.compositeQuad = new FullScreenQuad(this.composite);
  }
  setSize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.resize();
  }
  private resize() {
    const scale = Math.min(
      this.resolution,
      this.maxWidth / this.width,
      this.maxHeight / this.height,
    );
    const w = Math.max(1, Math.round(this.width * scale)),
      h = Math.max(1, Math.round(this.height * scale));
    if (this.target.width !== w || this.target.height !== h) this.target.setSize(w, h);
    this.ray.uniforms.uResolution.value.set(w, h);
  }
  update(
    camera: THREE.PerspectiveCamera,
    item: ObservedObject | undefined,
    tier: string,
    dt: number,
  ) {
    if (!isBlackHoleTarget(item)) {
      this.enabled = false;
      this.blend = 0;
      this.id = "";
      return;
    }
    if (this.id !== item.id || !this.model) {
      this.model = blackHoleModel(item);
      this.rs = this.model.radiusLy;
      this.position.set(...objectPosition(item));
      const tilt = OBSERVED_VISUAL_PROFILES[item.id]?.tilt ?? [0, 0, 0];
      this.rotation.makeRotationFromEuler(new THREE.Euler(...tilt));
      this.ray.uniforms.uDiskToWorld.value.setFromMatrix4(this.rotation);
      this.worldToDisk.copy(this.ray.uniforms.uDiskToWorld.value).transpose();
      this.id = item.id;
      this.face = 0;
      this.idleSeconds = 0;
      this.ray.uniforms.uSkyReady.value = 0;
    }
    const model = this.model;
    const distance = camera.position.distanceTo(this.position) / this.rs;
    this.enabled = distance < 1800;
    this.blend = 1 - THREE.MathUtils.smoothstep(distance, 1100, 1800);
    this.ray.uniforms.uActivation.value = this.blend;
    if (!this.enabled) return;
    camera.updateMatrixWorld();
    this.bounds.set(0, 0, this.target.width, this.target.height);
    const influenceRadius = this.rs * 62;
    this.viewPosition.copy(this.position).applyMatrix4(camera.matrixWorldInverse);
    const depth = -this.viewPosition.z;
    if (depth > influenceRadius * 1.2) {
      this.projected.copy(this.position).project(camera);
      const x = (this.projected.x * 0.5 + 0.5) * this.target.width,
        y = (this.projected.y * 0.5 + 0.5) * this.target.height;
      // Conservative off-axis perspective bound, including the near side.
      const h = (this.target.height / Math.tan(THREE.MathUtils.degToRad(camera.fov) * 0.5)) * 0.5;
      const baseRadius = (h * influenceRadius) / (depth - influenceRadius);
      const rx = baseRadius * (1 + Math.abs(this.viewPosition.x) / depth);
      const ry = baseRadius * (1 + Math.abs(this.viewPosition.y) / depth);
      const pad = 4;
      const left = Math.max(0, Math.floor(x - rx - pad)),
        bottom = Math.max(0, Math.floor(y - ry - pad));
      this.bounds.set(
        left,
        bottom,
        Math.max(0, Math.min(this.target.width, Math.ceil(x + rx + pad)) - left),
        Math.max(0, Math.min(this.target.height, Math.ceil(y + ry + pad)) - bottom),
      );
    }
    const u = this.ray.uniforms;
    this.cameraRotation.setFromMatrix4(camera.matrixWorld);
    u.uCameraToDisk.value.multiplyMatrices(this.worldToDisk, this.cameraRotation);
    u.uWorldToCamera.value.setFromMatrix4(camera.matrixWorldInverse);
    u.uEye.value
      .copy(camera.position)
      .sub(this.position)
      .applyMatrix3(this.worldToDisk)
      .divideScalar(this.rs);
    u.uView.value.set(Math.tan(THREE.MathUtils.degToRad(camera.fov) * 0.5), camera.aspect);
    if (this.face >= 6) u.uSkyReady.value = Math.min(1, u.uSkyReady.value + Math.min(dt, 0.1) * 4);
    u.uTime.value = motionTimeSeconds();
    u.uInner.value = model.innerRs;
    u.uOuter.value = model.outerRs;
    u.uDisk.value = model.dormant ? 0 : 1;
    u.uHotFlow.value = model.hotFlow ? 1 : 0;
    u.uIntensity.value = model.intensity;
    u.uOpacity.value = model.opacity;
    const journey = useBlackHoleJourney.getState();
    const fallTarget =
      journey.id !== item.id
        ? 0
        : journey.mode === "returning"
          ? Math.max(0, 1 - descentMotion.returnElapsed / 2)
          : journey.mode === "falling" || journey.mode === "paused" || journey.mode === "crossed"
            ? 1
            : 0;
    u.uFall.value = THREE.MathUtils.damp(u.uFall.value, fallTarget, 3, Math.min(dt, 0.1));
    const activeJourney = journey.id === item.id && journey.mode !== "idle";
    const returning =
      journey.mode === "returning" ? Math.max(0, 1 - descentMotion.returnElapsed / 2) : 1;
    u.uTidal.value = activeJourney ? descentMotion.tidalStretch * returning : 0;
    u.uJourneyProgress.value = activeJourney ? descentMotion.progress * returning : 0;
    u.uFlightTime.value = descentMotion.elapsed;
    const moving =
      this.lastEye.distanceToSquared(u.uEye.value) > 0.0001 ||
      1 - Math.abs(this.lastRotation.dot(camera.quaternion)) > 1e-7;
    this.idleSeconds = moving ? 0 : this.idleSeconds + dt;
    this.lastEye.copy(u.uEye.value);
    this.lastRotation.copy(camera.quaternion);
    // Preserve native pixels while moving and zooming. Bound the expensive
    // geodesic work spatially and adapt integration effort, not image sharpness.
    this.frameAverage += (Math.min(dt, 0.1) - this.frameAverage) * 0.02;
    u.uStep.value = tier === "performance" ? 0.12 : tier === "standard" ? 0.085 : 0.06;
    if (this.frameAverage > 0.032 && this.idleSeconds < 0.3)
      u.uStep.value = Math.min(0.12, u.uStep.value * 1.15);
  }
  render(
    renderer: THREE.WebGLRenderer,
    write: THREE.WebGLRenderTarget,
    read: THREE.WebGLRenderTarget,
  ) {
    if (this.face < 6) {
      // Capture one face per frame, avoiding a six-render selection hitch.
      const previous = renderer.getRenderTarget(),
        xr = renderer.xr.enabled;
      this.cubeCamera.position.copy(this.position);
      this.cubeCamera.updateMatrixWorld(true);
      renderer.xr.enabled = false;
      renderer.setRenderTarget(this.sky, this.face);
      renderer.clear();
      renderer.render(this.scene, this.cubeCamera.children[this.face] as THREE.Camera);
      renderer.setRenderTarget(previous);
      renderer.xr.enabled = xr;
      this.face++;
    }
    this.ray.uniforms.tDiffuse.value = read.texture;
    const wasScissor = renderer.getScissorTest();
    renderer.getScissor(this.scissor);
    renderer.getClearColor(this.clearColor);
    const clearAlpha = renderer.getClearAlpha();
    renderer.setRenderTarget(this.target);
    // Untraced pixels must be transparent. An opaque clear replaces the entire
    // galaxy with black outside the small optical rectangle.
    renderer.setScissorTest(false);
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
    renderer.setClearColor(this.clearColor, clearAlpha);
    // A native-resolution rectangle around the deflecting region. Outside it,
    // the original scene never passes through an undersampled image.
    renderer.setScissorTest(true);
    const pixelRatio = renderer.getPixelRatio();
    renderer.setScissor(
      this.bounds.x / pixelRatio,
      this.bounds.y / pixelRatio,
      this.bounds.z / pixelRatio,
      this.bounds.w / pixelRatio,
    );
    this.rayQuad.render(renderer);
    renderer.setScissor(this.scissor);
    renderer.setScissorTest(wasScissor);
    this.composite.uniforms.tDiffuse.value = read.texture;
    renderer.setRenderTarget(this.renderToScreen ? null : write);
    this.compositeQuad.render(renderer);
  }
  dispose() {
    this.ray.dispose();
    this.composite.dispose();
    this.rayQuad.dispose();
    this.compositeQuad.dispose();
    this.target.dispose();
    this.sky.dispose();
    this.noise.dispose();
  }
}

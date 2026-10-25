import { SGR_A_DISTANCE_LY } from "./galactic-scene";
/**
 * Floating-Origin & Camera-Relative Rendering Engine
 * Reference: Cozzi, "3D Engine Design for Virtual Globes"; O'Neil, "GPU Gems 3"
 *
 * Problem Solved:
 * Standard WebGL/Three.js uses IEEE 754 float32 (24-bit mantissa, ~7 decimal digits).
 * When world coordinates reach millions or billions of light-years, rendering a planet
 * or spacecraft at 0.0001 ly causes severe vertex shaking and depth precision breakdown.
 *
 * Solution:
 * 1. Maintain high-precision world coordinates in double precision (Float64).
 * 2. Maintain hierarchical reference frames (Solar, Galactic, M31 Extragalactic, Deep Space).
 * 3. Subtract the camera or sector origin on the CPU before uploading to the GPU.
 * 4. Supply high/low 32-bit floats for shaders requiring full 64-bit precision without jitter.
 */

import * as THREE from "three";

export class Vector3D {
  public x: number;
  public y: number;
  public z: number;

  constructor(x = 0, y = 0, z = 0) {
    this.x = Number(x);
    this.y = Number(y);
    this.z = Number(z);
  }

  public set(x: number, y: number, z: number): this {
    this.x = Number(x);
    this.y = Number(y);
    this.z = Number(z);
    return this;
  }

  public copy(v: Vector3D | { x: number; y: number; z: number }): this {
    this.x = Number(v.x);
    this.y = Number(v.y);
    this.z = Number(v.z);
    return this;
  }

  public clone(): Vector3D {
    return new Vector3D(this.x, this.y, this.z);
  }

  public add(v: Vector3D | { x: number; y: number; z: number }): this {
    this.x += Number(v.x);
    this.y += Number(v.y);
    this.z += Number(v.z);
    return this;
  }

  public sub(v: Vector3D | { x: number; y: number; z: number }): this {
    this.x -= Number(v.x);
    this.y -= Number(v.y);
    this.z -= Number(v.z);
    return this;
  }

  public multiplyScalar(s: number): this {
    this.x *= Number(s);
    this.y *= Number(s);
    this.z *= Number(s);
    return this;
  }

  public length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  public distanceTo(v: Vector3D | { x: number; y: number; z: number }): number {
    const dx = this.x - Number(v.x);
    const dy = this.y - Number(v.y);
    const dz = this.z - Number(v.z);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Computes camera-relative position: (this - cameraPos64)
   * Writes the result into a Three.js Vector3 (float32).
   */
  public toCameraRelative(
    cameraPos64: Vector3D | { x: number; y: number; z: number },
    target?: THREE.Vector3,
  ): THREE.Vector3 {
    const out = target ?? new THREE.Vector3();
    out.set(
      this.x - Number(cameraPos64.x),
      this.y - Number(cameraPos64.y),
      this.z - Number(cameraPos64.z),
    );
    return out;
  }

  /**
   * Converts to standard THREE.Vector3 (loss of 64-bit precision).
   */
  public toThreeVector3(): THREE.Vector3 {
    return new THREE.Vector3(this.x, this.y, this.z);
  }
}

/**
 * Splits a 64-bit double-precision number into two 32-bit floats [high, low]
 * such that (high + low) mathematically reconstructs the original double in GLSL.
 */
export function splitDouble(value: number): [number, number] {
  // Math.fround casts directly to 32-bit float
  const high = Math.fround(value);
  const low = value - high;
  return [high, low];
}

/**
 * Encodes a 64-bit Vector3D into two vec3 arrays [highVec, lowVec] for custom shader uniforms.
 */
export function splitVector3D(v: Vector3D): {
  high: [number, number, number];
  low: [number, number, number];
} {
  const [hx, lx] = splitDouble(v.x);
  const [hy, ly] = splitDouble(v.y);
  const [hz, lz] = splitDouble(v.z);
  return {
    high: [hx, hy, hz],
    low: [lx, ly, lz],
  };
}

/**
 * Hierarchical Scene Origin Node.
 * Represents a localized coordinate frame (e.g. Solar System, Sgr A* Neighborhood, M31 Andromeda)
 * anchored at a fixed 64-bit galactic Cartesian position.
 */
export class SceneOriginNode {
  public readonly id: string;
  public readonly name: string;
  public readonly worldPosition64: Vector3D;
  public readonly radiusLy: number;

  constructor(id: string, name: string, worldPosition64: Vector3D, radiusLy: number) {
    this.id = id;
    this.name = name;
    this.worldPosition64 = worldPosition64;
    this.radiusLy = radiusLy;
  }

  /**
   * Calculates the position of this node relative to the active camera.
   */
  public getCameraRelativePosition(
    cameraWorldPos64: Vector3D,
    target?: THREE.Vector3,
  ): THREE.Vector3 {
    return this.worldPosition64.toCameraRelative(cameraWorldPos64, target);
  }

  /**
   * Transforms a local offset (e.g. planet position within Solar System) into world 64-bit coords.
   */
  public localToWorld64(localOffsetLy: Vector3D | { x: number; y: number; z: number }): Vector3D {
    return new Vector3D(
      this.worldPosition64.x + Number(localOffsetLy.x),
      this.worldPosition64.y + Number(localOffsetLy.y),
      this.worldPosition64.z + Number(localOffsetLy.z),
    );
  }
}

/**
 * Standard Hierarchical Reference Frames
 */
export const HIERARCHICAL_FRAMES = {
  SOLAR_SYSTEM: new SceneOriginNode(
    "solar_system",
    "Solar System Barycenter",
    new Vector3D(0, 0, 0),
    2.0,
  ),
  GALACTIC_CENTER: new SceneOriginNode(
    "galactic_center",
    "Milky Way Sgr A*",
    new Vector3D(-SGR_A_DISTANCE_LY, 0, 0),
    10000,
  ),
  ANDROMEDA_M31: new SceneOriginNode(
    "m31",
    "Andromeda Galaxy",
    new Vector3D(-1175653, -931444, 1928096),
    150000,
  ),
  VIRGO_CLUSTER: new SceneOriginNode(
    "virgo",
    "Virgo Supercluster Center",
    new Vector3D(1.1e7, 4.8e7, -1.9e7),
    1e7,
  ),
  OBSERVABLE_COSMOS: new SceneOriginNode(
    "observable_cosmos",
    "Cosmological Origin",
    new Vector3D(0, 0, 0),
    4.65e10,
  ),
};

/**
 * Floating Origin Singleton Manager
 * Coordinates CPU 64-bit world positions with camera-relative 32-bit GPU frames.
 */
export class FloatingOriginManager {
  private static instance: FloatingOriginManager;

  public cameraWorldPos64 = new Vector3D(0, 0, 8);
  public cameraTarget64 = new Vector3D(0, 0, 0);
  public activeFrame: SceneOriginNode = HIERARCHICAL_FRAMES.SOLAR_SYSTEM;

  private constructor() {}

  public static getInstance(): FloatingOriginManager {
    if (!FloatingOriginManager.instance) {
      FloatingOriginManager.instance = new FloatingOriginManager();
    }
    return FloatingOriginManager.instance;
  }

  /**
   * Selects the most appropriate reference frame based on camera distance to major hubs.
   */
  public updateActiveFrame(cameraPos64: Vector3D): SceneOriginNode {
    const dSolar = cameraPos64.length();
    if (dSolar < 50) {
      this.activeFrame = HIERARCHICAL_FRAMES.SOLAR_SYSTEM;
      return this.activeFrame;
    }

    const dGalactic = cameraPos64.distanceTo(HIERARCHICAL_FRAMES.GALACTIC_CENTER.worldPosition64);
    if (dGalactic < 30000) {
      this.activeFrame = HIERARCHICAL_FRAMES.GALACTIC_CENTER;
      return this.activeFrame;
    }

    const dM31 = cameraPos64.distanceTo(HIERARCHICAL_FRAMES.ANDROMEDA_M31.worldPosition64);
    if (dM31 < 200000) {
      this.activeFrame = HIERARCHICAL_FRAMES.ANDROMEDA_M31;
      return this.activeFrame;
    }

    const dVirgo = cameraPos64.distanceTo(HIERARCHICAL_FRAMES.VIRGO_CLUSTER.worldPosition64);
    if (dVirgo < 3e7) {
      this.activeFrame = HIERARCHICAL_FRAMES.VIRGO_CLUSTER;
      return this.activeFrame;
    }

    this.activeFrame = HIERARCHICAL_FRAMES.OBSERVABLE_COSMOS;
    return this.activeFrame;
  }

  /**
   * Transforms a world 64-bit point to camera-relative 32-bit vector.
   */
  public worldToCameraRelative(
    worldPos: Vector3D | { x: number; y: number; z: number },
    out?: THREE.Vector3,
  ): THREE.Vector3 {
    const target = out ?? new THREE.Vector3();
    target.set(
      Number(worldPos.x) - this.cameraWorldPos64.x,
      Number(worldPos.y) - this.cameraWorldPos64.y,
      Number(worldPos.z) - this.cameraWorldPos64.z,
    );
    return target;
  }
}

export const floatingOriginManager = FloatingOriginManager.getInstance();

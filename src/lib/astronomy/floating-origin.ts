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
 * Maintain high-precision world coordinates in double precision (Float64).
 * Subtract the camera's 64-bit world position on the CPU, and send ONLY the camera-relative
 * position vector into Three.js transforms. Also provides [high, low] float32 splitting.
 */

import * as THREE from "three";

export class Vector3D {
  public x: number;
  public y: number;
  public z: number;

  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public set(x: number, y: number, z: number): this {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  public copy(v: Vector3D | { x: number; y: number; z: number }): this {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }

  public clone(): Vector3D {
    return new Vector3D(this.x, this.y, this.z);
  }

  public add(v: Vector3D | { x: number; y: number; z: number }): this {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }

  public sub(v: Vector3D | { x: number; y: number; z: number }): this {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  }

  public multiplyScalar(s: number): this {
    this.x *= s;
    this.y *= s;
    this.z *= s;
    return this;
  }

  public length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  public distanceTo(v: Vector3D | { x: number; y: number; z: number }): number {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    const dz = this.z - v.z;
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
    out.set(this.x - cameraPos64.x, this.y - cameraPos64.y, this.z - cameraPos64.z);
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
      this.worldPosition64.x + localOffsetLy.x,
      this.worldPosition64.y + localOffsetLy.y,
      this.worldPosition64.z + localOffsetLy.z,
    );
  }
}

/**
 * GPU-Ready Compact Binary Astronomical Tile Generator
 *
 * Serializes celestial records into high-performance binary buffers (.astrobinary)
 * structured for direct WebGL GPU consumption via Float32Array and BufferAttribute.
 *
 * Binary Layout:
 * ┌─────────────────────────────────────────────────────────────┐
 * │ HEADER (64 Bytes)                                           │
 * │ 0x00: Magic 'AST1' (4 bytes)                                │
 * │ 0x04: Version uint16 (2 bytes) = 1                          │
 * │ 0x06: Level uint8 (1 byte)                                  │
 * │ 0x07: Reserved uint8 (1 byte)                               │
 * │ 0x08: Record Count uint32 (4 bytes)                         │
 * │ 0x0C: Bounding Box (6 x float32 = 24 bytes)                 │
 * │       [minX, maxX, minY, maxY, minZ, maxZ]                  │
 * │ 0x24: Padding (28 bytes reserved for alignment)             │
 * ├─────────────────────────────────────────────────────────────┤
 * │ RECORDS DATA (RecordCount * 48 Bytes)                       │
 * │ Interleaved 12 x float32 per object:                        │
 * │ [x, y, z, distance, radius, lum, temp, r, g, b, mag, type]  │
 * └─────────────────────────────────────────────────────────────┘
 */

import type { CanonicalAstronomicalObject } from "./types";

export const BINARY_TILE_MAGIC = "AST1";
export const BINARY_TILE_VERSION = 1;
export const HEADER_BYTE_LENGTH = 64;
export const RECORD_BYTE_LENGTH = 48; // 12 float32 fields * 4 bytes

export interface ParsedBinaryTile {
  magic: string;
  version: number;
  level: number;
  recordCount: number;
  boundingBox: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
  };
  records: Array<{
    x: number;
    y: number;
    z: number;
    distanceLy: number;
    radius: number;
    luminosity: number;
    temperatureK: number;
    color: [number, number, number];
    apparentMag: number;
    typeFlag: number;
  }>;
  rawBuffer: ArrayBuffer;
}

export class BinaryTileGenerator {
  /**
   * Converts effective temperature in Kelvin into normalized sRGB [0..1]
   * based on Planck blackbody radiation curves.
   */
  public static temperatureToRgb(teffK?: number | null): [number, number, number] {
    if (!teffK || isNaN(teffK)) return [1.0, 1.0, 1.0]; // Default white

    // Ballesteros approximation for blackbody sRGB
    const temp = Math.max(1000, Math.min(40000, teffK)) / 100;
    let r = 0;
    let g = 0;
    let b = 0;

    // Red
    if (temp <= 66) {
      r = 255;
    } else {
      r = temp - 60;
      r = 329.698727446 * Math.pow(r, -0.1332047592);
      r = Math.max(0, Math.min(255, r));
    }

    // Green
    if (temp <= 66) {
      g = temp;
      g = 99.4708025861 * Math.log(g) - 161.1195681661;
      g = Math.max(0, Math.min(255, g));
    } else {
      g = temp - 60;
      g = 288.1221695283 * Math.pow(g, -0.0755148492);
      g = Math.max(0, Math.min(255, g));
    }

    // Blue
    if (temp >= 66) {
      b = 255;
    } else if (temp <= 19) {
      b = 0;
    } else {
      b = temp - 10;
      b = 138.5177312231 * Math.log(b) - 305.0447927307;
      b = Math.max(0, Math.min(255, b));
    }

    return [r / 255, g / 255, b / 255];
  }

  /**
   * Encodes object type into a compact bitmask flag.
   */
  public static getObjectTypeFlag(type: string): number {
    switch (type) {
      case "star":
        return 1;
      case "exoplanet":
        return 2;
      case "galaxy":
        return 3;
      case "nebula":
        return 4;
      case "black_hole":
        return 5;
      case "pulsar":
      case "neutron_star":
        return 6;
      case "quasar":
        return 7;
      case "solar_system_body":
        return 8;
      default:
        return 0;
    }
  }

  /**
   * Serializes an array of canonical astronomical objects into a compact ArrayBuffer.
   */
  public static serializeTile(
    tileId: string,
    objects: CanonicalAstronomicalObject[],
    level = 1,
  ): ArrayBuffer {
    const recordCount = objects.length;
    const totalBytes = HEADER_BYTE_LENGTH + recordCount * RECORD_BYTE_LENGTH;
    const buffer = new ArrayBuffer(totalBytes);
    const view = new DataView(buffer);

    // Compute bounding box
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;

    for (const obj of objects) {
      const { x, y, z } = obj.galacticCartesianLy;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
    }

    if (recordCount === 0) {
      minX = maxX = minY = maxY = minZ = maxZ = 0;
    }

    // Write Header
    // Magic 'AST1'
    view.setUint8(0, 0x41); // 'A'
    view.setUint8(1, 0x53); // 'S'
    view.setUint8(2, 0x54); // 'T'
    view.setUint8(3, 0x31); // '1'
    view.setUint16(4, BINARY_TILE_VERSION, true);
    view.setUint8(6, level);
    view.setUint8(7, 0); // reserved
    view.setUint32(8, recordCount, true);

    // Bounding Box (6 x float32)
    view.setFloat32(12, minX, true);
    view.setFloat32(16, maxX, true);
    view.setFloat32(20, minY, true);
    view.setFloat32(24, maxY, true);
    view.setFloat32(28, minZ, true);
    view.setFloat32(32, maxZ, true);

    // Write Records
    const floatArray = new Float32Array(buffer, HEADER_BYTE_LENGTH, recordCount * 12);
    let offset = 0;

    for (const obj of objects) {
      const { x, y, z } = obj.galacticCartesianLy;
      const rgb = this.temperatureToRgb(obj.physicalProperties.effectiveTemperatureK);
      const radius =
        obj.physicalProperties.radiusSolar ??
        (obj.physicalProperties.radiusEarth ? obj.physicalProperties.radiusEarth * 0.00916 : 1.0);
      const lum = obj.physicalProperties.luminositySolar ?? 1.0;
      const temp = obj.physicalProperties.effectiveTemperatureK ?? 5772;
      const mag =
        obj.physicalProperties.gaiaGMag ?? obj.physicalProperties.apparentMagnitudeV ?? 0.0;
      const typeFlag = this.getObjectTypeFlag(obj.objectType);

      floatArray[offset++] = x;
      floatArray[offset++] = y;
      floatArray[offset++] = z;
      floatArray[offset++] = obj.distanceLy;
      floatArray[offset++] = radius;
      floatArray[offset++] = lum;
      floatArray[offset++] = temp;
      floatArray[offset++] = rgb[0];
      floatArray[offset++] = rgb[1];
      floatArray[offset++] = rgb[2];
      floatArray[offset++] = mag;
      floatArray[offset++] = typeFlag;
    }

    return buffer;
  }

  /**
   * Deserializes a compact binary tile buffer back into structured attributes.
   */
  public static deserializeTile(buffer: ArrayBuffer): ParsedBinaryTile {
    if (buffer.byteLength < HEADER_BYTE_LENGTH) {
      throw new Error(`Buffer too short (${buffer.byteLength} bytes) for binary tile header.`);
    }

    const view = new DataView(buffer);
    const magic = String.fromCharCode(
      view.getUint8(0),
      view.getUint8(1),
      view.getUint8(2),
      view.getUint8(3),
    );

    if (magic !== BINARY_TILE_MAGIC) {
      throw new Error(
        `Invalid binary tile magic header: '${magic}', expected '${BINARY_TILE_MAGIC}'`,
      );
    }

    const version = view.getUint16(4, true);
    const level = view.getUint8(6);
    const recordCount = view.getUint32(8, true);

    const boundingBox = {
      minX: view.getFloat32(12, true),
      maxX: view.getFloat32(16, true),
      minY: view.getFloat32(20, true),
      maxY: view.getFloat32(24, true),
      minZ: view.getFloat32(28, true),
      maxZ: view.getFloat32(32, true),
    };

    const floatArray = new Float32Array(buffer, HEADER_BYTE_LENGTH, recordCount * 12);
    const records: ParsedBinaryTile["records"] = [];

    for (let i = 0; i < recordCount; i++) {
      const base = i * 12;
      records.push({
        x: floatArray[base],
        y: floatArray[base + 1],
        z: floatArray[base + 2],
        distanceLy: floatArray[base + 3],
        radius: floatArray[base + 4],
        luminosity: floatArray[base + 5],
        temperatureK: floatArray[base + 6],
        color: [floatArray[base + 7], floatArray[base + 8], floatArray[base + 9]],
        apparentMag: floatArray[base + 10],
        typeFlag: floatArray[base + 11],
      });
    }

    return {
      magic,
      version,
      level,
      recordCount,
      boundingBox,
      records,
      rawBuffer: buffer,
    };
  }
}

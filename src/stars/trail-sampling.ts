/** At most two degrees per chord; cap work for extreme time compression. */
export function orbitalTrailSampleCount(deltaDays: number, periodDays: number, parentAngle = 0) {
  const angle = Math.max(Math.abs((deltaDays / periodDays) * Math.PI * 2), Math.abs(parentAngle));
  return Math.min(128, Math.max(1, Math.ceil(angle / (Math.PI / 90))));
}
/** Retain small orbital detail at galaxy-scale coordinates without rewriting history. */
export function writeTrailPosition(
  high: Float32Array,
  low: Float32Array,
  offset: number,
  x: number,
  y: number,
  z: number,
) {
  high[offset] = x;
  high[offset + 1] = y;
  high[offset + 2] = z;
  low[offset] = x - high[offset];
  low[offset + 1] = y - high[offset + 1];
  low[offset + 2] = z - high[offset + 2];
}

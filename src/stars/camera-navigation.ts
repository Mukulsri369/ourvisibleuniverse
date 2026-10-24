/** Keep a new orientation within half a turn of the current orbit. */
export function nearestOrbitAngle(current: number, requested: number): number {
  return current + Math.atan2(Math.sin(requested - current), Math.cos(requested - current));
}

export const MAX_CAMERA_RADIUS = 5e10;

/** One display scale for all catalogue star surfaces and their camera framing. */
export function stellarDisplayRadius(star: { name: string; radius?: number }): number {
  if (star.name === "Sun") return 0.015;
  const solarRadii = Number.isFinite(star.radius) && (star.radius ?? 0) > 0 ? star.radius! : 1;
  return Math.max(1e-7, Math.min(solarRadii, 2500) * 0.00465047 * 0.05);
}

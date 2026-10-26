/** Transient input stays outside React so navigation never renders on every frame. */
export const freeLookInput = new Set<string>();
export const setFreeLookInput = (key: string, pressed: boolean) => {
  if (pressed) freeLookInput.add(key);
  else freeLookInput.delete(key);
};
export function freeLookSpeed(radius: number, zoomSpeed: number, multiplier: number): number {
  return Math.max(1e-10, radius) * (zoomSpeed / 50) * 1.2 * multiplier;
}
export const FREE_LOOK_KEYS = new Set([
  "KeyW",
  "KeyS",
  "KeyA",
  "KeyD",
  "KeyQ",
  "KeyE",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "ShiftLeft",
  "ShiftRight",
]);

/** Interior travel stays local instead of inheriting the galaxy-sized arrival radius. */
export function interiorTravelScale(
  kind: "galaxy" | "nebula" | null,
  extent: number,
  ordinary: number,
) {
  if (!kind || !Number.isFinite(extent) || extent <= 0) return ordinary;
  return Math.min(ordinary, Math.max(1e-10, extent * (kind === "galaxy" ? 0.0015 : 0.006)));
}

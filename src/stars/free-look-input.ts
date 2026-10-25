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

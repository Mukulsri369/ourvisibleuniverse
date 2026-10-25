export const SIM_SECONDS_PER_REAL_SECOND = (365.25 * 86400) / (25 * 31.5);
export function clampTimeRate(value: number) {
  return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 1;
}
export function formatTimeRate(speed: number) {
  const seconds = speed * SIM_SECONDS_PER_REAL_SECOND;
  if (seconds === 0) return "Paused";
  if (seconds < 60) return `${seconds < 1 ? seconds.toFixed(3) : seconds.toFixed(1)} s / s`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)} min / s`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} h / s`;
  return `${(seconds / 86400).toFixed(1)} days / s`;
}

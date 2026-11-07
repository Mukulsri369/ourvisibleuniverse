/** Preserve length units while naming the galaxy actually being explored. */
export function contextualScaleIndicator<T extends { regimeName: string; regimeSubtitle: string }>(
  info: T,
  galaxy: string | null,
  phase: string,
  destination: string | null,
): T {
  if (!galaxy || galaxy === "Milky Way" || !["entering", "inside"].includes(phase)) return info;
  return {
    ...info,
    regimeName: info.regimeName.replace("Solar System", "Stellar System"),
    regimeSubtitle:
      destination && destination !== galaxy
        ? `${galaxy} · ${destination}`
        : `${galaxy} · galaxy exploration`,
  };
}

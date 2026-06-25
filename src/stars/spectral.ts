import * as THREE from "three";

export function spectralColor(spectral: string): THREE.Color {
  const c = (spectral || "G").trim().toUpperCase()[0];
  switch (c) {
    case "O": return new THREE.Color("#9bb0ff");
    case "B": return new THREE.Color("#aabfff");
    case "A": return new THREE.Color("#cad7ff");
    case "F": return new THREE.Color("#f8f7ff");
    case "G": return new THREE.Color("#fff4ea");
    case "K": return new THREE.Color("#ffd2a1");
    case "M": return new THREE.Color("#ffb070");
    case "D": return new THREE.Color("#e6e6ff");
    default:  return new THREE.Color("#ffffff");
  }
}

// Spectral index 0..1 (M cool red -> O hot blue)
export function spectralIndex(spectral: string): number {
  const c = (spectral || "G").trim().toUpperCase()[0];
  const map: Record<string, number> = { M: 0, K: 0.2, G: 0.4, F: 0.55, A: 0.7, B: 0.85, O: 1, D: 0.6 };
  return map[c] ?? 0.5;
}

export function spectralIndexColor(idx: number): THREE.Color {
  // gradient: red -> orange -> yellow -> white -> blue
  const stops = [
    { t: 0, c: new THREE.Color("#ff4422") },
    { t: 0.25, c: new THREE.Color("#ff8a3d") },
    { t: 0.5, c: new THREE.Color("#fff4ea") },
    { t: 0.75, c: new THREE.Color("#cad7ff") },
    { t: 1, c: new THREE.Color("#6688ff") },
  ];
  for (let i = 1; i < stops.length; i++) {
    if (idx <= stops[i].t) {
      const a = stops[i - 1], b = stops[i];
      const k = (idx - a.t) / (b.t - a.t);
      return a.c.clone().lerp(b.c, k);
    }
  }
  return stops[stops.length - 1].c.clone();
}

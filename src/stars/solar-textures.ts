import * as THREE from "three";
import { useEffect, useMemo } from "react";

// Local 2K, mipmapped maps; no network dependency at runtime. Loading replaces
// the image on a stable Texture, so orbital groups never suspend or remount.
export const SOLAR_MAPS: Record<string, string> = {
  Mercury: "mercury",
  Venus: "venus_atmosphere",
  Earth: "earth_daymap",
  Mars: "mars",
  Jupiter: "jupiter",
  Saturn: "saturn",
  SaturnRing: "saturn_ring.png",
  Uranus: "uranus",
  Neptune: "neptune",
  Moon: "moon",
  Io: "io",
  Europa: "europa",
  Ganymede: "ganymede",
  Callisto: "callisto",
  Titan: "titan",
  Triton: "triton",
  Sun: "sun",
  EarthNight: "earth_nightmap",
  EarthClouds: "earth_clouds",
};
export function useSolarMap(name: string, fallback: () => THREE.Texture) {
  const file = SOLAR_MAPS[name];
  const texture = useMemo(() => {
    if (!file) return fallback();
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#88929a";
    ctx.fillRect(0, 0, 1, 1);
    const map = new THREE.Texture(canvas);
    map.needsUpdate = true;
    return map;
    // Fallback belongs to this body's stable definition, not the render loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, file]);
  useEffect(() => {
    if (!file) return;
    let active = true;
    new THREE.ImageLoader().load(
      `/textures/solar/${file.includes(".") ? file : file + ".jpg"}`,
      (image) => {
        if (!active) return;
        texture.image = image;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        texture.anisotropy = 4;
        texture.needsUpdate = true;
      },
      undefined,
      () => {
        /* Keep the neutral fallback if a local asset fails. */
      },
    );
    return () => {
      active = false;
    };
  }, [texture, file]);
  useEffect(
    () => () => {
      if (file) texture.dispose();
    },
    [texture, file],
  );
  return texture;
}

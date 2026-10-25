import { useEffect, useState } from "react";
import * as THREE from "three";
import { GALAXY_REFERENCES } from "./galaxy-references";
/** Small observed portraits only; full-resolution guides belong to the near volume. */
export function useGalaxyPortrait(key: string, fallback: THREE.Texture) {
  const [loaded, setLoaded] = useState<{ texture: THREE.Texture; aspect: number } | null>(null);
  useEffect(() => {
    const ref = GALAXY_REFERENCES[key];
    if (!ref) return;
    const controller = new AbortController();
    let alive = true,
      bitmap: ImageBitmap | undefined,
      texture: THREE.Texture | undefined;
    void fetch(ref.url.replace("/galaxies/", "/galaxies/previews/"), { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw Error("Galaxy preview " + r.status);
        return r.blob();
      })
      .then((blob) =>
        createImageBitmap(blob, {
          imageOrientation: "flipY",
          resizeWidth: 384,
          resizeHeight: Math.round((384 * ref.height) / ref.width),
          resizeQuality: "high",
        }),
      )
      .then((image) => {
        bitmap = image;
        if (!alive) {
          image.close();
          return;
        }
        texture = new THREE.Texture(image);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.needsUpdate = true;
        setLoaded({ texture, aspect: ref.width / ref.height });
      })
      .catch((e) => {
        if (e.name !== "AbortError") console.warn("Galaxy portrait unavailable", key);
      });
    return () => {
      alive = false;
      controller.abort();
      texture?.dispose();
      bitmap?.close();
    };
  }, [key]);
  return { texture: loaded?.texture ?? fallback, aspect: loaded?.aspect ?? 1, observed: !!loaded };
}

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { GalaxyModel } from "./galaxy-models";
import { OBSERVED_IMAGE_BY_KEY, type ObservedGalaxyImage } from "./galaxy-observed-images";
import {
  OBSERVED_DISPLAY_GLSL,
  OBSERVED_EDGE_UV,
  earthDirectionLocal,
  observedImageMatrix,
  observedLayerWeight,
  observedResolution,
  observedSurfaceCorners,
} from "./galaxy-observed-projection";
import { galaxyObservedFootprint } from "./galaxy-detail-state";
import { useGalaxyJourney } from "./galaxy-journey";
import { useStore } from "./store";

const VERT = /* glsl */ `
#include <common>
#include <logdepthbuf_pars_vertex>
varying vec3 vLocal;
void main(){vLocal=position;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;
#include <logdepthbuf_vertex>
}`;

/**
 * Samples the registered image along each fragment's sightline from the Sun.
 *
 * The sky level is the image's darkest blurred corner. The galaxy's light is the
 * image minus that level, kept wherever the blurred image rises above the sky; it
 * is added as light (premultiplied), while a stricter envelope sets how much of
 * the scene behind is hidden, so faint arms keep their brightness without a
 * visible rectangle of sky.
 *
 * Observatory images are display-referred. The scene is tone mapped after this
 * pass (by the renderer or the optics output pass) with `uExposure`; the light is
 * pre-divided by it, and the default neutral curve's toe and shoulder are undone
 * along the peak, so the photograph displays as published. Other curves are
 * exposure-compensated only.
 */
const FRAG = /* glsl */ `
#include <logdepthbuf_pars_fragment>
uniform sampler2D uImage;uniform mat4 uObsMat;uniform float uWeight,uEnvLod;
varying vec3 vLocal;
${OBSERVED_DISPLAY_GLSL}
float luma(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}
float lumaAt(vec2 p){return luma(textureLod(uImage,p,uEnvLod).rgb);}
void main(){
#include <logdepthbuf_fragment>
 vec4 h=uObsMat*vec4(vLocal,1.);
 if(h.z<=0.)discard;
 vec2 uv=h.xy/h.z;
 if(uv.x<0.||uv.y<0.||uv.x>1.||uv.y>1.)discard;
 float bg=min(min(lumaAt(vec2(.04)),lumaAt(vec2(.96,.04))),min(lumaAt(vec2(.04,.96)),lumaAt(vec2(.96))));
 float blurred=lumaAt(uv);
 vec2 frameFade=smoothstep(vec2(0.),vec2(EDGE_UV),min(uv,1.-uv));
 float frame=frameFade.x*frameFade.y;
 float envelope=smoothstep(bg*1.2+.0015,bg*2.5+.02,blurred)*frame;
 float lightMask=smoothstep(bg*1.02+.0004,bg*1.5+.006,blurred)*frame;
 if(lightMask*uWeight<.002)discard;
 vec3 light=max(texture2D(uImage,uv).rgb-vec3(bg),0.)*lightMask;
 gl_FragColor=vec4(beforeDisplay(light)*uWeight,envelope*uWeight);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`.replace("EDGE_UV", OBSERVED_EDGE_UV.toFixed(3));

/** Registered telescope image for galaxies that have one; nothing otherwise. */
export function GalaxyObservedLayer({ m }: { m: GalaxyModel }) {
  const image = OBSERVED_IMAGE_BY_KEY.get(m.key);
  return image ? <ObservedSheet m={m} image={image} /> : null;
}

function ObservedSheet({ m, image }: { m: GalaxyModel; image: ObservedGalaxyImage }) {
  const ref = useRef<THREE.Mesh>(null!);
  const tier = useStore((s) => s.renderingQualityTier);
  const gl = useThree((s) => s.gl);
  const entered = useGalaxyJourney(
    (s) =>
      s.galaxy?.name === m.name &&
      (s.mode === "flying" || s.mode === "paused" || s.mode === "inside"),
  );
  const ready = useRef(false);
  const earth = useMemo(() => earthDirectionLocal(m), [m]);
  const geometry = useMemo(() => {
    const corners = observedSurfaceCorners(m, image);
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        corners.flatMap((p) => [p.x, p.y, p.z]),
        3,
      ),
    );
    g.setIndex([0, 1, 2, 0, 2, 3]);
    g.computeBoundingSphere();
    return g;
  }, [m, image]);
  const uniforms = useMemo(
    () => ({
      uImage: { value: null as THREE.Texture | null },
      uObsMat: { value: observedImageMatrix(m, image) },
      uWeight: { value: 0 },
      uEnvLod: { value: 6 },
      uExposure: { value: 1 },
      uNeutral: { value: 0 },
    }),
    [m, image],
  );
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        premultipliedAlpha: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [uniforms],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  useEffect(() => {
    const controller = new AbortController();
    let bitmap: ImageBitmap | undefined;
    let texture: THREE.Texture | undefined;
    let alive = true;
    // Decode at a tier-bounded size off the main thread; only one selected galaxy is resident.
    const max = tier === "scientific_high" ? 4096 : tier === "performance" ? 1536 : 2560;
    const ratio = Math.min(1, max / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * ratio)),
      height = Math.max(1, Math.round(image.height * ratio));
    void fetch(image.url, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw Error("Galaxy image " + r.status);
        return r.blob();
      })
      .then((blob) =>
        createImageBitmap(blob, {
          imageOrientation: "flipY",
          resizeWidth: width,
          resizeHeight: height,
          resizeQuality: "high",
        }).catch(() => createImageBitmap(blob, { imageOrientation: "flipY" })),
      )
      .then((decoded) => {
        bitmap = decoded;
        if (!alive) {
          decoded.close();
          return;
        }
        texture = new THREE.Texture(decoded);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
        texture.needsUpdate = true;
        uniforms.uImage.value = texture;
        uniforms.uEnvLod.value = Math.max(
          1,
          Math.log2(Math.max(decoded.width, decoded.height) / 40),
        );
        ready.current = true;
      })
      .catch((error) => {
        if (error.name !== "AbortError")
          console.warn("Observed galaxy image unavailable; keeping the 3D model", image.key, error);
      });
    return () => {
      alive = false;
      ready.current = false;
      controller.abort();
      uniforms.uImage.value = null;
      texture?.dispose();
      bitmap?.close();
    };
  }, [image, tier, uniforms, gl]);
  const footprint = useMemo(() => ({ worldToImage: new THREE.Matrix4(), weight: 0 }), []);
  useEffect(() => () => void galaxyObservedFootprint.delete(m.key), [m.key]);
  const eye = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, size }, dt) => {
    const mesh = ref.current;
    if (!mesh) return;
    mesh.updateWorldMatrix(true, false);
    mesh.worldToLocal(eye.copy(camera.position));
    // Local units are disk radii, so this is the distance in radii.
    const distance = eye.length();
    const angle = THREE.MathUtils.radToDeg(
      Math.acos(THREE.MathUtils.clamp(eye.dot(earth) / Math.max(distance, 1e-9), -1, 1)),
    );
    const diameterPx =
      (camera.projectionMatrix.elements[5] * size.height) / Math.max(distance, 1e-9);
    // Independent of the density-cache bake: the image needs only its decoded texture.
    const target =
      ready.current && !entered
        ? observedResolution(diameterPx) *
          observedLayerWeight({
            angleFromEarthDeg: angle,
            inclinationDeg: m.inclination,
            surface: image.surface,
            eyeDistanceRadii: distance,
          })
        : 0;
    uniforms.uWeight.value = THREE.MathUtils.damp(
      uniforms.uWeight.value,
      target,
      6,
      Math.min(dt, 0.1),
    );
    uniforms.uExposure.value = gl.toneMappingExposure;
    uniforms.uNeutral.value = gl.toneMapping === THREE.NeutralToneMapping ? 1 : 0;
    mesh.visible = uniforms.uWeight.value > 0.002;
    if (mesh.visible) {
      footprint.worldToImage.copy(mesh.matrixWorld).invert().premultiply(uniforms.uObsMat.value);
      footprint.weight = uniforms.uWeight.value;
      galaxyObservedFootprint.set(m.key, footprint);
    } else galaxyObservedFootprint.delete(m.key);
  });
  return (
    <mesh
      ref={ref}
      name={"galaxy-observed-image:" + m.name}
      geometry={geometry}
      material={material}
      scale={m.diskRadius}
      renderOrder={3}
      raycast={() => null}
    />
  );
}

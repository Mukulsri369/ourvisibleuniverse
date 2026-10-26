import { pickSurveyGalaxy } from "./survey-galaxy-picking";
import { useStore } from "./store";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
/** Real 2MRS directions and recessional velocities (Huchra+2012).
 * Distances use cz/H0 (70 km/s/Mpc), not precision peculiar-velocity distances.
 * Unresolved morphologies/roll angles are representative visual reconstructions.
 */
export function SurveyGalaxyField() {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const root = useRef<THREE.Points>(null);
  const size = useThree((s) => s.size);
  const select = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 4 || e.index == null || !geometry) return;
    e.stopPropagation();
    const position = new THREE.Vector3().fromBufferAttribute(
        geometry.getAttribute("position"),
        e.index,
      ),
      seed = geometry.getAttribute("seed").getX(e.index);
    const spiral = (seed * 29.7) % 1 > 0.36;
    useStore.getState().setVisitGalaxy({
      name: "2MRS field source " + (e.index + 1),
      x: position.x,
      y: position.y,
      z: position.z,
      size: 70000 * (0.55 + ((seed * 17.3) % 1)),
      distance: position.length(),
      type: spiral ? "Unresolved spiral galaxy" : "Unresolved elliptical galaxy",
      view: "overview",
      reconstructionNote:
        "2MRS survey direction with distance estimated from recessional velocity using cz/H₀ (70 km/s/Mpc). The displayed extent, morphology, orientation and individual stars are illustrative; this unresolved source has no resolved internal-object catalogue here.",
    });
  };
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uHeight: { value: 800 }, uGain: { value: 0 } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: `
#include <common>
#include <logdepthbuf_pars_vertex>
attribute float seed;varying float vSeed,vAlpha;uniform float uHeight,uGain;
void main(){vSeed=seed;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;
float physical=35000.*(.55+fract(seed*17.3))*uHeight*projectionMatrix[1][1]/max(1.,-mv.z);
gl_PointSize=clamp(physical,4.2,128.);vAlpha=uGain*smoothstep(60000.,300000.,length(mv.xyz));
#include <logdepthbuf_vertex>
}`,
        fragmentShader: `
#include <logdepthbuf_pars_fragment>
varying float vSeed,vAlpha;
void main(){
#include <logdepthbuf_fragment>
vec2 p=gl_PointCoord*2.-1.;float angle=vSeed*6.283185;mat2 rot=mat2(cos(angle),-sin(angle),sin(angle),cos(angle));p=rot*p;
float mode=fract(vSeed*29.7),ratio=mix(.18,.95,fract(vSeed*7.13));p.y/=ratio;
float r=length(p);if(r>1.)discard;
float grain=fract(sin(dot(floor(p*180.),vec2(127.1,311.7))+vSeed*899.)*43758.5453);
float phase=(atan(p.y,p.x)-log(max(r,.06))*3.4)*2.;float arm=exp(-pow(sin(phase*.5)/.24,2.));
float disk=exp(-r*3.8)*(mode>.36?.22+arm*1.5:1.);
float bulge=exp(-pow(r,.7)*12.);float dust=mode>.36?exp(-pow(sin((phase+.4)*.5)/.12,2.))*.65:0.;
vec3 old=vec3(1.,.79,.55),young=vec3(.52,.72,1.);
vec3 color=mix(old,young,mode>.36?arm*r*.75:0.);
float light=(disk+bulge*2.)*(1.-dust)*(.68+grain*.32)*(1.-smoothstep(.7,1.,r));
gl_FragColor=vec4(color*9.,light*vAlpha);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`,
      }),
    [],
  );
  useEffect(() => {
    const controller = new AbortController();
    let alive = true,
      owned: THREE.BufferGeometry | undefined;
    void fetch("/data/2mrs-galaxies.bin", { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw Error("Survey " + r.status);
        return r.arrayBuffer();
      })
      .then((buffer) => {
        if (!alive) return;
        const rows = new Float32Array(buffer),
          n = rows.length / 3,
          p = new Float32Array(n * 3),
          seed = new Float32Array(n);
        for (let i = 0; i < n; i++) {
          const l = (rows[i * 3] * Math.PI) / 180,
            b = (rows[i * 3 + 1] * Math.PI) / 180,
            d = (rows[i * 3 + 2] / 70) * 3261563.8;
          p[i * 3] = -d * Math.cos(b) * Math.cos(l);
          p[i * 3 + 1] = d * Math.sin(b);
          p[i * 3 + 2] = d * Math.cos(b) * Math.sin(l);
          seed[i] = ((Math.imul(i + 17, 1664525) >>> 0) % 65536) / 65536;
        }
        owned = new THREE.BufferGeometry();
        owned.setAttribute("position", new THREE.BufferAttribute(p, 3));
        owned.setAttribute("seed", new THREE.BufferAttribute(seed, 1));
        owned.computeBoundingSphere();
        setGeometry(owned);
      })
      .catch((e) => {
        if (e.name !== "AbortError") console.warn("2MRS field unavailable", e);
      });
    return () => {
      alive = false;
      controller.abort();
      owned?.dispose();
    };
  }, []);
  useEffect(() => () => material.dispose(), [material]);
  useFrame(({ camera, size }) => {
    const gain = THREE.MathUtils.smoothstep(camera.position.length(), 180000, 2500000);
    material.uniforms.uGain.value = gain * 0.95;
    material.uniforms.uHeight.value = size.height;
    if (root.current) root.current.visible = gain > 0.001;
  });
  return geometry ? (
    <points
      name="2mrs-observed-galaxy-field"
      ref={root}
      geometry={geometry}
      material={material}
      frustumCulled={false}
      onClick={select}
      raycast={(raycaster, hits) => pickSurveyGalaxy(root.current, raycaster, size, hits)}
    />
  ) : null;
}

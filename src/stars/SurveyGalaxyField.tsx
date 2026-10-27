import { galaxyPresentationAlpha } from "./galaxy-detail-state";
import { namedSurveyCounterpart } from "./survey-galaxy-identity";
import { useGalaxyJourney } from "./galaxy-journey";
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
        uniforms: { uHeight: { value: 800 }, uGain: { value: 0 }, uHiddenSeed: { value: -1 } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: `
#include <common>
#include <logdepthbuf_pars_vertex>
attribute float seed,aCatalogMask;varying float vSeed,vAlpha;varying vec3 vRight,vUp,vToward;uniform float uHeight,uGain,uHiddenSeed;
void main(){vSeed=seed;
float a=seed*6.283185,b=fract(seed*7.13)*3.14159;
mat3 orient=mat3(cos(a),0.,sin(a),sin(a)*sin(b),cos(b),-cos(a)*sin(b),-sin(a)*cos(b),sin(b),cos(a)*cos(b));
vRight=orient*vec3(viewMatrix[0][0],viewMatrix[1][0],viewMatrix[2][0]);
vUp=orient*vec3(viewMatrix[0][1],viewMatrix[1][1],viewMatrix[2][1]);
vToward=orient*normalize(cameraPosition-(modelMatrix*vec4(position,1.)).xyz);
vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;
float physical=35000.*(.55+fract(seed*17.3))*uHeight*projectionMatrix[1][1]/max(1.,-mv.z);
gl_PointSize=clamp(physical,4.2,128.);vAlpha=uGain*smoothstep(60000.,300000.,length(mv.xyz));if(abs(seed-uHiddenSeed)<.000001||aCatalogMask>.5)vAlpha=0.;
#include <logdepthbuf_vertex>
}`,
        fragmentShader: `
#include <logdepthbuf_pars_fragment>
varying float vSeed,vAlpha;varying vec3 vRight,vUp,vToward;
void main(){
#include <logdepthbuf_fragment>
if(vAlpha<.001)discard;
vec2 pixel=gl_PointCoord*2.-1.;float radius2=dot(pixel,pixel);if(radius2>1.)discard;
float span=sqrt(1.-radius2),ds=span/8.,trans=1.;vec3 light=vec3(0.);
float mode=fract(vSeed*29.7);
for(int j=0;j<16;j++){
 vec3 p=vRight*pixel.x-vUp*pixel.y+vToward*(span-(float(j)+.5)*ds);
 float r=length(p.xz),height=abs(p.y),a=atan(p.z,p.x);
 float phase=(a-log(max(r,.06))*3.4)*2.;
 float arm=exp(-pow(sin(phase*.5)/.28,2.));
 float disk=exp(-r*4.-height*22.)*(.3+arm*1.4);
 float bulge=exp(-length(p*vec3(1.,1.3,1.))*14.);
 float stellar=mode>.36?disk+bulge:exp(-pow(length(p*vec3(1.,1.4,1.1)),.8)*6.);
 float dust=mode>.36?exp(-height*55.-r*3.)*exp(-pow(sin((phase+.35)*.5)/.15,2.))*3.:0.;
 vec3 color=mix(vec3(1.,.82,.64),vec3(.62,.79,1.),mode>.36?arm*r*.7:0.);
 float extinction=dust+stellar*.2,alpha=1.-exp(-extinction*ds*5.);
 light+=trans*color*stellar/max(.01,extinction)*alpha;trans*=1.-alpha;
}
float alpha=(1.-trans)*vAlpha;if(alpha<.001)discard;
gl_FragColor=vec4(light/max(.001,1.-trans)*3.,alpha);
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
          seed = new Float32Array(n),
          catalogMask = new Float32Array(n);
        for (let i = 0; i < n; i++) {
          const l = (rows[i * 3] * Math.PI) / 180,
            b = (rows[i * 3 + 1] * Math.PI) / 180,
            d = (rows[i * 3 + 2] / 70) * 3261563.8;
          p[i * 3] = -d * Math.cos(b) * Math.cos(l);
          p[i * 3 + 1] = d * Math.sin(b);
          p[i * 3 + 2] = d * Math.cos(b) * Math.sin(l);
          catalogMask[i] = namedSurveyCounterpart(rows[i * 3], rows[i * 3 + 1], rows[i * 3 + 2])
            ? 1
            : 0;
          seed[i] = ((Math.imul(i + 17, 1664525) >>> 0) % 65536) / 65536;
        }
        owned = new THREE.BufferGeometry();
        owned.setAttribute("position", new THREE.BufferAttribute(p, 3));
        owned.setAttribute("seed", new THREE.BufferAttribute(seed, 1));
        owned.setAttribute("aCatalogMask", new THREE.BufferAttribute(catalogMask, 1));
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
    const selected = useGalaxyJourney.getState().galaxy ?? useStore.getState().visitGalaxy;
    const match = selected?.name.match(/^2MRS field source (\d+)$/);
    const index =
      match && (galaxyPresentationAlpha.get(selected!.name) ?? 0) > 0.5 ? Number(match[1]) - 1 : -1;
    material.uniforms.uHiddenSeed.value =
      index >= 0 ? (geometry?.getAttribute("seed").getX(index) ?? -1) : -1;
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

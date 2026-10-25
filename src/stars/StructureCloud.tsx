import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CosmicStructureBenchmark } from "@/lib/astronomy/cosmic-web/survey-catalogs";
import { useStore } from "./store";
export const COSMIC_POINT_VERTEX = /* glsl */ `
#include <common>
#include <logdepthbuf_pars_vertex>
varying vec3 vColor;varying float vSeed;
void main(){vColor=color;vSeed=fract(dot(position,vec3(.000013,.000023,.000031)));vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=3.;
#include <logdepthbuf_vertex>
}`;
export const COSMIC_POINT_FRAGMENT = /* glsl */ `
#include <logdepthbuf_pars_fragment>
varying vec3 vColor;varying float vSeed;
void main(){
#include <logdepthbuf_fragment>
vec2 p=gl_PointCoord*2.-1.;float angle=vSeed*6.283;mat2 rot=mat2(cos(angle),-sin(angle),sin(angle),cos(angle));p=rot*p;p.y*=1.+vSeed;float r=dot(p,p);if(r>1.)discard;gl_FragColor=vec4(mix(vColor,vec3(.85,.84,.82),.35)*3.,exp(-r*4.)*.65);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;
/** Seeded density illustration around a documented landmark, not a member-position survey. */
export function StructureCloud({ benchmark: b }: { benchmark: CosmicStructureBenchmark }) {
  const ref = useRef<THREE.Points>(null!);
  const select = useStore((s) => s.setSelectedCosmicBenchmarkId);
  const radius = b.diameterMly * 0.5e6;
  const position = useMemo(() => {
    const l = (b.l * Math.PI) / 180,
      q = (b.b * Math.PI) / 180,
      d = b.distanceGlyPlanck * 1e9;
    return new THREE.Vector3(
      -d * Math.cos(q) * Math.cos(l),
      d * Math.sin(q),
      d * Math.cos(q) * Math.sin(l),
    );
  }, [b]);
  const geometry = useMemo(() => {
    let seed = 7;
    for (const c of b.id) seed = Math.imul(seed, 31) + c.charCodeAt(0);
    const rand = () => {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const count =
      b.type === "cluster"
        ? Math.min(2400, b.richnessMembers ?? 1500)
        : b.type === "void"
          ? 500
          : 3600;
    const p = new Float32Array(count * 3),
      c = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      let x = 0,
        y = 0,
        z = 0;
      const theta = rand() * Math.PI * 2,
        mu = rand() * 2 - 1;
      if (b.type === "cluster") {
        const r = Math.pow(rand(), 1.7);
        const branch = i % 5;
        const offset = branch === 0 ? 0.28 : branch === 1 ? -0.22 : 0;
        x = Math.cos(theta) * Math.sqrt(1 - mu * mu) * r + offset;
        y = mu * r * 0.72;
        z = Math.sin(theta) * Math.sqrt(1 - mu * mu) * r * 0.85;
      } else if (b.type === "void") {
        const r = 0.9 + rand() * 0.16;
        x = Math.cos(theta) * Math.sqrt(1 - mu * mu) * r;
        y = mu * r;
        z = Math.sin(theta) * Math.sqrt(1 - mu * mu) * r;
      } else {
        const arm = i % 8,
          t = rand(),
          a = (arm * Math.PI) / 4;
        const spine = t * 1.1;
        const width = 0.012 + rand() * 0.035;
        x = Math.cos(a) * spine + (rand() - 0.5) * width;
        y = Math.sin(t * 4 + arm) * 0.1 + (rand() - 0.5) * width;
        z = Math.sin(a) * spine + Math.sin(t * 5 + arm) * 0.08 + (rand() - 0.5) * width;
        if (b.type === "wall") y *= 0.22;
      }
      p[i * 3] = x * radius;
      p[i * 3 + 1] = y * radius;
      p[i * 3 + 2] = z * radius;
      const spiral = rand() > 0.6;
      c[i * 3] = spiral ? 0.58 : 1;
      c[i * 3 + 1] = spiral ? 0.72 : 0.84;
      c[i * 3 + 2] = spiral ? 1 : 0.61;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    g.setAttribute("color", new THREE.BufferAttribute(c, 3));
    g.computeBoundingSphere();
    return g;
  }, [b, radius]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(({ camera, size }) => {
    if (ref.current)
      ref.current.visible = (radius / camera.position.distanceTo(position)) * size.height > 8;
  });
  return (
    <group position={position.toArray()} name={`structure:${b.id}`}>
      <points
        ref={ref}
        geometry={geometry}
        frustumCulled={false}
        onClick={(e) => {
          if (e.delta > 4) return;
          e.stopPropagation();
          select(b.id);
        }}
      >
        <shaderMaterial
          vertexShader={COSMIC_POINT_VERTEX}
          fragmentShader={COSMIC_POINT_FRAGMENT}
          vertexColors
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <mesh
        visible={false}
        onClick={(e) => {
          if (e.delta > 4) return;
          e.stopPropagation();
          select(b.id);
        }}
      >
        <sphereGeometry args={[radius, 12, 8]} />
        <meshBasicMaterial />
      </mesh>
    </group>
  );
}

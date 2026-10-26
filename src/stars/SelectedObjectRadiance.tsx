import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { objectView, viewGain } from "./object-view-settings";
export function SelectedObjectRadiance({ id, root }: { id: string; root: RefObject<THREE.Group> }) {
  const state = useRef({
    seen: new WeakSet<THREE.Material>(),
    gain: { value: 1 },
    contrast: { value: 1 },
  });
  useFrame((_, dt) => {
    const s = state.current,
      v = objectView(id);
    s.gain.value = THREE.MathUtils.damp(s.gain.value, viewGain(v), 5, Math.min(dt, 0.1));
    s.contrast.value = THREE.MathUtils.damp(s.contrast.value, v.contrast, 5, Math.min(dt, 0.1));
    root.current?.traverse((o) => {
      const material = (o as THREE.Mesh).material;
      if (!material) return;
      for (const m of Array.isArray(material) ? material : [material]) {
        if (s.seen.has(m)) continue;
        s.seen.add(m);
        if ((m as THREE.ShaderMaterial).uniforms?.uShape) continue;
        const previous = m.onBeforeCompile,
          key = m.customProgramCacheKey.bind(m);
        m.onBeforeCompile = (shader, renderer) => {
          previous.call(m, shader, renderer);
          shader.uniforms.uObjectViewGain = s.gain;
          shader.uniforms.uObjectViewContrast = s.contrast;
          const grade =
            "gl_FragColor.rgb=pow(max(gl_FragColor.rgb,vec3(0.)),vec3(uObjectViewContrast))*uObjectViewGain;";
          shader.fragmentShader =
            "uniform float uObjectViewGain,uObjectViewContrast;\n" + shader.fragmentShader;
          const marker = "#include <tonemapping_fragment>";
          if (shader.fragmentShader.includes(marker))
            shader.fragmentShader = shader.fragmentShader.replace(marker, grade + "\n" + marker);
          else {
            const i = shader.fragmentShader.lastIndexOf("}");
            shader.fragmentShader =
              shader.fragmentShader.slice(0, i) + grade + shader.fragmentShader.slice(i);
          }
        };
        m.customProgramCacheKey = () => key() + "-object-view-v1";
        m.needsUpdate = true;
      }
    });
  });
  return null;
}

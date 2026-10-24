import { Suspense, useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { MathUtils, ShaderMaterial, TextureLoader, SRGBColorSpace } from "three";
import type { LensState } from "./ImmersiveHero";
const vertexShader = `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const fragmentShader = `
uniform sampler2D uMap; uniform vec2 uPointer; uniform float uTime; uniform float uPress; uniform float uAspect; uniform float uTravel;
varying vec2 vUv;
void main(){
 vec2 uv=vUv; float imageAspect=1.7777778;
 if(uAspect>imageAspect) uv.y=(uv.y-.5)*imageAspect/uAspect+.5; else uv.x=(uv.x-.5)*uAspect/imageAspect+.5;
 uv=(uv-.5)/(1.0+uTravel*.24)+.5;
 vec2 center=vec2(.52,.51); vec2 d=uv-center; d.x*=imageAspect;
 float r=length(d); float angle=atan(d.y,d.x);
 float ring=exp(-abs(r-.27)*13.0);
 vec2 radial=normalize(d+vec2(.0001)); radial.x/=imageAspect;
 uv+=radial*ring*(uPress*.036)+uPointer*.009;
 uv+=vec2(sin(angle*5.0+uTime*.32),cos(angle*4.0-uTime*.2))*ring*uPress*.005;
 vec3 color=texture2D(uMap,clamp(uv,.001,.999)).rgb;
 float light=1.0+ring*uPress*.18;
 gl_FragColor=vec4(color*light,1.0);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;
function LensSurface({
  interaction,
  onReady,
}: {
  interaction: MutableRefObject<LensState>;
  onReady: () => void;
}) {
  const map = useLoader(TextureLoader, "/assets/aistudio/kerr1_poster.jpg");
  const { viewport, invalidate } = useThree();
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uMap: { value: map },
          uPointer: { value: { x: 0, y: 0 } },
          uTime: { value: 0 },
          uPress: { value: 0 },
          uAspect: { value: 1 },
          uTravel: { value: 0 },
        },
        vertexShader,
        fragmentShader,
        depthTest: false,
        depthWrite: false,
      }),
    [map],
  );
  const elapsed = useRef(0);
  useEffect(() => {
    map.colorSpace = SRGBColorSpace;
    map.needsUpdate = true;
    onReady();
    invalidate();
    return () => material.dispose();
  }, [onReady, invalidate, material, map]);
  useEffect(() => {
    const state = interaction.current;
    state.wake = invalidate;
    return () => {
      state.wake = undefined;
    };
  }, [interaction, invalidate]);
  useFrame((_, delta) => {
    if (!interaction.current.active) return;
    const dt = Math.min(delta, 0.05);
    elapsed.current += dt;
    const target = interaction.current;
    const u = material.uniforms;
    const damping = 1 - Math.exp(-7 * dt);
    u.uPointer.value.x = MathUtils.lerp(u.uPointer.value.x, target.x, damping);
    u.uPointer.value.y = MathUtils.lerp(u.uPointer.value.y, -target.y, damping);
    u.uPress.value = MathUtils.lerp(u.uPress.value, target.pressed, damping);
    u.uTravel.value = target.scroll;
    u.uTime.value = elapsed.current;
    u.uAspect.value = viewport.width / viewport.height;
    if (
      target.pressed > 0.001 ||
      Math.abs(u.uPress.value - target.pressed) > 0.001 ||
      Math.abs(u.uPointer.value.x - target.x) > 0.001 ||
      Math.abs(u.uPointer.value.y + target.y) > 0.001
    )
      invalidate();
  });
  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <primitive attach="material" object={material} />
    </mesh>
  );
}
export default function ObservatoryLens(props: {
  interaction: MutableRefObject<LensState>;
  onReady: () => void;
}) {
  return (
    <div className="ovu-live-lens" aria-hidden="true">
      <Canvas
        frameloop="demand"
        dpr={[1, 1.25]}
        gl={{ antialias: false, alpha: false, powerPreference: "low-power" }}
        camera={{ position: [0, 0, 1], fov: 45 }}
      >
        <Suspense fallback={null}>
          <LensSurface {...props} />
        </Suspense>
      </Canvas>
    </div>
  );
}

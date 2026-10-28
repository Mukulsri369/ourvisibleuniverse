// @ts-nocheck
import { useExploration } from "./exploration-scope";
import { objectHost } from "./object-hosts";
import { SelectedObjectRadiance } from "./SelectedObjectRadiance";
import { BlackHoleContext } from "./BlackHoleContext";
import { motionTimeSeconds, motionDeltaSeconds } from "./sim-clock";
import { NeutronSurface, PlasmaJets } from "./CompactObjectMaterials";
import { Billboard } from "@react-three/drei";
import { SafeHtml as Html } from "./SafeHtml";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OBSERVED_OBJECTS, objectPosition, type ObservedObject } from "./observed-objects";
import { OBSERVED_VISUAL_PROFILES, type ObservedVisualProfile } from "./observed-object-visuals";
import { NebulaVolume } from "./NebulaVolume";
import { useStore } from "./store";

function makeGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();
  const glow = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  glow.addColorStop(0, "rgba(255,255,255,1)");
  glow.addColorStop(0.18, "rgba(255,255,255,.82)");
  glow.addColorStop(0.55, "rgba(255,255,255,.22)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

function NebulaDetail({
  item,
  profile,
  scale,
}: {
  item: ObservedObject;
  profile: ObservedVisualProfile;
  scale: number;
  sizeScale?: number;
}) {
  return <NebulaVolume item={item} profile={profile} scale={scale} />;
}

function PulsarDetail({
  item,
  profile,
  scale,
}: {
  item: ObservedObject;
  profile: ObservedVisualProfile;
  scale: number;
}) {
  const rotor = useRef<THREE.Group>(null!);
  const companion = useRef<THREE.Group>(null!);
  useFrame(() => {
    if (rotor.current)
      rotor.current.rotation.y += Math.min(motionDeltaSeconds(), 0.05) * (profile.spin ?? 1);
    if (companion.current)
      companion.current.rotation.y += Math.min(motionDeltaSeconds(), 0.05) * 0.9;
  });
  return (
    <group scale={scale} rotation={profile.tilt}>
      <NeutronSurface color={item.color} spin={profile.spin ?? 1} />
      <group ref={rotor}>
        <group rotation-z={profile.beamTilt ?? 0.45}>
          <PlasmaJets color={item.accent} length={1.25} width={0.1} />
        </group>
      </group>
      {profile.morphology === "pulsar-torus" && (
        <mesh rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.34, 0.009, 8, 96]} />
          <meshBasicMaterial
            color={item.accent}
            transparent
            opacity={0.22}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
      {profile.morphology === "neutron-binary" && (
        <group ref={companion}>
          <group position={[0.52, 0, 0]}>
            <NeutronSurface color={item.accent} radius={0.065} />
          </group>
        </group>
      )}
    </group>
  );
}
function BlackHoleDetail({
  item,
}: {
  item: ObservedObject;
  profile: ObservedVisualProfile;
  scale: number;
}) {
  return <BlackHoleContext item={item} />;
}
function DormantBlackHoleDetail({
  item,
}: {
  item: ObservedObject;
  profile: ObservedVisualProfile;
  scale: number;
}) {
  return <BlackHoleContext item={item} />;
}

function ThermalNeutronStarDetail({
  item,
  profile,
  scale,
}: {
  item: ObservedObject;
  profile: ObservedVisualProfile;
  scale: number;
}) {
  return (
    <group scale={scale} rotation={profile.tilt}>
      <NeutronSurface color={item.color} radius={0.075} spin={0.05} />
    </group>
  );
}

function GravitationalWaveRegionDetail({
  item,
  profile,
  scale,
}: {
  item: ObservedObject;
  profile: ObservedVisualProfile;
  scale: number;
}) {
  const rippleRef = useRef<THREE.Group>(null);
  const arcRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const t = motionTimeSeconds();
    if (rippleRef.current) {
      rippleRef.current.rotation.z = t * 0.15;
    }
    if (arcRef.current) {
      arcRef.current.rotation.y = t * 0.03;
    }
  });

  const skyArea = profile.gwSkyAreaDeg2 ?? 230;
  // Span of the 90% confidence banana arc on the sky
  const arcSpan = Math.min(Math.PI * 0.9, Math.max(0.4, Math.sqrt(skyArea) * 0.038));

  return (
    <group scale={scale} rotation={profile.tilt}>
      {/* Quadrupole spacetime ripples expanding outward at c */}
      <group ref={rippleRef}>
        {[1, 2, 3, 4, 5].map((i) => (
          <mesh key={i} rotation-x={Math.PI / 2}>
            <ringGeometry args={[0.22 * i, 0.22 * i + 0.015, 64]} />
            <meshBasicMaterial
              color={item.accent}
              transparent
              opacity={Math.max(0.06, 0.65 - i * 0.11)}
              side={THREE.DoubleSide}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>

      {/* Celestial Sphere 90% Credible Localization Contour Arc */}
      <group ref={arcRef}>
        <mesh rotation-z={0.15}>
          <ringGeometry args={[0.82, 1.08, 64, 1, 0, arcSpan]} />
          <meshBasicMaterial
            color={item.color}
            transparent
            opacity={0.38}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <mesh rotation-z={0.15 + arcSpan * 0.2}>
          <ringGeometry args={[0.88, 1.02, 48, 1, 0, arcSpan * 0.6]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.65}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      {/* Central binary coalescence merger remnant */}
      <mesh>
        <sphereGeometry args={[0.075, 24, 16]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.09, 24, 16]} />
        <meshBasicMaterial
          color={item.accent}
          transparent
          opacity={0.75}
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

function QuasarDetail({
  item,
  profile,
  scale,
}: {
  item: ObservedObject;
  profile: ObservedVisualProfile;
  scale: number;
}) {
  const host = useRef<THREE.Group>(null);
  const location = useMemo(() => new THREE.Vector3(...objectPosition(item)), [item]);
  useFrame(({ camera }) => {
    if (host.current) host.current.visible = camera.position.distanceTo(location) > scale * 0.02;
  });
  return (
    <group>
      <BlackHoleContext item={item} />
      <group ref={host}>
        {profile.morphology === "disturbed-quasar" && (
          <NebulaDetail item={item} profile={profile} scale={scale} />
        )}
      </group>
    </group>
  );
}

/**
 * Convecting stellar photosphere: value-noise granulation cells that boil over
 * time, limb darkening toward the edge of the disk, and cooler spots — the
 * look of resolved surface imagery (ALMA/VLTI Betelgeuse, SDO for the Sun)
 * rather than a flat coloured ball.
 */
const STAR_VERT = `
varying vec3 vN; varying vec3 vP; varying vec3 vView;
void main(){
  vN = normalize(normalMatrix * normal);
  vP = position;
  vec4 mv = modelViewMatrix * vec4(position,1.0);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;
const STAR_FRAG = `
uniform float uTime; uniform vec3 uCool; uniform vec3 uHot;
uniform float uGran; uniform float uSpots; uniform float uActivity;
varying vec3 vN; varying vec3 vP; varying vec3 vView;
float hash(vec3 p){ return fract(sin(dot(p, vec3(127.1,311.7,74.7)))*43758.5453); }
float vnoise(vec3 p){
  vec3 i = floor(p), f = fract(p);
  f = f*f*(3.0-2.0*f);
  float n000=hash(i), n100=hash(i+vec3(1,0,0)), n010=hash(i+vec3(0,1,0)), n110=hash(i+vec3(1,1,0));
  float n001=hash(i+vec3(0,0,1)), n101=hash(i+vec3(1,0,1)), n011=hash(i+vec3(0,1,1)), n111=hash(i+vec3(1,1,1));
  return mix(mix(mix(n000,n100,f.x),mix(n010,n110,f.x),f.y),
             mix(mix(n001,n101,f.x),mix(n011,n111,f.x),f.y),f.z);
}
float fbm(vec3 p){
  float a=0.5, s=0.0;
  for(int i=0;i<4;i++){ s += a*vnoise(p); p*=2.03; a*=0.5; }
  return s;
}
void main(){
  vec3 q = normalize(vP);
  float cells = fbm(q*uGran + vec3(0.0, uTime*0.05, 0.0));
  float fine = fbm(q*uGran*2.7 + vec3(uTime*0.09, 0.0, uTime*0.04));
  float t = clamp(cells*0.72 + fine*0.38, 0.0, 1.0);
  // cool starspots / dust patches
  float spot = smoothstep(0.62, 0.86, fbm(q*2.1 + vec3(11.0, uTime*0.02, 3.0)));
  float limb = pow(max(dot(normalize(vN), normalize(vView)), 0.0), 0.55);
  vec3 col = mix(uCool, uHot, t);
  col = mix(col, uCool*0.42, spot*uSpots);
  col *= 0.42 + 0.72*limb;
  // faint chromospheric shimmer at the limb
  col += uHot * pow(1.0 - limb, 3.0) * uActivity * 0.5;
  gl_FragColor = vec4(col, 1.0);
}`;

function StarDetail({
  item,
  profile,
  scale,
}: {
  item: ObservedObject;
  profile: ObservedVisualProfile;
  scale: number;
}) {
  const star = useRef<THREE.Mesh>(null);
  const dwarf = profile.morphology === "white-dwarf";
  const dustProfile =
    profile.morphology === "dusty-supergiant"
      ? profile
      : { ...profile, morphology: "dusty-supergiant" as const, particleCount: 900 };
  const material = useMemo(() => {
    const cool = new THREE.Color(item.color).multiplyScalar(dwarf ? 0.9 : 0.72);
    const hot = new THREE.Color(item.color).lerp(new THREE.Color(item.accent), 0.35);
    return new THREE.ShaderMaterial({
      vertexShader: STAR_VERT,
      fragmentShader: STAR_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uCool: { value: cool },
        uHot: { value: hot.multiplyScalar(dwarf ? 1.35 : 1.15) },
        uGran: { value: dwarf ? 16 : 6.5 },
        uSpots: { value: dwarf ? 0.15 : 0.75 },
        uActivity: { value: dwarf ? 0.25 : 0.6 },
      },
    });
  }, [item.color, item.accent, dwarf]);
  const corona = useMemo(makeGlowTexture, []);
  useFrame(() => {
    const t = motionTimeSeconds();
    material.uniforms.uTime.value = t;
    if (!star.current) return;
    star.current.rotation.y = t * (profile.spin ?? 0.02);
    // Giants and variables breathe; degenerate dwarfs do not.
    const pulse = dwarf ? 1 : 1 + Math.sin(t * 0.55) * 0.035 + Math.sin(t * 0.21) * 0.02;
    star.current.scale.set(pulse, pulse * 0.985, pulse * 1.01);
  });
  return (
    <group scale={scale} rotation={profile.tilt}>
      <mesh ref={star} material={material}>
        <icosahedronGeometry args={[0.34, 5]} />
      </mesh>
      {/* tenuous outer atmosphere / extended envelope */}
      {!dwarf && (
        <mesh>
          <sphereGeometry args={[0.4, 32, 22]} />
          <meshBasicMaterial
            color={item.color}
            transparent
            opacity={0.13}
            side={THREE.BackSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
      {/* soft corona sprite so the star reads as luminous, not solid */}
      <sprite scale={dwarf ? 1.5 : 2.3}>
        <spriteMaterial
          map={corona}
          color={item.accent}
          transparent
          opacity={dwarf ? 0.5 : 0.38}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      {!dwarf && (
        <NebulaDetail item={item} profile={dustProfile} scale={0.72} sizeScale={scale * 0.72} />
      )}
    </group>
  );
}

function Detail({ item, scale }: { item: ObservedObject; scale: number }) {
  const profile = OBSERVED_VISUAL_PROFILES[item.id];
  if (!profile) return null;
  if (profile.morphology === "dormant-blackhole")
    return <DormantBlackHoleDetail item={item} profile={profile} scale={scale} />;
  if (profile.morphology === "thermal-neutron-star")
    return <ThermalNeutronStarDetail item={item} profile={profile} scale={scale} />;
  if (profile.morphology === "gw-localization" || profile.morphology === "merger")
    return <GravitationalWaveRegionDetail item={item} profile={profile} scale={scale} />;
  if (["pulsar-torus", "radio-pulsar", "magnetar", "neutron-binary"].includes(profile.morphology))
    return <PulsarDetail item={item} profile={profile} scale={scale} />;
  if (["kerr-blackhole", "eht-ring", "eht-jet", "xray-binary"].includes(profile.morphology))
    return <BlackHoleDetail item={item} profile={profile} scale={scale} />;
  if (
    ["quasar-jet", "blazar", "disturbed-quasar", "unresolved-quasar"].includes(profile.morphology)
  )
    return <QuasarDetail item={item} profile={profile} scale={scale} />;
  if (["white-dwarf", "red-supergiant", "dusty-supergiant"].includes(profile.morphology))
    return <StarDetail item={item} profile={profile} scale={scale} />;
  return <NebulaDetail item={item} profile={profile} scale={scale} />;
}
function ObjectNode({ item }: { item: ObservedObject }) {
  const detailRef = useRef<THREE.Group>(null!);
  const location = useMemo(() => new THREE.Vector3(...objectPosition(item)), [item]);
  useFrame(({ camera }) => {
    if (detailRef.current)
      detailRef.current.visible =
        camera.position.distanceTo(location) < Math.max(item.diameterLy, 2e-7) * 1500;
  });
  const selected = useStore((s) => s.selectedObjectId === item.id),
    select = useStore((s) => s.setSelectedObject);
  const [hover, setHover] = useState(false);
  const position = objectPosition(item);
  const isGW = item.category === "Gravitational wave";
  const physical = Math.max(item.diameterLy, 0.000000001);
  const closeScale = isGW
    ? Math.max(physical * 0.0000005, 0.002)
    : Math.max(physical, item.category === "Quasar" ? physical : 2e-7);
  const pick = Math.max(physical, isGW ? 0.05 : item.distance * 2e-5, 0.000001);
  const click = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 4) return;
    e.stopPropagation();
    if (!selected) select(item.id);
  };
  return (
    <group position={position}>
      <mesh
        visible={false}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
        }}
        onPointerOut={() => setHover(false)}
        onClick={click}
      >
        <sphereGeometry args={[pick, 8, 6]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {selected && (
        <group ref={detailRef} name={`object-detail:${item.id}`}>
          <Detail item={item} scale={closeScale} />
          <SelectedObjectRadiance id={item.id} root={detailRef} />
        </group>
      )}{" "}
      {hover && (
        <Billboard>
          <Html
            center
            distanceFactor={Math.max(pick * 15, 0.00001)}
            style={{ pointerEvents: "auto" }}
          >
            <button
              onClick={() => select(item.id)}
              className="whitespace-nowrap rounded-md border border-white/15 bg-black/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-white backdrop-blur"
            >
              {item.name}
              <span className="ml-2 text-white/45">{item.category}</span>
            </button>
          </Html>
        </Billboard>
      )}
    </group>
  );
}
export function ObservedObjects() {
  const galaxy = useExploration((s) =>
    s.phase === "entering" || s.phase === "inside" ? s.galaxy : null,
  );
  return (
    <group name={"observed-contents:" + (galaxy ?? "unassigned")}>
      {OBSERVED_OBJECTS.filter((item) => objectHost(item.id) === galaxy).map((item) => (
        <ObjectNode key={item.id} item={item} />
      ))}
    </group>
  );
}

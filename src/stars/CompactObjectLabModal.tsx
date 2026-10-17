import React, { useState, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Billboard } from "@react-three/drei";
import * as THREE from "three";
import {
  X,
  Sliders,
  Layers,
  Sparkles,
  Info,
  Compass,
  ArrowRight,
  ShieldCheck,
  Eye,
  Activity,
  Flame,
  Radio,
  ExternalLink,
} from "lucide-react";
import { useStore } from "./store";
import { OBSERVED_OBJECTS, type ObservedObject } from "./observed-objects";
import {
  getBlackHoleMetrics,
  getPulsarMetrics,
  calculateDopplerBeaming,
  calculateISCORadius,
  calculateKerrHorizon,
  calculateSchwarzschildRadius,
} from "@/lib/astronomy/compact-objects";

// Precision Ray-Lensing Shader for the Interactive Modal
const SIM_LENS_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv * 2.0 - 1.0;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const SIM_LENS_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uTime;
uniform float uSpin;
uniform float uInclination;
uniform int uAccretionMode; // 0 = dormant, 1 = active disk, 2 = jet
uniform int uGeodesicMode;  // 0 = fast, 1 = precision geodesic
varying vec2 vUv;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), f.x), mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
}

void main() {
  vec2 p = vUv;
  float r = length(p);
  float ang = atan(p.y, p.x);

  // Kerr asymmetric shadow: prograde frame-dragging flattens the approaching side
  float kerrOffset = uSpin * 0.042 * (p.x / max(r, 0.01));
  float shadow = 0.20 - kerrOffset;

  if (r < shadow) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  // Photon ring at the critical curve b_crit ≈ 2.6 r_s
  float photonWidth = uGeodesicMode == 1 ? 0.0035 : 0.006;
  float ring = exp(-pow((r - 0.208) / photonWidth, 2.0)) * 1.8;
  ring += exp(-pow((r - 0.217) / (photonWidth * 0.6), 2.0)) * 0.9; // n=2 secondary sub-ring

  if (uAccretionMode == 0) {
    // DORMANT BLACK HOLE: Zero glowing disk, pure starlight Einstein rings & gravitational deflection
    float einsteinRing = exp(-pow((r - 0.45) / 0.035, 2.0)) * 0.55;
    float secondaryRing = exp(-pow((r - 0.24) / 0.01, 2.0)) * 0.35;
    float defl = (1.0 - smoothstep(shadow, 0.7, r)) * 0.15;
    vec3 starlight = mix(vec3(0.85, 0.92, 1.0), uColor, 0.18);
    vec3 col = starlight * (ring + einsteinRing + secondaryRing + defl);
    float a = clamp(ring + einsteinRing + secondaryRing + defl, 0.0, 1.0);
    a *= (1.0 - smoothstep(0.8, 1.0, r));
    gl_FragColor = vec4(col, a);
    return;
  }

  // ACTIVE ACCRETION DISK: Gravitationally warped disk, Keplerian shear, Doppler boosting
  vec2 q = vec2(p.x, p.y / max(0.15, cos(uInclination)));
  float rr = length(q);
  float swirl = ang + uTime * 0.8 / pow(max(rr, 0.18), 1.5);
  float turb = 0.55 + 0.45 * noise(vec2(swirl * 5.0, rr * 35.0));

  // ISCO boundary moves inward with prograde Kerr spin
  float iscoMin = 0.212 - uSpin * 0.04;
  float arcBand = smoothstep(iscoMin, iscoMin + 0.03, rr) * (1.0 - smoothstep(0.32, 0.52, rr));
  float vertical = smoothstep(0.04, 0.65, abs(p.y) / max(rr, 1e-3));
  float arc = arcBand * vertical * turb * 0.95;

  // Relativistic Doppler beaming: approaching side (p.x < 0) boosted
  float beta = 0.48 + uSpin * 0.15;
  float dop = pow(1.0 + beta * (-p.x / max(r, 1e-3)), 3.2) / 1.7;

  // Gravitational redshift: reddens light originating closer to the shadow
  float gravRedshift = clamp((rr - iscoMin) / 0.2, 0.35, 1.0);

  vec3 hot = mix(uColor, vec3(1.0, 0.98, 0.88), 0.6);
  vec3 col = hot * (ring + arc) * dop * gravRedshift;

  // Blueshifted approaching side tint
  col = mix(col, col * vec3(0.7, 0.85, 1.3), clamp(-p.x / max(r, 1e-3), 0.0, 1.0) * 0.45);

  float a = clamp(max(max(col.r, col.g), col.b), 0.0, 1.0);
  a *= (1.0 - smoothstep(0.82, 1.0, r));
  gl_FragColor = vec4(col, a);
}`;

function InteractiveBlackHoleCanvas({
  massSolar,
  spin,
  inclinationDeg,
  accretionMode,
  geodesicMode,
  color,
}: {
  massSolar: number;
  spin: number;
  inclinationDeg: number;
  accretionMode: "dormant" | "active" | "jet";
  geodesicMode: "fast" | "geodesic";
  color: string;
}) {
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(color) },
      uTime: { value: 0 },
      uSpin: { value: spin },
      uInclination: { value: (inclinationDeg * Math.PI) / 180 },
      uAccretionMode: { value: accretionMode === "dormant" ? 0 : accretionMode === "active" ? 1 : 2 },
      uGeodesicMode: { value: geodesicMode === "fast" ? 0 : 1 },
    }),
    [color, spin, inclinationDeg, accretionMode, geodesicMode],
  );

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <group>
      {/* Central Event Horizon Shadow */}
      <mesh>
        <sphereGeometry args={[0.38, 36, 24]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Relativistic Ray-Traced Lensing & Disk Billboard */}
      <Billboard>
        <mesh renderOrder={2}>
          <planeGeometry args={[4.2, 4.2]} />
          <shaderMaterial
            vertexShader={SIM_LENS_VERT}
            fragmentShader={SIM_LENS_FRAG}
            uniforms={uniforms}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </Billboard>

      {/* Relativistic Polar Jets if Jet Mode is Active */}
      {accretionMode === "jet" && (
        <group>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[0, s * 1.8, 0]} rotation-x={s > 0 ? 0 : Math.PI}>
              <cylinderGeometry args={[0.04, 0.16, 3.2, 24, 1, true]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={0.35}
                side={THREE.DoubleSide}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

export function CompactObjectLabModal() {
  const open = useStore((s) => s.compactObjectModalOpen);
  const setOpen = useStore((s) => s.setCompactObjectModalOpen);
  const setSelectedObject = useStore((s) => s.setSelectedObject);

  const [activeTab, setActiveTab] = useState<"simulator" | "gallery" | "physics">("simulator");

  // Simulation state parameters
  const [massSolar, setMassSolar] = useState<number>(21.2); // Cygnus X-1 default
  const [spin, setSpin] = useState<number>(0.95);
  const [inclinationDeg, setInclinationDeg] = useState<number>(45);
  const [accretionMode, setAccretionMode] = useState<"dormant" | "active" | "jet">("active");
  const [geodesicMode, setGeodesicMode] = useState<"fast" | "geodesic">("geodesic");
  const [simPreset, setSimPreset] = useState<string>("cygx1");

  // Derived real-time physical metrics
  const metrics = useMemo(() => {
    return getBlackHoleMetrics(massSolar, spin);
  }, [massSolar, spin]);

  const doppler = useMemo(() => {
    // Relativistic velocity at ISCO: beta ≈ sqrt(1 / r_isco_in_rg)
    const beta = Math.min(0.75, Math.sqrt(1 / Math.max(1.2, metrics.iscoRadiusInRg)));
    const angleRad = (inclinationDeg * Math.PI) / 180;
    return calculateDopplerBeaming(beta, angleRad);
  }, [metrics.iscoRadiusInRg, inclinationDeg]);

  // Handle Preset Selection
  const applyPreset = (presetKey: string) => {
    setSimPreset(presetKey);
    switch (presetKey) {
      case "gaiabh1":
        setMassSolar(9.62);
        setSpin(0.05);
        setInclinationDeg(30);
        setAccretionMode("dormant");
        break;
      case "gaiabh3":
        setMassSolar(32.7);
        setSpin(0.02);
        setInclinationDeg(40);
        setAccretionMode("dormant");
        break;
      case "cygx1":
        setMassSolar(21.2);
        setSpin(0.96);
        setInclinationDeg(27);
        setAccretionMode("jet");
        break;
      case "grs1915":
        setMassSolar(12.4);
        setSpin(0.98);
        setInclinationDeg(66);
        setAccretionMode("jet");
        break;
      case "hlx1":
        setMassSolar(20000);
        setSpin(0.5);
        setInclinationDeg(45);
        setAccretionMode("active");
        break;
      case "sgra":
        setMassSolar(4154000);
        setSpin(0.5);
        setInclinationDeg(30);
        setAccretionMode("active");
        break;
      case "m87":
        setMassSolar(6.5e9);
        setSpin(0.9);
        setInclinationDeg(17);
        setAccretionMode("jet");
        break;
      case "ton618":
        setMassSolar(6.6e10);
        setSpin(0.7);
        setInclinationDeg(50);
        setAccretionMode("active");
        break;
    }
  };

  // Filter catalog compact objects
  const compactCatalog = useMemo(() => {
    return OBSERVED_OBJECTS.filter(
      (o) =>
        o.category === "Black hole" ||
        o.category === "Neutron star" ||
        o.category === "Quasar" ||
        o.category === "Gravitational wave" ||
        o.id === "siriusb" ||
        o.id === "cas-a",
    );
  }, []);

  if (!open) return null;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
    >
      <div className="relative flex flex-col w-full max-w-6xl h-[92vh] max-h-[900px] overflow-hidden rounded-2xl border border-white/15 bg-slate-950 text-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 grid place-items-center text-cyan-300 font-bold">
              ◎
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-wide text-white">
                Relativistic Compact-Object Laboratory
              </h2>
              <p className="text-xs text-slate-400">
                Schwarzschild & Kerr Spacetime, Geodesic Lensing & Verified Catalog Gallery
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tabs */}
            <div className="flex items-center rounded-xl bg-black/50 p-1 border border-white/10 text-xs">
              <button
                onClick={() => setActiveTab("simulator")}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === "simulator"
                    ? "bg-cyan-500 text-black font-bold shadow"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Simulation Lab
              </button>
              <button
                onClick={() => setActiveTab("gallery")}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === "gallery"
                    ? "bg-cyan-500 text-black font-bold shadow"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                10-Class Gallery
              </button>
              <button
                onClick={() => setActiveTab("physics")}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === "physics"
                    ? "bg-cyan-500 text-black font-bold shadow"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Theory & Formulas
              </button>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white transition"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "simulator" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
              {/* 3D Viewport Column */}
              <div className="lg:col-span-7 relative h-[380px] lg:h-full bg-black border-b lg:border-b-0 lg:border-r border-white/10">
                <Canvas camera={{ position: [0, 1.2, 3.6], fov: 45 }}>
                  <color attach="background" args={["#030712"]} />
                  <ambientLight intensity={0.4} />
                  <InteractiveBlackHoleCanvas
                    massSolar={massSolar}
                    spin={spin}
                    inclinationDeg={inclinationDeg}
                    accretionMode={accretionMode}
                    geodesicMode={geodesicMode}
                    color="#f59e0b"
                  />
                  <OrbitControls enablePan={false} minDistance={1.8} maxDistance={7.5} />
                </Canvas>

                {/* Viewport Overlay Controls */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2 pointer-events-auto">
                  <div className="rounded-lg bg-black/70 backdrop-blur border border-white/10 px-3 py-1 text-[11px] text-cyan-300">
                    Mode: <span className="font-bold text-white capitalize">{accretionMode}</span>
                  </div>
                  <button
                    onClick={() => setGeodesicMode(geodesicMode === "fast" ? "geodesic" : "fast")}
                    className="rounded-lg bg-black/70 backdrop-blur border border-cyan-500/40 px-3 py-1 text-[11px] text-cyan-200 hover:bg-cyan-950/40 transition"
                  >
                    Engine:{" "}
                    <strong className="text-white capitalize">
                      {geodesicMode === "geodesic" ? "Precision Geodesic" : "Analytical Fast"}
                    </strong>
                  </button>
                </div>

                <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                  <div className="rounded-xl bg-black/75 backdrop-blur border border-white/10 p-3 text-[11px] text-slate-300 flex flex-wrap justify-between items-center gap-2">
                    <span>
                      Drag to rotate viewing geometry. Scroll to zoom into the photon ring.
                    </span>
                    {accretionMode === "dormant" && (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Dormant: Zero accretion disk emission (pure lensing)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Controls & Metrics Column */}
              <div className="lg:col-span-5 p-6 overflow-y-auto space-y-6 bg-slate-950">
                {/* Presets */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Verified Benchmark Presets
                  </span>
                  <div className="grid grid-cols-4 gap-1.5 text-xs">
                    {[
                      { id: "gaiabh1", label: "Gaia BH1 (Dormant)" },
                      { id: "cygx1", label: "Cyg X-1 (Accreting)" },
                      { id: "grs1915", label: "GRS 1915 (Max Spin)" },
                      { id: "hlx1", label: "HLX-1 (IMBH)" },
                      { id: "sgra", label: "Sgr A* (EHT)" },
                      { id: "m87", label: "M87* (Jet)" },
                      { id: "gaiabh3", label: "Gaia BH3 (Halo)" },
                      { id: "ton618", label: "TON 618 (Colossus)" },
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => applyPreset(p.id)}
                        className={`p-1.5 text-center rounded-lg text-[10.5px] border transition truncate ${
                          simPreset === p.id
                            ? "bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold"
                            : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                        }`}
                        title={p.label}
                      >
                        {p.label.split(" (")[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accretion Mode Selector */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Accretion State & Environment
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { mode: "dormant", label: "Dormant / Isolated", desc: "No disk, pure lensing" },
                      { mode: "active", label: "Standard Accretion", desc: "Warped disk & ISCO" },
                      { mode: "jet", label: "Relativistic Jet", desc: "Collimated plasma outflow" },
                    ].map((m) => (
                      <button
                        key={m.mode}
                        onClick={() => setAccretionMode(m.mode as any)}
                        className={`p-2.5 rounded-xl border text-left transition ${
                          accretionMode === m.mode
                            ? "bg-cyan-950/50 border-cyan-400 text-white shadow-sm"
                            : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white"
                        }`}
                      >
                        <div className="font-semibold text-xs text-white">{m.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{m.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sliders */}
                <div className="space-y-4 rounded-xl border border-white/10 bg-black/40 p-4">
                  {/* Mass Slider (Logarithmic scaling) */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Black Hole Mass:</span>
                      <span className="font-mono text-cyan-300 font-bold">
                        {massSolar >= 1e6
                          ? `${(massSolar / 1e6).toFixed(2)}M M☉`
                          : `${massSolar.toLocaleString()} M☉`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="11"
                      step="0.1"
                      value={Math.log10(massSolar)}
                      onChange={(e) => {
                        setMassSolar(Math.pow(10, parseFloat(e.target.value)));
                        setSimPreset("custom");
                      }}
                      className="w-full accent-cyan-400"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-0.5">
                      <span>10 M☉ (Stellar)</span>
                      <span>10⁴ M☉ (IMBH)</span>
                      <span>10⁶ M☉ (SMBH)</span>
                      <span>10¹¹ M☉ (Ultramassive)</span>
                    </div>
                  </div>

                  {/* Kerr Spin Slider */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Kerr Dimensionless Spin (a*):</span>
                      <span className="font-mono text-amber-300 font-bold">{spin.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="-0.998"
                      max="0.998"
                      step="0.01"
                      value={spin}
                      onChange={(e) => {
                        setSpin(parseFloat(e.target.value));
                        setSimPreset("custom");
                      }}
                      className="w-full accent-amber-400"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-0.5">
                      <span>-0.998 (Retrograde)</span>
                      <span>0.0 (Schwarzschild)</span>
                      <span>+0.998 (Extreme Prograde)</span>
                    </div>
                  </div>

                  {/* Inclination Angle */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Observer Inclination (θ):</span>
                      <span className="font-mono text-white font-bold">{inclinationDeg}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="85"
                      step="1"
                      value={inclinationDeg}
                      onChange={(e) => setInclinationDeg(parseInt(e.target.value, 10))}
                      className="w-full accent-violet-400"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-0.5">
                      <span>0° (Face-on)</span>
                      <span>45° (Oblique)</span>
                      <span>85° (Edge-on)</span>
                    </div>
                  </div>
                </div>

                {/* Real-Time Theoretical Metrics Card */}
                <div className="rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 to-black p-4 space-y-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 border-b border-white/10 pb-1.5 flex items-center justify-between">
                    <span>Relativistic Calculations</span>
                    <span className="text-slate-400 font-mono text-[9px]">G = c = 1 Normalized</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Schwarzschild Radius (Rs):</span>
                      <span className="font-mono text-white font-bold">
                        {metrics.schwarzschildRadiusMeters >= 1.496e11
                          ? `${(metrics.schwarzschildRadiusMeters / 1.496e11).toFixed(2)} AU`
                          : `${(metrics.schwarzschildRadiusMeters / 1000).toLocaleString(undefined, {
                              maximumFractionDigits: 1,
                            })} km`}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Kerr Event Horizon (R+):</span>
                      <span className="font-mono text-cyan-300 font-bold">
                        {metrics.kerrHorizonRadiusMeters >= 1.496e11
                          ? `${(metrics.kerrHorizonRadiusMeters / 1.496e11).toFixed(2)} AU`
                          : `${(metrics.kerrHorizonRadiusMeters / 1000).toLocaleString(undefined, {
                              maximumFractionDigits: 1,
                            })} km`}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">ISCO Radius:</span>
                      <span className="font-mono text-amber-300 font-bold">
                        {metrics.iscoRadiusInRg.toFixed(2)} r_g (
                        {metrics.iscoRadiusMeters >= 1.496e11
                          ? `${(metrics.iscoRadiusMeters / 1.496e11).toFixed(2)} AU`
                          : `${Math.round(metrics.iscoRadiusMeters / 1000).toLocaleString()} km`}
                        )
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Apparent Shadow (2 b_crit):</span>
                      <span className="font-mono text-white font-bold">
                        {(metrics.apparentShadowDiameterMeters / 1000 >= 1e6
                          ? `${(metrics.apparentShadowDiameterMeters / 1.496e11).toFixed(2)} AU`
                          : `${Math.round(metrics.apparentShadowDiameterMeters / 1000).toLocaleString()} km`)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">ISCO Gravitational Redshift:</span>
                      <span className="font-mono text-purple-300 font-bold">
                        z_grav = {metrics.gravitationalRedshiftAtISCO.toFixed(3)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Doppler Beaming Boost:</span>
                      <span className="font-mono text-emerald-300 font-bold">
                        {doppler.intensityFactor.toFixed(2)}× intensity
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "gallery" && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white">
                  Verified Compact-Object Reference Gallery
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Catalogued reference examples across all 10 compact object classes with real coordinates, mass measurements, and empirical citations.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {compactCatalog.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex flex-col justify-between hover:border-cyan-500/40 transition group"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-white/5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
                          {item.category}
                        </span>
                        <span className="text-[10px] text-slate-500">{item.distance.toLocaleString()} ly</span>
                      </div>
                      <h4 className="text-lg font-bold text-white mt-2 group-hover:text-cyan-300 transition">
                        {item.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">{item.subtype}</p>
                      <p className="text-xs text-slate-300 mt-3 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>

                      {item.compactPhysics && (
                        <div className="mt-3 p-2 rounded-lg bg-black/40 border border-white/5 text-[11px] space-y-1">
                          {item.compactPhysics.massSolar && (
                            <div className="flex justify-between text-slate-400">
                              <span>Mass:</span>
                              <span className="font-mono text-white font-medium">
                                {item.compactPhysics.massSolar >= 1e6
                                  ? `${(item.compactPhysics.massSolar / 1e6).toFixed(2)}M M☉`
                                  : `${item.compactPhysics.massSolar} M☉`}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between text-slate-400">
                            <span>Accretion:</span>
                            <span className={`font-mono capitalize ${
                              item.compactPhysics.hasAccretionDisk ? "text-amber-300" : "text-emerald-400"
                            }`}>
                              {item.compactPhysics.accretionState.replace("_", " ")}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[9px] text-slate-500 truncate max-w-[170px]" title={item.source}>
                        {item.source}
                      </span>
                      <button
                        onClick={() => {
                          setOpen(false);
                          setSelectedObject(item.id);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-400/30 text-xs font-semibold text-cyan-300 hover:bg-cyan-500 hover:text-black transition"
                      >
                        <span>Fly to Object</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "physics" && (
            <div className="p-6 space-y-6 max-w-4xl mx-auto">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  Theoretical Foundations of Relativistic Spacetime
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Mathematical rigor, general relativity invariants, and observational distinction between dormant and accreting compact bodies.
                </p>
              </div>

              <div className="space-y-4 text-sm leading-relaxed text-slate-300">
                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                  <h4 className="text-base font-bold text-cyan-300 mb-2">
                    1. Why Black Holes Are Not Inherently Luminous
                  </h4>
                  <p>
                    A black hole itself has zero intrinsic surface luminosity. By definition, its interior is bounded by the event horizon $R_s = 2GM/c^2$, inside which escape velocity exceeds the speed of light. Its visual appearance in deep space depends entirely on:
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-slate-300">
                    <li>
                      <strong>Accretion Environment:</strong> Quiescent, isolated black holes (such as Gaia BH1 and Gaia BH3) have no dense companion star wind or gas reservoir. They produce <em>zero hot accretion glow</em> and appear as pure gravitational light-deflecting shadows against the stellar background.
                    </li>
                    <li>
                      <strong>Viscous Dissipation:</strong> Accreting systems (such as Cygnus X-1 and quasars) heat infalling plasma via magnetorotational turbulence to millions of Kelvin, radiating X-rays and ultraviolet light before crossing the Innermost Stable Circular Orbit.
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                  <h4 className="text-base font-bold text-amber-300 mb-2">
                    2. Kerr Metric &amp; Asymmetric Shadow Distortion
                  </h4>
                  <p>
                    Rotating black holes drag spacetime itself through frame dragging (the Lense-Thirring effect). As the dimensionless spin parameter a* → 1:
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-slate-300">
                    <li>
                      The prograde Innermost Stable Circular Orbit contracts from 6 r_g (3 R_s) all the way down to 1.23 r_g (0.615 R_s), enabling accretion disks to reach much deeper into the gravitational potential.
                    </li>
                    <li>
                      The event horizon shadow becomes flattened into a characteristic D-shape silhouette on the approaching side.
                    </li>
                    <li>
                      Relativistic Doppler boosting concentrates emission into a forward beam proportional to δ^(3+α), causing the side rotating toward the observer to appear dramatically brighter and blueshifted.
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                  <h4 className="text-base font-bold text-purple-300 mb-2">
                    3. Neutron Star Electrodynamics &amp; Lighthouse Beams
                  </h4>
                  <p>
                    Neutron stars pack 1.4 to 2.1 solar masses into a radius of just ~11.5 km. With magnetic dipole moments tilted at angle α to their rotational axis:
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-slate-300">
                    <li>
                      Ultra-relativistic plasma accelerates along open magnetic field lines, launching synchro-curvature radiation beams from the magnetic poles.
                    </li>
                    <li>
                      The light cylinder radius R_LC = c / Ω = c P / (2π) sets the boundary where co-rotation would require exceeding light speed, demarcating the wave zone.
                    </li>
                    <li>
                      Thermal cooling neutron stars (like RX J1856.5-3754) lack strong active radio beams and glow unpulsed in soft X-rays, with gravitational surface deflection allowing more than 50% of the sphere to be visible at once.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

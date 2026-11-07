import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import { SafeHtml as Html } from "./SafeHtml";
import { useStore } from "./store";
import { GALAXY_BY_NAME, galaxyOrientation, gToXYZ } from "./galaxy-models";
import { GalaxyCatalogCloud } from "./GalaxyCatalogCloud";
import type { ObservationalGalaxy } from "./galaxy-catalog";
export function ObservationalGalaxyNode({
  g,
  navigating,
}: {
  g: ObservationalGalaxy;
  navigating?: { current: boolean };
}) {
  const pos = useMemo(() => gToXYZ(g.l, g.b, g.distance), [g]);
  const model = GALAXY_BY_NAME.get(g.name)!;
  const orientation = useMemo(() => galaxyOrientation(model), [model]);
  const pickRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const setVisitGalaxy = useStore((s) => s.setVisitGalaxy);
  const hasDetail = Boolean(model);
  useFrame(({ camera, size }) => {
    if (navigating?.current && hovered) {
      setHovered(false);
      document.body.style.cursor = "";
    }
    const distance = camera.position.distanceTo(pos);
    const minDiameter =
      (distance *
        2 *
        Math.tan(THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov * 0.5)) *
        7) /
      size.height;
    if (pickRef.current) pickRef.current.scale.setScalar(Math.max(g.size, minDiameter) * 0.5);
  });
  const onOver = (e: ThreeEvent<PointerEvent>) => {
    if (navigating?.current || e.buttons !== 0) return;
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "pointer";
  };
  const onOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = "";
  };
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 4) return;
    e.stopPropagation();
    setVisitGalaxy({
      name: g.name,
      x: pos.x,
      y: pos.y,
      z: pos.z,
      size: g.size,
      distance: g.distance,
      type: g.type,
      view: "overview",
    });
  };

  const distLabel =
    g.distance >= 1_000_000_000
      ? (g.distance / 1_000_000_000).toFixed(2) + " Gly"
      : g.distance >= 1_000_000
        ? (g.distance / 1_000_000).toFixed(2) + " Mly"
        : (g.distance / 1000).toFixed(0) + " kly";

  return (
    <group position={pos}>
      <group quaternion={orientation}>
        <GalaxyCatalogCloud model={model} />
      </group>

      {/* Invisible pick target */}
      <mesh
        ref={pickRef}
        visible={false}
        onPointerOver={onOver}
        onPointerOut={onOut}
        onClick={onClick}
      >
        <sphereGeometry args={[1, 10, 10]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Mount the tooltip only while hovered; hidden roots must not track the camera. */}
      {hovered && (
        <Billboard>
          <Html center zIndexRange={[15, 0]} style={{ pointerEvents: "none" }}>
            <div
              style={{
                opacity: hovered ? 1 : 0,
                transform: "translate(12px, -12px)",
                color: "#ffffff",
                fontSize: 13,
                fontFamily: "Inter, system-ui, sans-serif",
                letterSpacing: 0.5,
                whiteSpace: "nowrap",
                padding: "5px 10px",
                borderLeft: "2px solid rgba(120,180,255,0.9)",
                background: "rgba(6,9,22,0.85)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
                transition: "opacity 150ms ease-out",
              }}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-white">{g.name}</span>
                {hasDetail && (
                  <span className="rounded bg-sky-500/20 px-1 py-0.5 text-[9px] uppercase tracking-wider text-sky-300">
                    ✦ 3D Model
                  </span>
                )}
              </div>
              <div style={{ fontSize: 10, opacity: 0.75, marginTop: 3 }}>
                {g.morphologyClass ? `${g.morphologyClass} · ` : ""}
                {g.type} · {distLabel}
              </div>
              <div style={{ fontSize: 9, opacity: 0.55, marginTop: 1 }}>
                {g.redshift === undefined
                  ? "Radial velocity / redshift unknown"
                  : g.redshift < 0
                    ? `${g.redshiftMethod === "velocity_proxy" ? "v/c" : "z"} = ${g.redshift.toFixed(6)} (Blueshifted)`
                    : `${g.redshiftMethod === "velocity_proxy" ? "v/c" : "z"} = ${g.redshift.toFixed(g.redshift > 1 ? 3 : 5)}`}
                {g.hostGroup ? ` · ${g.hostGroup}` : ""}
              </div>
            </div>
          </Html>
        </Billboard>
      )}
    </group>
  );
}

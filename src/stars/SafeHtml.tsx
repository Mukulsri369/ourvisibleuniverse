import * as React from "react";
import * as ReactDOM from "react-dom/client";
import * as THREE from "three";
import {
  Vector3,
  DoubleSide,
  OrthographicCamera,
  PerspectiveCamera,
  Vector2,
  Group,
  type Object3D,
  type Camera,
} from "three";
import { useThree, useFrame } from "@react-three/fiber";

const v1 = new Vector3();
const v2 = new Vector3();
const v3 = new Vector3();
const v4 = new Vector2();

function defaultCalculatePosition(
  el: Object3D,
  camera: Camera,
  size: { width: number; height: number },
): [number, number] {
  const objectPos = v1.setFromMatrixPosition(el.matrixWorld);
  objectPos.project(camera);
  const widthHalf = size.width / 2;
  const heightHalf = size.height / 2;
  return [objectPos.x * widthHalf + widthHalf, -(objectPos.y * heightHalf) + heightHalf];
}

function isObjectBehindCamera(el: Object3D, camera: Camera): boolean {
  const objectPos = v1.setFromMatrixPosition(el.matrixWorld);
  const cameraPos = v2.setFromMatrixPosition(camera.matrixWorld);
  const deltaCamObj = objectPos.sub(cameraPos);
  const camDir = camera.getWorldDirection(v3);
  return deltaCamObj.angleTo(camDir) > Math.PI / 2;
}

function objectScale(el: Object3D, camera: Camera): number {
  if (camera instanceof OrthographicCamera) {
    return camera.zoom;
  } else if (camera instanceof PerspectiveCamera) {
    const objectPos = v1.setFromMatrixPosition(el.matrixWorld);
    const cameraPos = v2.setFromMatrixPosition(camera.matrixWorld);
    const vFOV = (camera.fov * Math.PI) / 180;
    const dist = objectPos.distanceTo(cameraPos);
    const scaleFOV = 2 * Math.tan(vFOV / 2) * dist;
    return 1 / scaleFOV;
  }
  return 1;
}

function objectZIndex(
  el: Object3D,
  camera: Camera,
  zIndexRange: [number, number],
): number | undefined {
  if (camera instanceof PerspectiveCamera || camera instanceof OrthographicCamera) {
    const objectPos = v1.setFromMatrixPosition(el.matrixWorld);
    const cameraPos = v2.setFromMatrixPosition(camera.matrixWorld);
    const dist = objectPos.distanceTo(cameraPos);
    const A = (zIndexRange[1] - zIndexRange[0]) / (camera.far - camera.near);
    const B = zIndexRange[1] - A * camera.far;
    return Math.round(A * dist + B);
  }
  return undefined;
}

export interface SafeHtmlProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  eps?: number;
  style?: React.CSSProperties;
  className?: string;
  prepend?: boolean;
  center?: boolean;
  fullscreen?: boolean;
  portal?: React.RefObject<HTMLElement | null>;
  distanceFactor?: number;
  sprite?: boolean;
  transform?: boolean;
  zIndexRange?: [number, number];
  calculatePosition?: (
    el: Object3D,
    camera: Camera,
    size: { width: number; height: number },
  ) => [number, number];
  as?: string;
  wrapperClass?: string;
  pointerEvents?: React.CSSProperties["pointerEvents"];
}

export const SafeHtml = React.forwardRef<HTMLDivElement, SafeHtmlProps>(
  (
    {
      children,
      eps = 0.001,
      style,
      className,
      prepend,
      center,
      fullscreen,
      portal,
      distanceFactor,
      zIndexRange = [16777271, 0],
      calculatePosition = defaultCalculatePosition,
      as = "div",
      wrapperClass,
      pointerEvents = "auto",
      ...props
    },
    ref,
  ) => {
    const { gl, camera, scene, size, events } = useThree();
    const [el] = React.useState(() => document.createElement(as));
    const root = React.useRef<ReactDOM.Root | null>(null);
    const group = React.useRef<THREE.Group>(null);
    const oldZoom = React.useRef(0);
    const oldPosition = React.useRef<[number, number]>([0, 0]);
    const visible = React.useRef(true);

    const target = portal?.current || (events.connected as HTMLElement) || gl.domElement.parentNode;

    React.useLayoutEffect(() => {
      if (!group.current) return;

      const currentRoot = (root.current = ReactDOM.createRoot(el));
      scene.updateMatrixWorld();

      const vec = calculatePosition(group.current, camera, size);
      el.style.cssText = `position:absolute;top:0;left:0;transform:translate3d(${vec[0]}px,${vec[1]}px,0);transform-origin:0 0;`;

      if (target) {
        if (prepend) {
          target.prepend(el);
        } else {
          target.appendChild(el);
        }
      }

      return () => {
        if (target && target.contains(el)) {
          target.removeChild(el);
        }
        // CRITICAL REACT 19 FIX: Defer unmounting to the next macrotask to prevent
        // "Attempted to synchronously unmount a root while React was already rendering"
        setTimeout(() => {
          try {
            currentRoot.unmount();
          } catch {
            // Root might already have unmounted
          }
        }, 0);
      };
    }, [target]);

    React.useLayoutEffect(() => {
      if (wrapperClass) el.className = wrapperClass;
    }, [wrapperClass]);

    const styles: React.CSSProperties = React.useMemo(() => {
      return {
        position: "absolute",
        transform: center ? "translate3d(-50%,-50%,0)" : "none",
        ...(fullscreen && {
          top: -size.height / 2,
          left: -size.width / 2,
          width: size.width,
          height: size.height,
        }),
        pointerEvents,
        ...style,
      };
    }, [style, center, fullscreen, size, pointerEvents]);

    React.useLayoutEffect(() => {
      if (root.current) {
        root.current.render(
          <div ref={ref} style={styles} className={className} {...props}>
            {children}
          </div>,
        );
      }
    });

    useFrame(() => {
      if (!group.current) return;
      camera.updateMatrixWorld();
      group.current.updateWorldMatrix(true, false);

      const vec = calculatePosition(group.current, camera, size);
      if (
        Math.abs(oldZoom.current - camera.zoom) > eps ||
        Math.abs(oldPosition.current[0] - vec[0]) > eps ||
        Math.abs(oldPosition.current[1] - vec[1]) > eps
      ) {
        const isBehindCamera = isObjectBehindCamera(group.current, camera);
        const previouslyVisible = visible.current;
        visible.current = !isBehindCamera;

        if (previouslyVisible !== visible.current) {
          el.style.display = visible.current ? "block" : "none";
        }

        el.style.zIndex = `${objectZIndex(group.current, camera, zIndexRange) ?? 0}`;

        const scale =
          distanceFactor === undefined ? 1 : objectScale(group.current, camera) * distanceFactor;
        el.style.transform = `translate3d(${vec[0]}px,${vec[1]}px,0) scale(${scale})`;

        oldPosition.current = vec;
        oldZoom.current = camera.zoom;
      }
    });

    return <group ref={group} />;
  },
);

SafeHtml.displayName = "SafeHtml";

interface CameraAngles {
  theta: number;
  phi: number;
}

/** A drag remains a drag when the pointer eventually returns to its start. */
export class PointerDragClickGuard {
  private pointer: number | null = null;
  private startX = 0;
  private startY = 0;
  private lastX = 0;
  private lastY = 0;
  private travel = 0;
  private dragged = false;
  private pendingClick = false;

  begin(pointer: number, x: number, y: number): void {
    if (this.pointer !== null) {
      if (this.pointer !== pointer) this.dragged = true;
      return;
    }
    this.pointer = pointer;
    this.startX = this.lastX = x;
    this.startY = this.lastY = y;
    this.travel = 0;
    this.dragged = this.pendingClick = false;
  }

  move(pointer: number, x: number, y: number): void {
    if (pointer !== this.pointer || !Number.isFinite(x + y)) return;
    this.travel += Math.hypot(x - this.lastX, y - this.lastY);
    this.lastX = x;
    this.lastY = y;
    this.dragged ||= this.travel > 4 || Math.hypot(x - this.startX, y - this.startY) > 4;
  }

  end(pointer: number): void {
    if (pointer !== this.pointer) return;
    this.pendingClick = this.dragged;
    this.pointer = null;
  }

  consumeClick(): boolean {
    const suppress = this.pendingClick;
    this.pendingClick = false;
    return suppress;
  }

  cancel(): void {
    this.pointer = null;
    this.dragged = this.pendingClick = false;
    this.travel = 0;
  }
}

/** Keep rendering between input packets, including the short settle after release. */
export class ManualCameraRotation {
  private pending = false;
  private theta = 0;
  private phi = 0;

  record(angles: CameraAngles): void {
    this.pending = true;
    this.theta = angles.theta;
    this.phi = angles.phi;
  }

  consume(angles: CameraAngles, current: CameraAngles): boolean {
    // A subsequent explicit destination/reset owns its new orientation and must
    // retain cinematic easing rather than inherit an earlier pointer event.
    if (!this.pending || angles.theta !== this.theta || angles.phi !== this.phi) {
      this.pending = false;
      return false;
    }
    if (Math.abs(current.theta - angles.theta) + Math.abs(current.phi - angles.phi) < 1e-7) {
      this.pending = false;
      return false;
    }
    return true;
  }
}

// A 20ms response fills display frames between sparse mouse packets. This is
// much shorter than flight easing, with no velocity extrapolation or overshoot.
export const MANUAL_ORBIT_RESPONSE = 50;
/** Resample manual targets on every display frame; automated turns keep their easing. */
export function advanceCameraAngles(
  current: CameraAngles,
  requested: CameraAngles,
  response: number,
  deltaSeconds: number,
  manualInput: boolean,
): void {
  if (deltaSeconds <= 0) return;
  const factor =
    1 -
    Math.exp(
      -(manualInput ? MANUAL_ORBIT_RESPONSE : response) * Math.max(0, Math.min(deltaSeconds, 0.1)),
    );
  current.theta += (requested.theta - current.theta) * factor;
  current.phi += (requested.phi - current.phi) * factor;
  if (
    manualInput &&
    Math.abs(current.theta - requested.theta) + Math.abs(current.phi - requested.phi) < 1e-7
  ) {
    current.theta = requested.theta;
    current.phi = requested.phi;
  }
}

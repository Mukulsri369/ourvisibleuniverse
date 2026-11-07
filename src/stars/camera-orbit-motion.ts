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

/** Coalesce pointer events without losing a final move that precedes pointerup. */
export class ManualCameraRotation {
  private pending = false;
  private theta = 0;
  private phi = 0;

  record(angles: CameraAngles): void {
    this.pending = true;
    this.theta = angles.theta;
    this.phi = angles.phi;
  }

  consume(angles: CameraAngles): boolean {
    // A subsequent explicit destination/reset owns its new orientation and must
    // retain cinematic easing rather than inherit an earlier pointer event.
    const direct = this.pending && angles.theta === this.theta && angles.phi === this.phi;
    this.pending = false;
    return direct;
  }
}

/** Direct gestures follow the latest input at render time; automated turns ease. */
export function advanceCameraAngles(
  current: CameraAngles,
  requested: CameraAngles,
  response: number,
  deltaSeconds: number,
  manualInput: boolean,
): void {
  if (manualInput) {
    current.theta = requested.theta;
    current.phi = requested.phi;
    return;
  }
  const factor = 1 - Math.exp(-response * Math.max(0, Math.min(deltaSeconds, 0.1)));
  current.theta += (requested.theta - current.theta) * factor;
  current.phi += (requested.phi - current.phi) * factor;
}

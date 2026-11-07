export function frameSummary(frames: number[], elapsedMs: number) {
  if (!frames.length || elapsedMs <= 0 || frames.some((f) => !Number.isFinite(f) || f <= 0))
    throw new Error("Invalid frame sample");
  const sorted = [...frames].sort((a, b) => a - b);
  const percentile = (p: number) =>
    sorted[Math.min(sorted.length - 1, Math.ceil(p * sorted.length) - 1)];
  return {
    frames: frames.length,
    elapsedMs,
    fps: (frames.length * 1000) / elapsedMs,
    meanFrameMs: frames.reduce((a, b) => a + b, 0) / frames.length,
    p50FrameMs: percentile(0.5),
    p95FrameMs: percentile(0.95),
    p99FrameMs: percentile(0.99),
    longestFrameMs: sorted[sorted.length - 1],
  };
}

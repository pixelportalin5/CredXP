"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface UseCountUpOptions {
  end: number;
  duration?: number;
  start?: number;
  enabled?: boolean;
  decimals?: number;
}

export function useCountUp({
  end,
  duration = 1200,
  start = 0,
  enabled = true,
  decimals = 0,
}: UseCountUpOptions): number {
  const [value, setValue] = useState(start);
  const [wasEnabled, setWasEnabled] = useState(enabled);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Restart from `start` whenever the animation is toggled, so re-enabling
  // never flashes the value left over from the previous run.
  if (enabled !== wasEnabled) {
    setWasEnabled(enabled);
    setValue(start);
  }

  useEffect(() => {
    if (!enabled || prefersReducedMotion) return undefined;

    let frameId = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = start + (end - start) * eased;
      setValue(Number(next.toFixed(decimals)));

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [end, duration, start, enabled, decimals, prefersReducedMotion]);

  if (!enabled) return start;
  if (prefersReducedMotion) return end;
  return value;
}

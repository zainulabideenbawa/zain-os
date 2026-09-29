/**
 * Pure helper functions for Focus Sessions & Deep Work calculation
 */

export interface FocusProgressResult {
  totalMinutes: number;
  doneMin: boolean;
  doneTarget: boolean;
  statusLabel: string;
}

/**
 * Calculates elapsed minutes between startedAt and endedAt.
 */
export function calculateSessionMinutes(startedAt: Date | string, endedAt: Date | string): number {
  const startMs = new Date(startedAt).getTime();
  const endMs = new Date(endedAt).getTime();
  if (endMs <= startMs) return 0;
  return Math.round((endMs - startMs) / (60 * 1000));
}

/**
 * Evaluates whether focus work meets minimum and target thresholds,
 * and produces the exact card status format per Spec §4.1 and P0-5.
 */
export function evaluateFocusProgress(
  totalMinutes: number,
  minMinutes: number = 90,
  targetMinutes: number = 180,
  isRunning: boolean = false,
  activeElapsedMinutes: number = 0
): FocusProgressResult {
  const currentTotal = totalMinutes + (isRunning ? activeElapsedMinutes : 0);
  const doneMin = currentTotal >= minMinutes;
  const doneTarget = currentTotal >= targetMinutes;

  let statusLabel: string;
  if (isRunning) {
    statusLabel = `In progress · ${activeElapsedMinutes} min`;
  } else if (doneMin) {
    statusLabel = `Done · ${currentTotal} min ✓`;
  } else if (currentTotal > 0) {
    statusLabel = `${currentTotal}/${minMinutes} min`;
  } else {
    statusLabel = `Not started · 0/${minMinutes}`;
  }

  return {
    totalMinutes: currentTotal,
    doneMin,
    doneTarget,
    statusLabel,
  };
}

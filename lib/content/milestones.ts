export interface MilestoneDefinition {
  days: number;
  title: string;
  isSpecial?: boolean;
}

export const MILESTONES: MilestoneDefinition[] = [
  { days: 3, title: 'First spark · 3 days' },
  { days: 7, title: 'One week · 7 days' },
  { days: 14, title: 'Two weeks · 14 days' },
  { days: 21, title: 'Three weeks · 21 days' },
  { days: 40, title: 'Forty days · 40', isSpecial: true },
  { days: 66, title: '66 days: the habit is forming', isSpecial: true },
  { days: 84, title: 'Full cycle · 84 days', isSpecial: true },
  { days: 100, title: '100 days', isSpecial: true },
];

/**
 * Returns the next milestone definition for a given streak count.
 * Thresholds: 3, 7, 14, 21, 40, 66, 84, 100, then every 50 days (150, 200, 250...).
 */
export function getNextMilestone(currentStreak: number): {
  targetDays: number;
  title: string;
  progressPercent: number;
  isSpecial: boolean;
} {
  for (const m of MILESTONES) {
    if (currentStreak < m.days) {
      const prevMilestone = MILESTONES[MILESTONES.indexOf(m) - 1]?.days || 0;
      const progress = Math.min(
        100,
        Math.max(
          0,
          Math.round(
            ((currentStreak - prevMilestone) / (m.days - prevMilestone)) * 100
          )
        )
      );
      return {
        targetDays: m.days,
        title: m.title,
        progressPercent: progress,
        isSpecial: !!m.isSpecial,
      };
    }
  }

  // Beyond 100: every 50 days
  const nextTarget = Math.ceil((currentStreak + 1) / 50) * 50;
  const prevTarget = nextTarget - 50;
  const progress = Math.min(
    100,
    Math.max(
      0,
      Math.round(((currentStreak - prevTarget) / 50) * 100)
    )
  );

  return {
    targetDays: nextTarget,
    title: `${nextTarget} days`,
    progressPercent: progress,
    isSpecial: true,
  };
}

export const STREAK_COPY = {
  dayKept: 'Day kept',
  dayKeptSub: 'Alhamdulillah',
  atRiskTooltip: 'Missed yesterday. Keep today and the streak lives.',
  comeback: (n: number) => `Comeback. Streak restored · 🔥 ${n}`,
  freezeUsed: (k: number) => `A freeze covered yesterday. ${k} left.`,
  freezeEarned: '7 kept days. You earned a freeze ❄️',
  reset: (best: number) => `The chain reset. Best: ${best}. Day 1 starts now.`,
  shrinkHint: (habitName: string, breaks: number, smaller: string) =>
    `${habitName} broke the chain ${breaks} times in 2 weeks. Shrink it to ${smaller} for now?`,
};

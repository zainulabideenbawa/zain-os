/**
 * Pure Streak Engine for Zain OS
 * Implements Spec Section 5: forgiving streak, freeze banking, comeback, and milestones.
 */

export interface DayInputRecord {
  date: string; // YYYY-MM-DD
  minimumsDone: boolean;
  isFuture?: boolean;
  failedHabits?: string[]; // list of habit keys that were not done
}

export interface StreakSettings {
  freezeEvery?: number; // default 7 kept days per freeze
  freezeBankMax?: number; // default 2
}

export interface EvaluatedDay {
  date: string;
  state: 'kept' | 'at_risk' | 'comeback' | 'frozen' | 'missed' | 'open';
  chain: number;
  freezesBanked: number;
  milestoneReached?: number;
}

export interface StreakEngineResult {
  currentStreak: number;
  bestStreak: number;
  freezesBanked: number;
  currentState: 'kept' | 'at_risk' | 'comeback' | 'frozen' | 'missed' | 'open';
  evaluatedDays: EvaluatedDay[];
  shrinkHint?: {
    habitKey: string;
    failCount: number;
  };
}

export const MILESTONE_THRESHOLDS = [3, 7, 14, 21, 40, 66, 84, 100];

/**
 * Checks whether minimums are satisfied for a given date considering
 * Saturday arabic_class and Sunday weekly_review exceptions.
 */
export function checkDayMinimums(
  dateStr: string,
  completedHabitKeys: Set<string> | string[]
): boolean {
  const completed = new Set(completedHabitKeys);
  const [y, m, d] = dateStr.split('-').map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0 = Sun, 6 = Sat

  // Core minimums required every day
  const salahDone =
    completed.has('salah_fajr') &&
    completed.has('salah_dhuhr') &&
    completed.has('salah_asr') &&
    completed.has('salah_maghrib') &&
    completed.has('salah_isha');

  const quranDone = completed.has('quran');
  const moveDone = completed.has('move');
  const muhasabaDone = completed.has('muhasaba');

  if (!salahDone || !quranDone || !moveDone || !muhasabaDone) {
    return false;
  }

  // Saturday exceptions: arabic_class satisfies both big_rock and arabic
  if (weekday === 6) {
    const arabicClass = completed.has('arabic_class');
    const bigRock = completed.has('big_rock') || arabicClass;
    const arabic = completed.has('arabic') || arabicClass;
    return bigRock && arabic;
  }

  // Sunday exception: weekly_review satisfies big_rock
  if (weekday === 0) {
    const weeklyReview = completed.has('weekly_review');
    const bigRock = completed.has('big_rock') || weeklyReview;
    const arabic = completed.has('arabic');
    return bigRock && arabic;
  }

  // Weekdays Mon-Fri (1-5): big_rock and arabic are both required
  const bigRock = completed.has('big_rock');
  const arabic = completed.has('arabic');
  return bigRock && arabic;
}

/**
 * Returns progress toward a kept day (doneCount out of 6 minimums).
 * The 6 components:
 * 1. 5 Salah (all 5 prayed)
 * 2. Qur'an (1 page)
 * 3. Move (20 min)
 * 4. Big Rock (90 min; Sat: arabic_class; Sun: weekly_review)
 * 5. Arabic (10 min; Sat: arabic_class)
 * 6. Muhasaba + plan
 */
export function getMinimumsProgress(
  dateStr: string,
  completedHabitKeys: Set<string> | string[]
): { doneCount: number; totalCount: number; isKept: boolean } {
  const completed = new Set(completedHabitKeys);
  const [y, m, d] = dateStr.split('-').map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();

  const salahDone =
    completed.has('salah_fajr') &&
    completed.has('salah_dhuhr') &&
    completed.has('salah_asr') &&
    completed.has('salah_maghrib') &&
    completed.has('salah_isha');

  const quranDone = completed.has('quran');
  const moveDone = completed.has('move');
  const muhasabaDone = completed.has('muhasaba');

  let bigRockDone = false;
  let arabicDone = false;

  if (weekday === 6) {
    const arabicClass = completed.has('arabic_class');
    bigRockDone = completed.has('big_rock') || arabicClass;
    arabicDone = completed.has('arabic') || arabicClass;
  } else if (weekday === 0) {
    const weeklyReview = completed.has('weekly_review');
    bigRockDone = completed.has('big_rock') || weeklyReview;
    arabicDone = completed.has('arabic');
  } else {
    bigRockDone = completed.has('big_rock');
    arabicDone = completed.has('arabic');
  }

  const items = [salahDone, quranDone, moveDone, bigRockDone, arabicDone, muhasabaDone];
  const doneCount = items.filter(Boolean).length;
  const totalCount = items.length; // 6

  return {
    doneCount,
    totalCount,
    isKept: doneCount === totalCount,
  };
}

/**
 * Pure Streak Engine evaluating an ordered array of day records.
 */
export function evaluateStreak(
  days: DayInputRecord[],
  settings: StreakSettings = {}
): StreakEngineResult {
  const freezeEvery = settings.freezeEvery ?? 7;
  const freezeBankMax = settings.freezeBankMax ?? 2;

  let chain = 0;
  let bestStreak = 0;
  let freezesBanked = 0;
  let totalKeptDays = 0;
  let previousState: EvaluatedDay['state'] = 'open';

  const evaluatedDays: EvaluatedDay[] = [];
  const missEventsLast14Days: { date: string; failedHabits?: string[] }[] = [];

  // Sort days ascending by date
  const sortedDays = [...days].sort((a, b) => a.date.localeCompare(b.date));

  for (let i = 0; i < sortedDays.length; i++) {
    const day = sortedDays[i];

    if (day.isFuture) {
      evaluatedDays.push({
        date: day.date,
        state: 'open',
        chain,
        freezesBanked,
      });
      continue;
    }

    let state: EvaluatedDay['state'] = 'open';
    let milestoneReached: number | undefined;

    if (day.minimumsDone) {
      totalKeptDays += 1;

      // Check if a freeze is earned (every 7 kept days)
      if (totalKeptDays % freezeEvery === 0) {
        freezesBanked = Math.min(freezeBankMax, freezesBanked + 1);
      }

      if (previousState === 'at_risk') {
        state = 'comeback';
      } else {
        state = 'kept';
      }

      chain += 1;

      if (chain > bestStreak) {
        bestStreak = chain;
      }

      // Check milestone reached
      if (
        MILESTONE_THRESHOLDS.includes(chain) ||
        (chain > 100 && chain % 50 === 0)
      ) {
        milestoneReached = chain;
      }
    } else {
      // Day missed
      if (freezesBanked > 0) {
        // Auto-use banked freeze: chain neither increases nor breaks
        state = 'frozen';
        freezesBanked -= 1;
      } else if (
        previousState === 'kept' ||
        previousState === 'comeback' ||
        previousState === 'frozen'
      ) {
        // Single miss -> at_risk (amber, chain NOT reset)
        state = 'at_risk';
        missEventsLast14Days.push({
          date: day.date,
          failedHabits: day.failedHabits,
        });
      } else {
        // Second consecutive miss -> reset chain to 0
        state = 'missed';
        chain = 0;
        missEventsLast14Days.push({
          date: day.date,
          failedHabits: day.failedHabits,
        });
      }
    }

    previousState = state;

    evaluatedDays.push({
      date: day.date,
      state,
      chain,
      freezesBanked,
      milestoneReached,
    });
  }

  // Calculate shrink hint: if > 2 at_risk or missed in last 14 days
  let shrinkHint: StreakEngineResult['shrinkHint'] = undefined;
  const recentMisses = missEventsLast14Days.slice(-14);
  if (recentMisses.length > 2) {
    const habitFails: Record<string, number> = {};
    for (const m of recentMisses) {
      if (m.failedHabits) {
        for (const h of m.failedHabits) {
          habitFails[h] = (habitFails[h] || 0) + 1;
        }
      }
    }

    let topHabit = '';
    let maxFails = 0;
    for (const [habit, count] of Object.entries(habitFails)) {
      if (count > maxFails) {
        maxFails = count;
        topHabit = habit;
      }
    }

    if (topHabit) {
      shrinkHint = { habitKey: topHabit, failCount: maxFails };
    }
  }

  const lastEvaluated = evaluatedDays[evaluatedDays.length - 1];

  return {
    currentStreak: lastEvaluated?.chain ?? chain,
    bestStreak,
    freezesBanked: lastEvaluated?.freezesBanked ?? freezesBanked,
    currentState: lastEvaluated?.state ?? 'open',
    evaluatedDays,
    shrinkHint,
  };
}

/**
 * Calculates whether the week was won per spec:
 * Week 1: kept_days >= 6
 * Week 2: score >= 0.70
 * Week 3+: score >= 0.85
 */
export function calculateWeekWin(
  cycleWeek: number,
  keptDays: number,
  score: number
): boolean {
  if (cycleWeek <= 1) {
    return keptDays >= 6;
  }
  if (cycleWeek === 2) {
    return score >= 0.70;
  }
  return score >= 0.85;
}

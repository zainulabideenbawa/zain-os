import { describe, it, expect } from 'vitest';
import {
  evaluateStreak,
  checkDayMinimums,
  calculateWeekWin,
  getMinimumsProgress,
} from '@/lib/streak';

describe('lib/streak.ts - Pure Streak Engine', () => {
  it('1. kept chain growth: increments chain consecutively for kept days', () => {
    const days = [
      { date: '2026-09-28', minimumsDone: true },
      { date: '2026-09-29', minimumsDone: true },
      { date: '2026-09-30', minimumsDone: true },
    ];

    const result = evaluateStreak(days);
    expect(result.currentStreak).toBe(3);
    expect(result.bestStreak).toBe(3);
    expect(result.currentState).toBe('kept');
    expect(result.evaluatedDays.map((d) => d.chain)).toEqual([1, 2, 3]);
  });

  it('2. single miss -> at_risk: preserves chain without reset', () => {
    const days = [
      { date: '2026-09-28', minimumsDone: true },
      { date: '2026-09-29', minimumsDone: true },
      { date: '2026-09-30', minimumsDone: false }, // miss
    ];

    const result = evaluateStreak(days);
    expect(result.currentState).toBe('at_risk');
    expect(result.currentStreak).toBe(2); // chain preserved!
    expect(result.bestStreak).toBe(2);
  });

  it('3. a miss then kept -> comeback: chain continues and increments (+1)', () => {
    const days = [
      { date: '2026-09-28', minimumsDone: true }, // chain 1 (kept)
      { date: '2026-09-29', minimumsDone: true }, // chain 2 (kept)
      { date: '2026-09-30', minimumsDone: false }, // chain 2 (at_risk)
      { date: '2026-10-01', minimumsDone: true }, // chain 3 (comeback)
    ];

    const result = evaluateStreak(days);
    expect(result.currentState).toBe('comeback');
    expect(result.currentStreak).toBe(3);
    expect(result.bestStreak).toBe(3);
    expect(result.evaluatedDays[3].state).toBe('comeback');
  });

  it('4. two misses -> reset: chain resets to 0 with best kept', () => {
    const days = [
      { date: '2026-09-28', minimumsDone: true }, // chain 1
      { date: '2026-09-29', minimumsDone: true }, // chain 2
      { date: '2026-09-30', minimumsDone: false }, // chain 2, at_risk
      { date: '2026-10-01', minimumsDone: false }, // chain 0, missed
    ];

    const result = evaluateStreak(days);
    expect(result.currentState).toBe('missed');
    expect(result.currentStreak).toBe(0);
    expect(result.bestStreak).toBe(2); // best is preserved
  });

  it('5. freeze earned at 7 kept days and auto-used on a miss', () => {
    // 7 kept days
    const days = [
      { date: '2026-09-21', minimumsDone: true },
      { date: '2026-09-22', minimumsDone: true },
      { date: '2026-09-23', minimumsDone: true },
      { date: '2026-09-24', minimumsDone: true },
      { date: '2026-09-25', minimumsDone: true },
      { date: '2026-09-26', minimumsDone: true },
      { date: '2026-09-27', minimumsDone: true }, // day 7: earns freeze!
      { date: '2026-09-28', minimumsDone: false }, // miss: auto-uses freeze!
    ];

    const result = evaluateStreak(days);
    // At day 7, freezesBanked was 1. At day 8, freeze is used -> freezesBanked becomes 0
    expect(result.evaluatedDays[6].freezesBanked).toBe(1);
    expect(result.evaluatedDays[7].state).toBe('frozen');
    expect(result.evaluatedDays[7].freezesBanked).toBe(0);
    expect(result.currentStreak).toBe(7); // chain maintained
    expect(result.currentState).toBe('frozen');
  });

  it('6. freeze bank maximum capped at 2', () => {
    // 21 kept days: could earn 3 freezes, but capped at 2
    const days = Array.from({ length: 21 }, (_, i) => ({
      date: `2026-09-${String(i + 1).padStart(2, '0')}`,
      minimumsDone: true,
    }));

    const result = evaluateStreak(days);
    expect(result.freezesBanked).toBe(2); // capped at bank max 2
    expect(result.currentStreak).toBe(21);
  });

  it('7. Saturday: arabic_class satisfies both big_rock and arabic', () => {
    // 2026-10-03 is a Saturday (weekday 6)
    const completedWithoutClass = [
      'salah_fajr',
      'salah_dhuhr',
      'salah_asr',
      'salah_maghrib',
      'salah_isha',
      'quran',
      'move',
      'muhasaba',
      // missing big_rock and arabic
    ];
    expect(checkDayMinimums('2026-10-03', completedWithoutClass)).toBe(false);

    // With arabic_class
    const completedWithClass = [...completedWithoutClass, 'arabic_class'];
    expect(checkDayMinimums('2026-10-03', completedWithClass)).toBe(true);
  });

  it('8. Sunday: weekly_review satisfies big_rock', () => {
    // 2026-10-04 is a Sunday (weekday 0)
    const completedWithoutReview = [
      'salah_fajr',
      'salah_dhuhr',
      'salah_asr',
      'salah_maghrib',
      'salah_isha',
      'quran',
      'move',
      'arabic',
      'muhasaba',
      // missing big_rock
    ];
    expect(checkDayMinimums('2026-10-04', completedWithoutReview)).toBe(false);

    // With weekly_review
    const completedWithReview = [...completedWithoutReview, 'weekly_review'];
    expect(checkDayMinimums('2026-10-04', completedWithReview)).toBe(true);
  });

  it('9. milestone crossings at 3, 7, 14, 21, 40, 66', () => {
    const days = Array.from({ length: 66 }, (_, i) => ({
      date: `day-${i + 1}`,
      minimumsDone: true,
    }));

    const result = evaluateStreak(days);

    expect(result.evaluatedDays[2].milestoneReached).toBe(3);
    expect(result.evaluatedDays[6].milestoneReached).toBe(7);
    expect(result.evaluatedDays[13].milestoneReached).toBe(14);
    expect(result.evaluatedDays[20].milestoneReached).toBe(21);
    expect(result.evaluatedDays[39].milestoneReached).toBe(40);
    expect(result.evaluatedDays[65].milestoneReached).toBe(66);
  });

  it('10. week-win thresholds for weeks 1, 2, and 3+', () => {
    // Week 1: kept_days >= 6 (score does not matter)
    expect(calculateWeekWin(1, 6, 0.4)).toBe(true);
    expect(calculateWeekWin(1, 5, 0.9)).toBe(false);

    // Week 2: score >= 0.70
    expect(calculateWeekWin(2, 7, 0.70)).toBe(true);
    expect(calculateWeekWin(2, 7, 0.69)).toBe(false);

    // Week 3+: score >= 0.85
    expect(calculateWeekWin(3, 7, 0.85)).toBe(true);
    expect(calculateWeekWin(3, 7, 0.84)).toBe(false);
    expect(calculateWeekWin(10, 7, 0.90)).toBe(true);
  });

  it('11. getMinimumsProgress correctly computes doneCount out of 6 minimums', () => {
    // 2026-09-30 is Wednesday (weekday 3)
    const date = '2026-09-30';
    // 0 done
    expect(getMinimumsProgress(date, [])).toEqual({
      doneCount: 0,
      totalCount: 6,
      isKept: false,
    });

    // 4 done: fajr-isha (all 5 salah = 1), quran (= 2), move (= 3), arabic (= 4)
    const fourDone = [
      'salah_fajr',
      'salah_dhuhr',
      'salah_asr',
      'salah_maghrib',
      'salah_isha',
      'quran',
      'move',
      'arabic',
    ];
    expect(getMinimumsProgress(date, fourDone)).toEqual({
      doneCount: 4,
      totalCount: 6,
      isKept: false,
    });

    // All 6 done
    const allDone = [...fourDone, 'big_rock', 'muhasaba'];
    expect(getMinimumsProgress(date, allDone)).toEqual({
      doneCount: 6,
      totalCount: 6,
      isKept: true,
    });
  });
});


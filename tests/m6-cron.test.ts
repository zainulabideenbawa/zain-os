import { describe, it, expect } from 'vitest';
import { shouldSendAtDispatch, buildDailySchedule } from '@/lib/schedule';
import { evaluateStreak, type DayInputRecord } from '@/lib/streak';

describe('Milestone 6: Scheduler, Dispatch, and Day Close', () => {
  describe('Dispatch Send-Time Rules', () => {
    it('always sends prayer notifications regardless of conditions', () => {
      const res = shouldSendAtDispatch('prayer', {
        isFocusSessionRunning: true,
        isBadDayMode: true,
        isMuhasabaDone: true,
      });
      expect(res.shouldSend).toBe(true);
    });

    it('suppresses non-prayer notifications when a focus session is active', () => {
      const res = shouldSendAtDispatch('big_rock', {
        isFocusSessionRunning: true,
      });
      expect(res.shouldSend).toBe(false);
      expect(res.skipReason).toBe('focus_session_running');
    });

    it('skips big_rock_nudge during Bad Day mode', () => {
      const res = shouldSendAtDispatch('big_rock_nudge', {
        isBadDayMode: true,
      });
      expect(res.shouldSend).toBe(false);
      expect(res.skipReason).toBe('bad_day_mode');
    });

    it('skips evening muhasaba notification if muhasaba is already done', () => {
      const res = shouldSendAtDispatch('muhasaba', {
        isMuhasabaDone: true,
      });
      expect(res.shouldSend).toBe(false);
      expect(res.skipReason).toBe('muhasaba_already_done');
    });

    it('skips streak_risk notification if all minimums are already done', () => {
      const res = shouldSendAtDispatch('streak_risk', {
        isAnyMinimumNotDone: false,
      });
      expect(res.shouldSend).toBe(false);
      expect(res.skipReason).toBe('all_minimums_done');
    });
  });

  describe('Daily Schedule Generation', () => {
    it('generates non-duplicate dedupe keys and enforces the 8 non-prayer cap', () => {
      const schedule = buildDailySchedule({
        logicalDate: '2026-09-30',
        streak: 5,
        bigRockFirstAction: 'Finish PayClock onboarding',
        isTahajjudNightNextMorning: true,
        yesterdayWasAtRisk: false,
      });

      const dedupeKeys = schedule.map((n) => n.dedupeKey);
      const uniqueKeys = new Set(dedupeKeys);
      expect(dedupeKeys.length).toBe(uniqueKeys.size);

      const nonPrayer = schedule.filter((n) => n.kind !== 'prayer');
      expect(nonPrayer.length).toBeLessThanOrEqual(8);
    });
  });

  describe('Day Close Streak Evaluation', () => {
    it('reconciles days correctly: bank freeze covers miss, or day enters at_risk', () => {
      const records: DayInputRecord[] = [
        { date: '2026-09-28', minimumsDone: true },
        { date: '2026-09-29', minimumsDone: false },
      ];

      // With 0 banked freezes: 1st miss enters at_risk
      const resAtRisk = evaluateStreak(records, { freezeBankMax: 2 });
      expect(resAtRisk.evaluatedDays[1].state).toBe('at_risk');
      expect(resAtRisk.currentStreak).toBe(1); // chain not broken yet

      // With 7 prior kept days: user earned a freeze, so 1st miss is covered as 'frozen'
      const sevenKept: DayInputRecord[] = [
        { date: '2026-09-21', minimumsDone: true },
        { date: '2026-09-22', minimumsDone: true },
        { date: '2026-09-23', minimumsDone: true },
        { date: '2026-09-24', minimumsDone: true },
        { date: '2026-09-25', minimumsDone: true },
        { date: '2026-09-26', minimumsDone: true },
        { date: '2026-09-27', minimumsDone: true },
        { date: '2026-09-28', minimumsDone: false },
      ];
      const resFrozen = evaluateStreak(sevenKept, { freezeEvery: 7, freezeBankMax: 2 });
      expect(resFrozen.evaluatedDays[7].state).toBe('frozen');
      expect(resFrozen.currentStreak).toBe(7);
      expect(resFrozen.freezesBanked).toBe(0); // 1 earned and consumed
    });
  });
});

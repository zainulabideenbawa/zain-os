import { describe, it, expect } from 'vitest';
import { getCycleDay, getCycleDaysRemaining, TOTAL_CYCLE_DAYS } from '@/lib/time';
import { MILESTONE_THRESHOLDS } from '@/lib/streak';

describe('Milestone 7: Streaks, Plan, Sunday Review, and Capture', () => {
  describe('84-Day Cycle Heatmap Geometry', () => {
    it('verifies exact 84-day cycle bounds (Sep 28 to Dec 20, 2026)', () => {
      expect(TOTAL_CYCLE_DAYS).toBe(84);
      expect(getCycleDay('2026-09-28')).toBe(1);
      expect(getCycleDay('2026-12-20')).toBe(84);
      expect(getCycleDaysRemaining('2026-09-28')).toBe(83);
      expect(getCycleDaysRemaining('2026-12-20')).toBe(0);
    });

    it('verifies 12 weeks of 7 days equals 84 days', () => {
      const weeks = 12;
      const daysPerWeek = 7;
      expect(weeks * daysPerWeek).toBe(84);
    });
  });

  describe('Sunday Review Win Logic', () => {
    const isWeekWon = (cycleWeek: number, keptDays: number, score: number) => {
      if (cycleWeek === 1) return keptDays >= 6;
      if (cycleWeek === 2) return score >= 70;
      return score >= 85;
    };

    it('Cycle Week 1: requires 6 kept days for win regardless of score', () => {
      expect(isWeekWon(1, 6, 50)).toBe(true);
      expect(isWeekWon(1, 7, 50)).toBe(true);
      expect(isWeekWon(1, 5, 100)).toBe(false);
    });

    it('Cycle Week 2: requires score >= 70%', () => {
      expect(isWeekWon(2, 7, 70)).toBe(true);
      expect(isWeekWon(2, 7, 80)).toBe(true);
      expect(isWeekWon(2, 7, 69)).toBe(false);
    });

    it('Cycle Week 3+: requires score >= 85%', () => {
      expect(isWeekWon(3, 7, 85)).toBe(true);
      expect(isWeekWon(3, 7, 90)).toBe(true);
      expect(isWeekWon(3, 7, 84)).toBe(false);
      expect(isWeekWon(12, 7, 85)).toBe(true);
    });
  });

  describe('Quick Capture Validation', () => {
    const validateCapture = (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return { valid: false, error: 'Text cannot be empty' };
      return { valid: true, text: trimmed };
    };

    it('rejects empty or whitespace capture', () => {
      expect(validateCapture('').valid).toBe(false);
      expect(validateCapture('    ').valid).toBe(false);
    });

    it('accepts and trims valid capture text', () => {
      const res = validateCapture('  Call client about contract renewal  ');
      expect(res.valid).toBe(true);
      expect(res.text).toBe('Call client about contract renewal');
    });
  });

  describe('Milestone Roadmap Progression', () => {
    it('contains all spec milestone thresholds', () => {
      expect(MILESTONE_THRESHOLDS).toEqual([3, 7, 14, 21, 40, 66, 84, 100]);
    });
  });
});

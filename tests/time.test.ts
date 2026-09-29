import { describe, it, expect } from 'vitest';
import {
  getLogicalDate,
  getLogicalDayBounds,
  getCycleDay,
  getCycleWeek,
  getPhaseTier,
  formatKarachiTime,
  parseKarachiDateTime,
  createKarachiDate,
} from '@/lib/time';

describe('lib/time.ts - Pure Time Engine', () => {
  describe('Logical Day (03:00 PKT boundary)', () => {
    it('maps 02:59 PKT to previous calendar date', () => {
      // 2026-09-29 02:59 PKT = 2026-09-28 21:59 UTC
      const date = createKarachiDate(2026, 9, 29, 2, 59, 0);
      expect(getLogicalDate(date)).toBe('2026-09-28');
    });

    it('maps exactly 03:00 PKT to current calendar date', () => {
      // 2026-09-29 03:00 PKT = 2026-09-28 22:00 UTC
      const date = createKarachiDate(2026, 9, 29, 3, 0, 0);
      expect(getLogicalDate(date)).toBe('2026-09-29');
    });

    it('maps 23:59 PKT to current calendar date', () => {
      const date = createKarachiDate(2026, 9, 29, 23, 59, 0);
      expect(getLogicalDate(date)).toBe('2026-09-29');
    });

    it('maps 00:05 PKT to previous calendar date', () => {
      const date = createKarachiDate(2026, 9, 29, 0, 5, 0);
      expect(getLogicalDate(date)).toBe('2026-09-28');
    });

    it('calculates correct start and end boundaries for logical day', () => {
      const { start, end } = getLogicalDayBounds('2026-09-28');
      // 2026-09-28 03:00 PKT = 2026-09-27 22:00 UTC
      expect(start.toISOString()).toBe('2026-09-27T22:00:00.000Z');
      // 2026-09-29 03:00 PKT = 2026-09-28 22:00 UTC
      expect(end.toISOString()).toBe('2026-09-28T22:00:00.000Z');
    });
  });

  describe('Cycle Day & Week Math', () => {
    it('calculates cycle day and week for day 1 (2026-09-28)', () => {
      expect(getCycleDay('2026-09-28')).toBe(1);
      expect(getCycleWeek('2026-09-28')).toBe(1);
    });

    it('calculates cycle day 7 for Sunday (2026-10-04)', () => {
      expect(getCycleDay('2026-10-04')).toBe(7);
      expect(getCycleWeek('2026-10-04')).toBe(1);
    });

    it('calculates cycle day 8 for Week 2 start (2026-10-05)', () => {
      expect(getCycleDay('2026-10-05')).toBe(8);
      expect(getCycleWeek('2026-10-05')).toBe(2);
    });

    it('calculates final day 84 for Week 12 end (2026-12-20)', () => {
      expect(getCycleDay('2026-12-20')).toBe(84);
      expect(getCycleWeek('2026-12-20')).toBe(12);
    });
  });

  describe('Phase-in Tier Rules', () => {
    it('maps week 1 to tier 1 (minimums only)', () => {
      expect(getPhaseTier(1)).toBe(1);
    });

    it('maps week 2 to tier 2 (+ Big Rock target)', () => {
      expect(getPhaseTier(2)).toBe(2);
    });

    it('maps weeks 3 and 4 to tier 3 (all targets)', () => {
      expect(getPhaseTier(3)).toBe(3);
      expect(getPhaseTier(4)).toBe(3);
    });

    it('maps weeks 5-12 to tier 4 (full system)', () => {
      expect(getPhaseTier(5)).toBe(4);
      expect(getPhaseTier(12)).toBe(4);
    });
  });

  describe('Time formatting and parsing', () => {
    it('formats and parses Karachi time string HH:mm accurately', () => {
      const parsed = parseKarachiDateTime('2026-09-28', '07:30');
      expect(formatKarachiTime(parsed)).toBe('07:30');
    });
  });
});

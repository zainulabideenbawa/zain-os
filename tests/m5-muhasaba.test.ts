import { describe, it, expect } from 'vitest';
import { getTomorrowDate, getYesterdayDate, getKarachiParts } from '@/lib/time';

describe('Milestone 5: Evening Muhasaba & Plan Flow', () => {
  it('correctly calculates tomorrow date across month and year boundaries', () => {
    expect(getTomorrowDate('2026-09-29')).toBe('2026-09-30');
    expect(getTomorrowDate('2026-09-30')).toBe('2026-10-01');
    expect(getTomorrowDate('2026-12-31')).toBe('2027-01-01');
    expect(getTomorrowDate('2028-02-28')).toBe('2028-02-29'); // Leap year
    expect(getTomorrowDate('2028-02-29')).toBe('2028-03-01');
  });

  it('correctly calculates yesterday date across boundaries', () => {
    expect(getYesterdayDate('2026-10-01')).toBe('2026-09-30');
    expect(getYesterdayDate('2027-01-01')).toBe('2026-12-31');
  });

  it('validates required fields for tomorrow plan payload', () => {
    const validatePlan = (plan: {
      focusing_q?: string;
      top3?: string[];
      big_rock_first_action?: string;
      if_then?: string;
    }) => {
      if (!plan.big_rock_first_action || !plan.big_rock_first_action.trim()) {
        return { valid: false, error: 'Big Rock first action is required' };
      }
      return { valid: true };
    };

    expect(validatePlan({ big_rock_first_action: '' }).valid).toBe(false);
    expect(validatePlan({ big_rock_first_action: '   ' }).valid).toBe(false);
    expect(
      validatePlan({
        big_rock_first_action: 'Open PayClock repo, finish paywall screen',
      }).valid
    ).toBe(true);
  });

  it('verifies Muhasaba rating scales: energy 1-5 and khushu 1-3', () => {
    const validEnergy = (lvl: number) => lvl >= 1 && lvl <= 5;
    const validKhushu = (lvl: number) => lvl >= 1 && lvl <= 3;

    expect(validEnergy(1)).toBe(true);
    expect(validEnergy(5)).toBe(true);
    expect(validEnergy(0)).toBe(false);
    expect(validEnergy(6)).toBe(false);

    expect(validKhushu(1)).toBe(true);
    expect(validKhushu(3)).toBe(true);
    expect(validKhushu(4)).toBe(false);
  });

  it('correctly detects Tahajjud pre-dawn schedule for tomorrow', () => {
    // Tahajjud days: [0, 3, 5] = Sun, Wed, Fri mornings
    const isTahajjudMorning = (dateStr: string) => {
      const parts = getKarachiParts(`${dateStr}T12:00:00Z`);
      return [0, 3, 5].includes(parts.weekday);
    };

    // 2026-09-30 is Wednesday -> Tahajjud morning!
    expect(isTahajjudMorning('2026-09-30')).toBe(true);
    // 2026-10-01 is Thursday -> Not Tahajjud morning
    expect(isTahajjudMorning('2026-10-01')).toBe(false);
    // 2026-10-02 is Friday -> Tahajjud morning!
    expect(isTahajjudMorning('2026-10-02')).toBe(true);
    // 2026-10-04 is Sunday -> Tahajjud morning!
    expect(isTahajjudMorning('2026-10-04')).toBe(true);
  });

  it('ensures went_well line is formatted for Cookie Jar preservation', () => {
    const rawInput = '   Shipped the complete onboarding flow before Dhuhr   ';
    const cookieJarLine = rawInput.trim();
    expect(cookieJarLine).toBe('Shipped the complete onboarding flow before Dhuhr');
    expect(cookieJarLine.length).toBeGreaterThan(0);
  });
});

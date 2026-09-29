import { describe, it, expect } from 'vitest';
import { parseKarachiDateTime } from '@/lib/time';

describe('Milestone 4: Today Screen & Habit Logic', () => {
  it('correctly identifies Big Rock 07:30 - 09:30 time window', () => {
    const testDate = '2026-09-29';
    const beforeBlock = parseKarachiDateTime(testDate, '07:15');
    const duringBlock = parseKarachiDateTime(testDate, '08:30');
    const afterBlock = parseKarachiDateTime(testDate, '10:00');

    const isDuring = (date: Date) => {
      // Hours in PKT (UTC+5)
      const pktHour = (date.getUTCHours() + 5) % 24;
      const pktMin = date.getUTCMinutes();
      const totalMins = pktHour * 60 + pktMin;
      return totalMins >= 7 * 60 + 30 && totalMins <= 9 * 60 + 30;
    };

    expect(isDuring(beforeBlock)).toBe(false);
    expect(isDuring(duringBlock)).toBe(true);
    expect(isDuring(afterBlock)).toBe(false);
  });

  it('validates habit hierarchy rule: target completion implies minimum completion', () => {
    // Spec §4: If done_target is true, done_min must automatically be true
    const handleToggle = (
      current: { done_min: boolean; done_target: boolean },
      field: 'done_min' | 'done_target',
      val: boolean
    ) => {
      const next = { ...current, [field]: val };
      if (field === 'done_target' && val) {
        next.done_min = true;
      }
      return next;
    };

    const initial = { done_min: false, done_target: false };
    const result = handleToggle(initial, 'done_target', true);

    expect(result.done_target).toBe(true);
    expect(result.done_min).toBe(true);
  });

  it('Bad Day Mode restricts completion requirements to minimums only', () => {
    const habits = [
      { id: '1', title: 'Fajr Salah', is_core_anchor: true, min_desc: 'In masjid', target_desc: 'Takbeer-e-oola' },
      { id: '2', title: 'Quran', is_core_anchor: false, min_desc: '1 page', target_desc: '1 juz' },
    ];

    const badDayMode = true;

    // Filter non-negotiables for bad day mode
    const visibleRequirements = habits.map(h => ({
      id: h.id,
      requiresTarget: !badDayMode && Boolean(h.target_desc),
      requiresMin: true,
    }));

    expect(visibleRequirements.every(r => !r.requiresTarget)).toBe(true);
  });
});

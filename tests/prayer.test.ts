import { describe, it, expect } from 'vitest';
import { calculatePrayerTimes, getActiveOrNextPrayer } from '@/lib/prayer';
import { parseKarachiDateTime } from '@/lib/time';

describe('lib/prayer.ts - Prayer Times Engine', () => {
  it('passes sanity check for 2026-09-28 Karachi adhan times within ±2 min', () => {
    const result = calculatePrayerTimes('2026-09-28');
    const { fajr, dhuhr, asr, maghrib, isha } = result.prayers;

    // Helper to calculate difference in minutes
    function diffMinutes(actualStr: string, expectedStr: string): number {
      const [h1, m1] = actualStr.split(':').map(Number);
      const [h2, m2] = expectedStr.split(':').map(Number);
      return Math.abs(h1 * 60 + m1 - (h2 * 60 + m2));
    }

    // Spec §M2 sanity checks:
    // Fajr: 05:07, Dhuhr: 12:24, Asr: 16:42, Maghrib: 18:22, Isha: 19:38 (±2 min)
    expect(diffMinutes(fajr.azanStr, '05:07')).toBeLessThanOrEqual(2);
    expect(diffMinutes(dhuhr.azanStr, '12:24')).toBeLessThanOrEqual(2);
    expect(diffMinutes(asr.azanStr, '16:42')).toBeLessThanOrEqual(2);
    expect(diffMinutes(maghrib.azanStr, '18:22')).toBeLessThanOrEqual(2);
    expect(diffMinutes(isha.azanStr, '19:38')).toBeLessThanOrEqual(2);
  });

  it('calculates jamaat times with offsets and fixed settings accurately', () => {
    const result = calculatePrayerTimes('2026-09-28', {
      fajr: { offset: 23 },
      dhuhr: { fixed: '13:15' },
      asr: { offset: 18 },
      maghrib: { offset: 3 },
      isha: { offset: 37 },
    });

    const { fajr, dhuhr, asr, maghrib, isha } = result.prayers;

    // Fixed Dhuhr at 13:15
    expect(dhuhr.jamaatStr).toBe('13:15');

    // Fajr offset 23 min
    const fajrDiff = Math.round(
      (fajr.jamaat.getTime() - fajr.azan.getTime()) / 60000
    );
    expect(fajrDiff).toBe(23);

    // Asr offset 18 min
    const asrDiff = Math.round(
      (asr.jamaat.getTime() - asr.azan.getTime()) / 60000
    );
    expect(asrDiff).toBe(18);

    // Maghrib offset 3 min
    const maghribDiff = Math.round(
      (maghrib.jamaat.getTime() - maghrib.azan.getTime()) / 60000
    );
    expect(maghribDiff).toBe(3);

    // Isha offset 37 min
    const ishaDiff = Math.round(
      (isha.jamaat.getTime() - isha.azan.getTime()) / 60000
    );
    expect(ishaDiff).toBe(37);
  });

  it('determines the active and next upcoming prayer slot correctly', () => {
    const result = calculatePrayerTimes('2026-09-28');

    // At 10:00 (after Fajr jamaat, before Dhuhr jamaat)
    const morningNow = parseKarachiDateTime('2026-09-28', '10:00');
    const status1 = getActiveOrNextPrayer(morningNow, result);
    expect(status1.currentSlot?.name).toBe('fajr');
    expect(status1.nextSlot.name).toBe('dhuhr');

    // At 16:00 (after Dhuhr jamaat, before Asr jamaat)
    const afternoonNow = parseKarachiDateTime('2026-09-28', '16:00');
    const status2 = getActiveOrNextPrayer(afternoonNow, result);
    expect(status2.currentSlot?.name).toBe('dhuhr');
    expect(status2.nextSlot.name).toBe('asr');
  });
});

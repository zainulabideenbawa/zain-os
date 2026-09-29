import { describe, it, expect } from 'vitest';
import {
  buildDailySchedule,
  shouldSendAtDispatch,
} from '@/lib/schedule';
import { formatKarachiTime } from '@/lib/time';

describe('lib/schedule.ts - Pure Schedule Engine', () => {
  it('1. generates exactly 5 prayer rows at jamaat - 15 min', () => {
    // 2026-09-28 (Monday)
    const schedule = buildDailySchedule({
      logicalDate: '2026-09-28',
      streak: 12,
    });

    const prayerRows = schedule.filter((r) => r.kind === 'prayer');
    expect(prayerRows.length).toBe(5);

    // Each prayer row should be 15 minutes before its jamaat
    prayerRows.forEach((row) => {
      expect(row.title).toContain('jamaat in 15 min');
      expect(row.body).toContain('🔥 12');
    });
  });

  it('2. tahajjud_eve scheduled only on evenings before Tahajjud night (Sat, Tue, Thu)', () => {
    // Tuesday evening (isTahajjudNightNextMorning = true)
    const tuesdaySchedule = buildDailySchedule({
      logicalDate: '2026-09-29', // Tuesday
      streak: 12,
      isTahajjudNightNextMorning: true,
    });
    const eveRow = tuesdaySchedule.find((r) => r.kind === 'tahajjud_eve');
    expect(eveRow).toBeDefined();
    expect(formatKarachiTime(eveRow!.sendAt)).toBe('21:30');

    // Monday evening (isTahajjudNightNextMorning = false)
    const mondaySchedule = buildDailySchedule({
      logicalDate: '2026-09-28',
      streak: 12,
      isTahajjudNightNextMorning: false,
    });
    expect(mondaySchedule.find((r) => r.kind === 'tahajjud_eve')).toBeUndefined();
  });

  it('3. big_rock scheduled at 07:30 on Mon-Fri only', () => {
    // Monday (2026-09-28)
    const mondaySchedule = buildDailySchedule({
      logicalDate: '2026-09-28',
      streak: 12,
      bigRockFirstAction: 'Implement M2 tests',
    });
    const mondayBigRock = mondaySchedule.find((r) => r.kind === 'big_rock');
    expect(mondayBigRock).toBeDefined();
    expect(formatKarachiTime(mondayBigRock!.sendAt)).toBe('07:30');
    expect(mondayBigRock!.body).toContain('Implement M2 tests');

    // Sunday (2026-10-04)
    const sundaySchedule = buildDailySchedule({
      logicalDate: '2026-10-04',
      streak: 12,
    });
    expect(sundaySchedule.find((r) => r.kind === 'big_rock')).toBeUndefined();

    // Saturday (2026-10-03)
    const saturdaySchedule = buildDailySchedule({
      logicalDate: '2026-10-03',
      streak: 12,
    });
    expect(saturdaySchedule.find((r) => r.kind === 'big_rock')).toBeUndefined();
  });

  it('4. send-time condition verification suppresses nudge during focus session or Bad Day Mode', () => {
    // Normal conditions: nudge is sent
    const normal = shouldSendAtDispatch('big_rock_nudge', {
      isFocusSessionRunning: false,
      isBadDayMode: false,
    });
    expect(normal.shouldSend).toBe(true);

    // Suppressed when focus session is running
    const duringFocus = shouldSendAtDispatch('big_rock_nudge', {
      isFocusSessionRunning: true,
      isBadDayMode: false,
    });
    expect(duringFocus.shouldSend).toBe(false);
    expect(duringFocus.skipReason).toBe('focus_session_running');

    // Suppressed in Bad Day Mode
    const duringBadDay = shouldSendAtDispatch('big_rock_nudge', {
      isFocusSessionRunning: false,
      isBadDayMode: true,
    });
    expect(duringBadDay.shouldSend).toBe(false);
    expect(duringBadDay.skipReason).toBe('bad_day_mode');

    // Prayer notifications are NEVER suppressed even during focus sessions
    const prayerCheck = shouldSendAtDispatch('prayer', {
      isFocusSessionRunning: true,
      isBadDayMode: true,
    });
    expect(prayerCheck.shouldSend).toBe(true);
  });

  it('5. nothing is scheduled after 21:45 except tahajjud_eve', () => {
    const schedule = buildDailySchedule({
      logicalDate: '2026-09-29',
      streak: 12,
      isTahajjudNightNextMorning: true,
    });

    schedule.forEach((item) => {
      const timeStr = formatKarachiTime(item.sendAt);
      const [h, m] = timeStr.split(':').map(Number);
      const totalMinutes = h * 60 + m;
      const cutoffMinutes = 21 * 60 + 45; // 21:45

      if (item.kind !== 'tahajjud_eve') {
        expect(totalMinutes).toBeLessThanOrEqual(cutoffMinutes);
      }
    });
  });

  it('6. enforces maximum 8 non-prayer rows per day', () => {
    // Generate schedule with all possible non-prayer conditions active
    const schedule = buildDailySchedule({
      logicalDate: '2026-09-28',
      streak: 12,
      yesterdayWasAtRisk: true,
      isTahajjudNightNextMorning: true,
    });

    const nonPrayerRows = schedule.filter((r) => r.kind !== 'prayer');
    expect(nonPrayerRows.length).toBeLessThanOrEqual(8);
  });

  it('7. every notification row has a unique dedupe key', () => {
    const schedule = buildDailySchedule({
      logicalDate: '2026-09-28',
      streak: 12,
      yesterdayWasAtRisk: true,
      isTahajjudNightNextMorning: true,
    });

    const dedupeKeys = schedule.map((r) => r.dedupeKey);
    const uniqueKeys = new Set(dedupeKeys);
    expect(dedupeKeys.length).toBe(uniqueKeys.size);

    dedupeKeys.forEach((key) => {
      expect(key).toContain('2026-09-28');
    });
  });
});

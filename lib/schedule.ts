/**
 * Pure Schedule Engine for Zain OS Notifications
 * Implements Spec Section 6: daily notification queue generation,
 * conditional checks, and deduplication keys.
 */

import { calculatePrayerTimes, type DayPrayerTimes, type JamaatSettings } from './prayer';
import { parseKarachiDateTime } from './time';

export interface PlannedNotification {
  kind: string;
  sendAt: Date;
  title: string;
  body: string;
  url: string;
  dedupeKey: string;
  conditionName?: string;
}

export interface DayScheduleInput {
  logicalDate: string; // YYYY-MM-DD
  streak: number;
  bigRockFirstAction?: string;
  isTahajjudNightNextMorning?: boolean; // Sat, Tue, Thu evenings
  yesterdayWasAtRisk?: boolean;
  jamaatSettings?: Partial<JamaatSettings>;
  notifPrefs?: Record<string, boolean>;
}

export interface SendTimeConditions {
  isFocusSessionRunning?: boolean;
  isBadDayMode?: boolean;
  isMuhasabaDone?: boolean;
  isAnyMinimumNotDone?: boolean;
  isReviewSaved?: boolean;
}

/**
 * Pure function that generates all planned notifications for a given logical date.
 */
export function buildDailySchedule(input: DayScheduleInput): PlannedNotification[] {
  const {
    logicalDate,
    streak,
    bigRockFirstAction = 'Deep work on WIG',
    isTahajjudNightNextMorning = false,
    yesterdayWasAtRisk = false,
    jamaatSettings = {},
    notifPrefs = {},
  } = input;

  const [y, m, d] = logicalDate.split('-').map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0 = Sun, 6 = Sat

  const prayers: DayPrayerTimes = calculatePrayerTimes(logicalDate, jamaatSettings);
  const result: PlannedNotification[] = [];

  const isEnabled = (key: string) => notifPrefs[key] !== false;

  // 1. Five Prayer notifications (jamaat - 15 min) - ALWAYS created & never dropped
  if (isEnabled('prayer')) {
    const prayerDetails = [
      { name: 'fajr', label: 'Fajr', slot: prayers.prayers.fajr, nextAction: 'Qur\'an + move' },
      { name: 'dhuhr', label: 'Dhuhr', slot: prayers.prayers.dhuhr, nextAction: 'Lunch & qailulah' },
      { name: 'asr', label: 'Asr', slot: prayers.prayers.asr, nextAction: 'Arabic 10 min' },
      { name: 'maghrib', label: 'Maghrib', slot: prayers.prayers.maghrib, nextAction: 'Family dinner' },
      { name: 'isha', label: 'Isha', slot: prayers.prayers.isha, nextAction: 'Muhasaba 5 min' },
    ];

    for (const p of prayerDetails) {
      const sendAt = new Date(p.slot.jamaat.getTime() - 15 * 60 * 1000);
      result.push({
        kind: 'prayer',
        sendAt,
        title: `${p.label} jamaat in 15 min`,
        body: `${p.label} jamaat in 15 · after: ${p.nextAction} · 🔥 ${streak}`,
        url: `/today?checkpoint=${p.name}`,
        dedupeKey: `prayer:${p.name}:${logicalDate}`,
      });
    }
  }

  const nonPrayerRows: PlannedNotification[] = [];

  // 2. Comeback notification (07:10) if yesterday was at_risk
  if (yesterdayWasAtRisk && isEnabled('comeback')) {
    nonPrayerRows.push({
      kind: 'comeback',
      sendAt: parseKarachiDateTime(logicalDate, '07:10'),
      title: 'Good. Comeback day',
      body: 'Good. Comeback day — keep today and the streak is restored.',
      url: '/today',
      dedupeKey: `comeback:${logicalDate}`,
    });
  }

  // 3. Big Rock (07:30 Mon-Fri)
  if (weekday >= 1 && weekday <= 5 && isEnabled('big_rock')) {
    nonPrayerRows.push({
      kind: 'big_rock',
      sendAt: parseKarachiDateTime(logicalDate, '07:30'),
      title: 'Big Rock: 5-4-3-2-1 → Start',
      body: `Big Rock: ${bigRockFirstAction}. 5-4-3-2-1 → Start`,
      url: '/today?focus=start',
      dedupeKey: `big_rock:${logicalDate}`,
    });
  }

  // 4. Big Rock Nudge (07:45 Mon-Fri) - Condition: no focus running & not bad day mode
  if (weekday >= 1 && weekday <= 5 && isEnabled('big_rock_nudge')) {
    nonPrayerRows.push({
      kind: 'big_rock_nudge',
      sendAt: parseKarachiDateTime(logicalDate, '07:45'),
      title: 'Big Rock hasn\'t started',
      body: 'Big Rock hasn\'t started. Just 5 minutes?',
      url: '/today?focus=start',
      dedupeKey: `big_rock_nudge:${logicalDate}`,
      conditionName: 'big_rock_not_running',
    });
  }

  // 5. Weekly Review (Sun 09:00)
  if (weekday === 0 && isEnabled('weekly_review')) {
    nonPrayerRows.push({
      kind: 'weekly_review',
      sendAt: parseKarachiDateTime(logicalDate, '09:00'),
      title: 'Weekly review ready',
      body: 'Weekly review ready',
      url: '/plan?review=open',
      dedupeKey: `weekly_review:${logicalDate}`,
      conditionName: 'review_not_saved',
    });
  }

  // 6. Muhasaba (Isha jamaat + 25 min) - Condition: muhasaba not done
  if (isEnabled('muhasaba')) {
    const ishaJamaat = prayers.prayers.isha.jamaat;
    const sendAt = new Date(ishaJamaat.getTime() + 25 * 60 * 1000);

    nonPrayerRows.push({
      kind: 'muhasaba',
      sendAt,
      title: 'Muhasaba + plan',
      body: `Muhasaba + plan — 5 min · 🔥 ${streak} on the line`,
      url: '/today?sheet=muhasaba',
      dedupeKey: `muhasaba:${logicalDate}`,
      conditionName: 'muhasaba_not_done',
    });
  }

  // 7. Tahajjud Eve (21:30 on Sat, Tue, Thu)
  if (isTahajjudNightNextMorning && isEnabled('tahajjud_eve')) {
    nonPrayerRows.push({
      kind: 'tahajjud_eve',
      sendAt: parseKarachiDateTime(logicalDate, '21:30'),
      title: 'Tahajjud tonight',
      body: 'Tahajjud tonight — in bed now',
      url: '/today',
      dedupeKey: `tahajjud_eve:${logicalDate}`,
    });
  }

  // 8. Streak Risk (21:45) - Condition: any minimum not done
  if (isEnabled('streak_risk')) {
    nonPrayerRows.push({
      kind: 'streak_risk',
      sendAt: parseKarachiDateTime(logicalDate, '21:45'),
      title: 'Streak at risk',
      body: 'Streak at risk. 3 minutes saves it.',
      url: '/today?sheet=muhasaba',
      dedupeKey: `streak_risk:${logicalDate}`,
      conditionName: 'minimums_not_done',
    });
  }

  // Enforce Spec Constraint: Max 8 non-prayer notifications per day
  const cappedNonPrayer = nonPrayerRows.slice(0, 8);

  // Enforce Spec Constraint: Nothing sent after 21:45 except tahajjud_eve
  const cutoffTime = parseKarachiDateTime(logicalDate, '21:45').getTime();
  const validNonPrayer = cappedNonPrayer.filter((item) => {
    if (item.kind === 'tahajjud_eve') return true;
    return item.sendAt.getTime() <= cutoffTime;
  });

  return [...result, ...validNonPrayer].sort(
    (a, b) => a.sendAt.getTime() - b.sendAt.getTime()
  );
}

/**
 * Evaluates whether a conditional notification should be sent or skipped at send-time.
 */
export function shouldSendAtDispatch(
  kind: string,
  conditions: SendTimeConditions
): { shouldSend: boolean; skipReason?: string } {
  // Prayer notifications are NEVER suppressed
  if (kind === 'prayer') {
    return { shouldSend: true };
  }

  // Suppress all non-prayer notifications if a focus session is currently running
  if (conditions.isFocusSessionRunning) {
    return {
      shouldSend: false,
      skipReason: 'focus_session_running',
    };
  }

  if (kind === 'big_rock_nudge') {
    if (conditions.isBadDayMode) {
      return { shouldSend: false, skipReason: 'bad_day_mode' };
    }
  }

  if (kind === 'muhasaba') {
    if (conditions.isMuhasabaDone) {
      return { shouldSend: false, skipReason: 'muhasaba_already_done' };
    }
  }

  if (kind === 'streak_risk') {
    if (!conditions.isAnyMinimumNotDone) {
      return { shouldSend: false, skipReason: 'all_minimums_done' };
    }
  }

  if (kind === 'weekly_review') {
    if (conditions.isReviewSaved) {
      return { shouldSend: false, skipReason: 'review_already_saved' };
    }
  }

  return { shouldSend: true };
}

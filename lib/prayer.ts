import { Coordinates, CalculationMethod, PrayerTimes, Madhab } from 'adhan';
import { formatKarachiTime, parseKarachiDateTime } from './time';

export const KARACHI_COORDINATES = new Coordinates(24.8607, 67.0011);

export interface JamaatRule {
  offset?: number; // minutes after azan
  fixed?: string; // fixed "HH:mm"
}

export type JamaatSettings = Record<
  'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha',
  JamaatRule
>;

export const DEFAULT_JAMAAT_SETTINGS: JamaatSettings = {
  fajr: { offset: 23 },
  dhuhr: { fixed: '13:15' },
  asr: { offset: 18 },
  maghrib: { offset: 3 },
  isha: { offset: 37 },
};

export interface PrayerSlot {
  name: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
  label: string;
  arabic: string;
  emoji: string;
  azan: Date;
  jamaat: Date;
  azanStr: string;
  jamaatStr: string;
}

export interface DayPrayerTimes {
  date: string; // YYYY-MM-DD
  prayers: Record<'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha', PrayerSlot>;
  list: PrayerSlot[];
}

/**
 * Calculates raw azan times and resolved jamaat times for a given date.
 * Coordinates: Karachi (24.8607, 67.0011)
 * Calculation method: Karachi
 * Asr madhab: Hanafi
 */
export function calculatePrayerTimes(
  dateInput: Date | string,
  jamaatSettings: Partial<JamaatSettings> = {},
  coords: Coordinates = KARACHI_COORDINATES
): DayPrayerTimes {
  let date: Date;
  let dateStr: string;

  if (typeof dateInput === 'string') {
    dateStr = dateInput;
    const [y, m, d] = dateInput.split('-').map(Number);
    // Use mid-day 12:00 UTC for adhan input date
    date = new Date(Date.UTC(y, m - 1, d, 7, 0, 0));
  } else {
    date = dateInput;
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    dateStr = `${y}-${m}-${d}`;
  }

  const params = CalculationMethod.Karachi();
  params.madhab = Madhab.Hanafi;

  const prayerTimes = new PrayerTimes(coords, date, params);
  const settings: JamaatSettings = { ...DEFAULT_JAMAAT_SETTINGS, ...jamaatSettings };

  function resolveSlot(
    name: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha',
    label: string,
    arabic: string,
    emoji: string,
    rawAzan: Date
  ): PrayerSlot {
    const azanStr = formatKarachiTime(rawAzan);
    const rule = settings[name] || {};

    let jamaatDate: Date;
    if (rule.fixed) {
      jamaatDate = parseKarachiDateTime(dateStr, rule.fixed);
    } else {
      const offsetMin = rule.offset ?? 0;
      jamaatDate = new Date(rawAzan.getTime() + offsetMin * 60 * 1000);
    }

    const jamaatStr = formatKarachiTime(jamaatDate);

    return {
      name,
      label,
      arabic,
      emoji,
      azan: rawAzan,
      jamaat: jamaatDate,
      azanStr,
      jamaatStr,
    };
  }

  function roundToNearestMinute(d: Date): Date {
    const ms = 1000 * 60;
    return new Date(Math.round(d.getTime() / ms) * ms);
  }

  const fajr = resolveSlot('fajr', 'Fajr', 'الفجر', '🌅', roundToNearestMinute(prayerTimes.fajr));
  const dhuhr = resolveSlot('dhuhr', 'Dhuhr', 'الظهر', '☀️', roundToNearestMinute(prayerTimes.dhuhr));
  const asr = resolveSlot('asr', 'Asr', 'العصر', '🌤', roundToNearestMinute(prayerTimes.asr));
  const maghrib = resolveSlot('maghrib', 'Maghrib', 'المغرب', '🌇', roundToNearestMinute(prayerTimes.maghrib));
  const isha = resolveSlot('isha', 'Isha', 'العشاء', '🌙', roundToNearestMinute(prayerTimes.isha));

  const prayers = { fajr, dhuhr, asr, maghrib, isha };
  const list = [fajr, dhuhr, asr, maghrib, isha];

  return { date: dateStr, prayers, list };
}

/**
 * Returns the currently active or next upcoming prayer slot relative to current time.
 */
export function getActiveOrNextPrayer(
  now: Date,
  dayPrayers: DayPrayerTimes
): {
  currentSlot: PrayerSlot | null;
  nextSlot: PrayerSlot;
  minutesToNextJamaat: number;
} {
  const nowMs = now.getTime();
  const slots = dayPrayers.list;

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    if (slot.jamaat.getTime() > nowMs) {
      const currentSlot = i > 0 ? slots[i - 1] : null;
      const minutesToNextJamaat = Math.max(
        0,
        Math.round((slot.jamaat.getTime() - nowMs) / 60000)
      );
      return { currentSlot, nextSlot: slot, minutesToNextJamaat };
    }
  }

  // All prayers for today have passed jamaat; next is tomorrow's Fajr
  return {
    currentSlot: slots[slots.length - 1],
    nextSlot: slots[0],
    minutesToNextJamaat: 0,
  };
}

/**
 * Convenient alias for calculatePrayerTimes
 */
export const getDayPrayerTimes = calculatePrayerTimes;

function addMinutesToHHmm(timeStr: string, minutes: number): string {
  const [h, m] = timeStr.split(':').map(Number);
  const totalM = h * 60 + m + minutes;
  const newH = Math.floor((totalM / 60) % 24);
  const newM = Math.floor(totalM % 60);
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

/**
 * Returns the human-readable routine / assigned time window for any habit.
 */
export function getHabitAssignedTime(
  habitKey: string,
  slot?: PrayerSlot | null
): string | null {
  switch (habitKey) {
    case 'tahajjud':
      return '04:45 – 05:05';
    case 'salah_fajr':
      return slot?.jamaatStr ? `Jamaat ${slot.jamaatStr}` : '05:30';
    case 'quran':
      return slot?.jamaatStr ? `~${addMinutesToHHmm(slot.jamaatStr, 20)}` : '06:00';
    case 'adhkar_morning':
      return slot?.jamaatStr ? `~${addMinutesToHHmm(slot.jamaatStr, 10)}` : 'Post-Fajr';
    case 'move':
      return '06:10 – 07:15';
    case 'arabic_class':
      return '09:00 – 11:00 (Sat)';
    case 'big_rock':
      return '07:30 – 09:30';
    case 'linkedin_post':
      return '09:30 – 10:00';
    case 'revenue_actions':
      return '09:30 – 11:30';
    case 'weekly_review':
      return '09:00 – 09:30 (Sun)';
    case 'salah_dhuhr':
      return slot?.jamaatStr ? `Jamaat ${slot.jamaatStr}` : '13:15';
    case 'salah_asr':
      return slot?.jamaatStr ? `Jamaat ${slot.jamaatStr}` : '16:45';
    case 'arabic':
      return slot?.jamaatStr ? `~${addMinutesToHHmm(slot.jamaatStr, 30)}` : '17:15';
    case 'salah_maghrib':
      return slot?.jamaatStr ? `Jamaat ${slot.jamaatStr}` : '18:20';
    case 'adhkar_evening':
      return 'At Maghrib';
    case 'family_dinner':
      return slot?.jamaatStr ? `~${addMinutesToHHmm(slot.jamaatStr, 40)}` : '19:00 – 20:00';
    case 'salah_isha':
      return slot?.jamaatStr ? `Jamaat ${slot.jamaatStr}` : '20:00';
    case 'muhasaba':
      return slot?.jamaatStr ? `~${addMinutesToHHmm(slot.jamaatStr, 35)}` : '20:40';
    case 'read':
      return '21:00 – 21:30';
    case 'bed_2145':
      return '21:45';
    case 'clean_eating':
      return 'All Day (⅓ rule)';
    case 'sadaqah':
      return 'Daily';
    case 'maker':
      return 'Fri 14:30 / Sat 11:30';
    default:
      return null;
  }
}

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

  const fajr = resolveSlot('fajr', 'Fajr', 'الفجر', '🌅', prayerTimes.fajr);
  const dhuhr = resolveSlot('dhuhr', 'Dhuhr', 'الظهر', '☀️', prayerTimes.dhuhr);
  const asr = resolveSlot('asr', 'Asr', 'العصر', '🌤', prayerTimes.asr);
  const maghrib = resolveSlot('maghrib', 'Maghrib', 'المغرب', '🌇', prayerTimes.maghrib);
  const isha = resolveSlot('isha', 'Isha', 'العشاء', '🌙', prayerTimes.isha);

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

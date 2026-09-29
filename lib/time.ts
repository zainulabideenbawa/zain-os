/**
 * Zain OS Pure Time Engine
 * Always Asia/Karachi (PKT, UTC+5).
 * Logical day boundary: 03:00 PKT -> 03:00 PKT.
 */

export const KARACHI_TZ = 'Asia/Karachi';
export const CYCLE_START_DATE = '2026-09-28';
export const CYCLE_END_DATE = '2026-12-20';
export const TOTAL_CYCLE_DAYS = 84; // 12 weeks * 7 days

export interface KarachiDateParts {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  hour: number; // 0-23
  minute: number; // 0-59
  second: number; // 0-59
  weekday: number; // 0 = Sun, 1 = Mon ... 6 = Sat
}

/**
 * Extracts date and time components in Asia/Karachi timezone.
 */
export function getKarachiParts(dateInput?: Date | string | number): KarachiDateParts {
  const date = dateInput ? new Date(dateInput) : new Date();

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: KARACHI_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    weekday: 'short',
  });

  const parts = formatter.formatToParts(date);
  const partMap: Record<string, string> = {};
  for (const part of parts) {
    partMap[part.type] = part.value;
  }

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return {
    year: parseInt(partMap.year, 10),
    month: parseInt(partMap.month, 10),
    day: parseInt(partMap.day, 10),
    hour: parseInt(partMap.hour, 10) % 24,
    minute: parseInt(partMap.minute, 10),
    second: parseInt(partMap.second, 10),
    weekday: weekdayMap[partMap.weekday] ?? 0,
  };
}

/**
 * Returns the logical date (YYYY-MM-DD) for a given timestamp.
 * A day closes at 03:00 PKT. Hours 00:00 - 02:59 belong to the previous day.
 */
export function getLogicalDate(dateInput?: Date | string | number): string {
  const parts = getKarachiParts(dateInput);

  // If time is before 03:00, subtract 1 calendar day
  if (parts.hour < 3) {
    const utcDate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
    utcDate.setUTCDate(utcDate.getUTCDate() - 1);
    const y = utcDate.getUTCFullYear();
    const m = String(utcDate.getUTCMonth() + 1).padStart(2, '0');
    const d = String(utcDate.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const y = parts.year;
  const m = String(parts.month).padStart(2, '0');
  const d = String(parts.day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Creates a UTC Date representing an exact Karachi local date and time.
 * Asia/Karachi has a fixed UTC+5 offset (no DST).
 */
export function createKarachiDate(
  year: number,
  month: number, // 1-12
  day: number,
  hour: number,
  minute: number,
  second: number = 0
): Date {
  // PKT is UTC+5, so UTC hour = Karachi hour - 5
  return new Date(Date.UTC(year, month - 1, day, hour - 5, minute, second));
}

/**
 * Parses "YYYY-MM-DD" and "HH:mm" as an exact Karachi Date object.
 */
export function parseKarachiDateTime(dateStr: string, timeStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = timeStr.split(':').map(Number);
  return createKarachiDate(y, m, d, hh, mm);
}

/**
 * Returns the exact Date boundaries for a logical day:
 * Starts: 03:00 PKT on logicalDate
 * Ends:   03:00 PKT on logicalDate + 1
 */
export function getLogicalDayBounds(logicalDateStr: string): {
  start: Date;
  end: Date;
} {
  const [y, m, d] = logicalDateStr.split('-').map(Number);
  const start = createKarachiDate(y, m, d, 3, 0, 0);

  // Next calendar day at 03:00
  const nextDate = new Date(Date.UTC(y, m - 1, d + 1));
  const end = createKarachiDate(
    nextDate.getUTCFullYear(),
    nextDate.getUTCMonth() + 1,
    nextDate.getUTCDate(),
    3,
    0,
    0
  );

  return { start, end };
}

/**
 * Returns formatted "HH:mm" in Karachi time.
 */
export function formatKarachiTime(dateInput: Date | string | number): string {
  const parts = getKarachiParts(dateInput);
  const hh = String(parts.hour).padStart(2, '0');
  const mm = String(parts.minute).padStart(2, '0');
  return `${hh}:${mm}`;
}

/**
 * Calculates 1-based cycle day from start date (default 2026-09-28).
 * 2026-09-28 -> day 1
 */
export function getCycleDay(
  logicalDateStr: string,
  cycleStart: string = CYCLE_START_DATE
): number {
  const [y1, m1, d1] = cycleStart.split('-').map(Number);
  const [y2, m2, d2] = logicalDateStr.split('-').map(Number);

  const startUtc = Date.UTC(y1, m1 - 1, d1);
  const dateUtc = Date.UTC(y2, m2 - 1, d2);

  const diffMs = dateUtc - startUtc;
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  return diffDays + 1;
}

/**
 * Calculates 1-based cycle week (1-12) from start date.
 */
export function getCycleWeek(
  dateInput?: Date | string | number,
  cycleStart: string = CYCLE_START_DATE
): number {
  const logicalDateStr =
    typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)
      ? dateInput
      : getLogicalDate(dateInput);
  const day = getCycleDay(logicalDateStr, cycleStart);
  if (day < 1) return 1;
  const week = Math.ceil(day / 7);
  return Math.min(12, Math.max(1, week));
}

/**
 * Determines phase-in week tier:
 * Week 1: Minimums only
 * Week 2: + Big Rock target
 * Weeks 3-4: + all targets visible
 * Weeks 5-12: Full system
 */
export function getPhaseTier(cycleWeek: number): 1 | 2 | 3 | 4 {
  if (cycleWeek <= 1) return 1;
  if (cycleWeek === 2) return 2;
  if (cycleWeek <= 4) return 3;
  return 4;
}

/**
 * Returns current Date in Karachi context
 */
export function getNowKarachi(): Date {
  return new Date();
}

/**
 * Formats a Date or timestamp in Asia/Karachi using format patterns
 */
export function formatInKarachi(
  dateInput: Date | string | number,
  pattern: string
): string {
  const parts = getKarachiParts(dateInput);
  const monthNamesShort = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const weekdayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (pattern === 'HH:mm') {
    return `${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`;
  }

  if (pattern === 'EEE, d MMM') {
    const weekday = weekdayNamesShort[parts.weekday];
    const month = monthNamesShort[parts.month - 1];
    return `${weekday}, ${parts.day} ${month}`;
  }

  if (pattern === 'yyyy-MM-dd') {
    return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
  }

  return formatKarachiTime(dateInput);
}

/**
 * Calculates remaining days in the active 84-day (12-week) cycle.
 */
export function getCycleDaysRemaining(
  dateInput?: Date | string | number
): number {
  const logicalDate = getLogicalDate(dateInput);
  const currentDay = getCycleDay(logicalDate);
  return Math.max(0, TOTAL_CYCLE_DAYS - currentDay);
}

/**
 * Returns tomorrow's date string (YYYY-MM-DD) given a YYYY-MM-DD string.
 */
export function getTomorrowDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const nextDate = new Date(Date.UTC(y, m - 1, d + 1));
  const ny = nextDate.getUTCFullYear();
  const nm = String(nextDate.getUTCMonth() + 1).padStart(2, '0');
  const nd = String(nextDate.getUTCDate()).padStart(2, '0');
  return `${ny}-${nm}-${nd}`;
}

/**
 * Returns yesterday's date string (YYYY-MM-DD) given a YYYY-MM-DD string.
 */
export function getYesterdayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const prevDate = new Date(Date.UTC(y, m - 1, d - 1));
  const py = prevDate.getUTCFullYear();
  const pm = String(prevDate.getUTCMonth() + 1).padStart(2, '0');
  const pd = String(prevDate.getUTCDate()).padStart(2, '0');
  return `${py}-${pm}-${pd}`;
}


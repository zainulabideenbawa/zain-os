export interface LawItem {
  number: number;
  title: string;
  rule: string;
}

export const LAWS_OF_ZAIN_OS: LawItem[] = [
  {
    number: 1,
    title: 'Salah is the schedule',
    rule: 'Every habit is anchored to a prayer you already never miss.',
  },
  {
    number: 2,
    title: 'Never miss twice',
    rule: 'One miss is an accident. Two is the start of a new habit.',
  },
  {
    number: 3,
    title: 'Big Rock before messages',
    rule: 'No feeds, news or inbox until 90 minutes of deep work are done.',
  },
  {
    number: 4,
    title: 'Decide at night, execute at dawn',
    rule: 'The morning never gets a vote on whether to start.',
  },
  {
    number: 5,
    title: 'Minimum on bad days, target on good days',
    rule: 'Consistency beats intensity.',
  },
  {
    number: 6,
    title: 'One goal per cycle',
    rule: 'Everything else is parked, not forgotten.',
  },
  {
    number: 7,
    title: 'Track inputs, not feelings',
    rule: 'Hours, reps, actions shipped. Feelings follow the numbers.',
  },
  {
    number: 8,
    title: 'Make starting stupidly easy',
    rule: '5-4-3-2-1. Just five minutes.',
  },
  {
    number: 9,
    title: 'The phone sleeps outside',
    rule: 'Out of the bedroom, off the dinner table, silent during the Big Rock.',
  },
  {
    number: 10,
    title: 'Celebrate every tap',
    rule: 'Alhamdulillah. A habit is wired in by the feeling right after it.',
  },
  {
    number: 11,
    title: 'Someone sees the score',
    rule: 'Every Sunday, one person you respect sees the truth.',
  },
  {
    number: 12,
    title: 'Rest is part of the work',
    rule: 'Qailulah, Sunday, and sleep straight after Isha.',
  },
];

/**
 * Returns the Law of the day rotated by day-of-cycle mod 12 (1-indexed).
 */
export function getLawOfDay(cycleDay: number): LawItem {
  const index = Math.abs((cycleDay - 1) % 12);
  return LAWS_OF_ZAIN_OS[index] || LAWS_OF_ZAIN_OS[0];
}

export interface LibraryBook {
  category:
    | 'habits'
    | 'morning'
    | 'focus'
    | 'execution'
    | 'discipline'
    | 'motivation'
    | 'life'
    | 'deen';
  categoryLabel: string;
  title: string;
  author: string;
  gist: string;
  practicalMove: string;
  inZainOs: string;
}

export const CATEGORY_LABELS: Record<LibraryBook['category'], string> = {
  habits: 'Habits',
  morning: 'Mornings',
  focus: 'Focus',
  execution: 'Execution',
  discipline: 'Discipline',
  motivation: 'Motivation design',
  life: 'Business & life',
  deen: 'Deen',
};

export const LIBRARY_BOOKS: LibraryBook[] = [
  {
    category: 'habits',
    categoryLabel: 'Habits',
    title: 'Atomic Habits',
    author: 'James Clear',
    gist: 'Habits are votes for the person you want to become. Systems beat goals.',
    practicalMove:
      'Four laws: make it obvious, attractive, easy, satisfying. Stack habits onto existing ones, use the 2-minute rule, never miss twice, design your environment.',
    inZainOs:
      'Salah-anchored checkpoints · 2-minute minimums · identity line · Day 1 setup · never-miss-twice rule',
  },
  {
    category: 'habits',
    categoryLabel: 'Habits',
    title: 'Tiny Habits',
    author: 'BJ Fogg',
    gist: 'Behavior = Motivation × Ability × Prompt. Motivation is unreliable, so shrink the behavior.',
    practicalMove:
      '"After I [anchor], I will [tiny behavior]", then celebrate instantly to wire it in.',
    inZainOs:
      '"After Asr, I open my Arabic notebook" · Alhamdulillah celebration on every tap · phase-in weeks',
  },
  {
    category: 'habits',
    categoryLabel: 'Habits',
    title: 'The Power of Habit',
    author: 'Charles Duhigg',
    gist: 'Cue → routine → reward, powered by craving. Keystone habits pull others along.',
    practicalMove:
      'Pick keystone habits: exercise, daily planning, family dinner. Stack small wins.',
    inZainOs: 'Keystones built in: Fajr movement, Isha plan, Maghrib family dinner',
  },
  {
    category: 'habits',
    categoryLabel: 'Habits',
    title: 'The Compound Effect',
    author: 'Darren Hardy',
    gist: 'Small smart choices × consistency × time = radical results.',
    practicalMove:
      'Track everything for a while. Bookend the day with morning and evening routines. Protect momentum ("Big Mo").',
    inZainOs:
      'Victory Hour + Isha shutdown as bookends · the streak is momentum made visible',
  },
  {
    category: 'morning',
    categoryLabel: 'Mornings',
    title: 'The 5AM Club',
    author: 'Robin Sharma',
    gist: 'Own your morning, elevate your life. The first hour is the Victory Hour.',
    practicalMove:
      '20/20/20 (Move, Reflect, Grow) · no tech in the first hour · 90/90/1 · 60/10 work cycles · Twin Cycles of push and deep recovery.',
    inZainOs:
      'Fajr Victory Hour · Big Rock 90 min at 07:30 for 84 days · 60/10 timer mode · qailulah + Sunday recovery',
  },
  {
    category: 'morning',
    categoryLabel: 'Mornings',
    title: 'The Miracle Morning',
    author: 'Hal Elrod',
    gist: 'A deliberate morning routine sets the whole day.',
    practicalMove: 'SAVERS: Silence, Affirmations, Visualization, Exercise, Reading, Scribing.',
    inZainOs: 'SAVERS mapped onto Fajr: dhikr, identity + dua, Why Card, run, Qur\'an, confirm plan',
  },
  {
    category: 'focus',
    categoryLabel: 'Focus',
    title: 'Deep Work',
    author: 'Cal Newport',
    gist: 'Focused, distraction-free work is rare and valuable.',
    practicalMove:
      'Schedule depth in a fixed rhythm. About 4 hrs a day is the ceiling. End with a shutdown ritual. Don\'t reach for the phone at every pause.',
    inZainOs: 'Fixed Big Rock blocks · 4-hr cap · Isha shutdown · Focus mode',
  },
  {
    category: 'focus',
    categoryLabel: 'Focus',
    title: 'Digital Minimalism',
    author: 'Cal Newport',
    gist: 'Use technology on purpose, not by default.',
    practicalMove:
      'Remove optional apps, set windows for social media, keep the phone away from meals and bed.',
    inZainOs:
      'Phone rules: no feeds before the Big Rock, two social windows, phone out of the bedroom and away at dinner',
  },
  {
    category: 'focus',
    categoryLabel: 'Focus',
    title: 'Indistractable',
    author: 'Nir Eyal',
    gist: 'Distraction starts inside you. Manage the urge, then timebox your values and make pacts.',
    practicalMove: 'Timebox the whole day, not just tasks. Effort, price and identity pacts.',
    inZainOs: 'Time-blocked day · Focus mode (effort) · sadaqah stake (price) · identity line (identity)',
  },
  {
    category: 'focus',
    categoryLabel: 'Focus',
    title: 'The ONE Thing',
    author: 'Gary Keller',
    gist: 'Extraordinary results come from going narrow.',
    practicalMove: 'Ask the Focusing Question. Block time for your ONE thing before anything else.',
    inZainOs: 'The evening plan asks the Focusing Question to choose tomorrow\'s Big Rock',
  },
  {
    category: 'focus',
    categoryLabel: 'Focus',
    title: 'Eat That Frog',
    author: 'Brian Tracy',
    gist: 'Do your hardest, most important task first.',
    practicalMove: 'Plan the night before · 80/20 · ABCDE priorities.',
    inZainOs: 'Big Rock at 07:30, before the inbox and before ops',
  },
  {
    category: 'focus',
    categoryLabel: 'Focus',
    title: 'Essentialism',
    author: 'Greg McKeown',
    gist: 'Less, but better.',
    practicalMove: 'If it isn\'t a clear yes, it\'s a no. Build in buffer. Routinise the essentials.',
    inZainOs: 'Parked list · daily buffer block · max 3 active projects',
  },
  {
    category: 'focus',
    categoryLabel: 'Focus',
    title: 'Make Time',
    author: 'Knapp & Zeratsky',
    gist: 'Choose one Highlight a day, focus on it, recharge, reflect.',
    practicalMove: 'Pick a daily Highlight and put friction on distractions.',
    inZainOs: 'The Big Rock is your daily Highlight · evening reflection',
  },
  {
    category: 'execution',
    categoryLabel: 'Execution',
    title: 'The 12 Week Year',
    author: 'Brian Moran',
    gist: 'Twelve weeks is a year. Urgency comes from a short horizon.',
    practicalMove:
      '12-week goals · weekly plan · weekly scorecard · 85% execution = success · Weekly Accountability Meeting.',
    inZainOs: 'Cycle 1 (84 days) · weekly score · 85% win line · Sunday partner call',
  },
  {
    category: 'execution',
    categoryLabel: 'Execution',
    title: 'The 4 Disciplines of Execution',
    author: 'McChesney, Covey & Huling',
    gist: 'Execution beats strategy when day-to-day urgencies are loud.',
    practicalMove: 'Wildly important goal · lead measures · a compelling scoreboard · a cadence of accountability.',
    inZainOs: 'One WIG · three numbers · Sunday cadence',
  },
  {
    category: 'execution',
    categoryLabel: 'Execution',
    title: 'The 7 Habits',
    author: 'Stephen Covey',
    gist: 'Effectiveness is built on principles.',
    practicalMove:
      'Begin with the end in mind · put first things first (important but not urgent) · sharpen the saw across physical, spiritual, mental and social.',
    inZainOs: 'Goal hierarchy + niyyah · Big Rock · four pillars + family at Maghrib',
  },
  {
    category: 'discipline',
    categoryLabel: 'Discipline',
    title: 'Can\'t Hurt Me',
    author: 'David Goggins',
    gist: 'You\'re capable of far more than you think, and you build it by doing hard things.',
    practicalMove: 'Accountability mirror · Cookie Jar of past wins · the 40% rule · callus the mind.',
    inZainOs: 'Mirror note · Cookie Jar · weekly Hard Mode',
  },
  {
    category: 'discipline',
    categoryLabel: 'Discipline',
    title: 'Discipline Equals Freedom',
    author: 'Jocko Willink',
    gist: 'Discipline is the path to freedom.',
    practicalMove: 'Wake up and go. Don\'t negotiate. Meet setbacks with "Good."',
    inZainOs: 'Plan locked the night before · alarm across the room · "Good. Comeback day."',
  },
  {
    category: 'discipline',
    categoryLabel: 'Discipline',
    title: 'Extreme Ownership',
    author: 'Willink & Babin',
    gist: 'Own everything in your world. No excuses.',
    practicalMove: 'After a failure, ask what you own and fix the system.',
    inZainOs: 'Muhasaba question: "What do I own about today?"',
  },
  {
    category: 'discipline',
    categoryLabel: 'Discipline',
    title: 'Grit',
    author: 'Angela Duckworth',
    gist: 'Passion plus perseverance over time beats talent.',
    practicalMove: 'A goal hierarchy from purpose to daily tasks · deliberate practice on your weak points.',
    inZainOs: 'Why → Who → What hierarchy · Arabic practised daily on the hardest words',
  },
  {
    category: 'discipline',
    categoryLabel: 'Discipline',
    title: 'Mindset',
    author: 'Carol Dweck',
    gist: 'Abilities grow with effort.',
    practicalMove: 'Say "not yet" instead of "can\'t". Praise the process.',
    inZainOs: 'The coach praises effort · Arabic progress reads "not yet"',
  },
  {
    category: 'discipline',
    categoryLabel: 'Discipline',
    title: 'The 5 Second Rule',
    author: 'Mel Robbins',
    gist: 'Hesitation kills action.',
    practicalMove: 'Count 5-4-3-2-1 and move before your brain talks you out of it.',
    inZainOs: '5-4-3-2-1 → Start button on the Big Rock',
  },
  {
    category: 'motivation',
    categoryLabel: 'Motivation design',
    title: 'Hooked',
    author: 'Nir Eyal',
    gist: 'Habit-forming products run one loop: trigger, action, variable reward, investment.',
    practicalMove: 'One tiny action per trigger. Vary the rewards. Ask for a small investment that sets up the next trigger.',
    inZainOs: 'Adhan → one tap → flame, milestone or coach line → tonight\'s plan',
  },
  {
    category: 'motivation',
    categoryLabel: 'Motivation design',
    title: 'Drive',
    author: 'Daniel Pink',
    gist: 'Autonomy, mastery and purpose outlast carrots and sticks.',
    practicalMove: 'Choose your own rules, see your progress, connect work to purpose.',
    inZainOs: 'You set the stakes and rules · progress views · niyyah on every block',
  },
  {
    category: 'motivation',
    categoryLabel: 'Motivation design',
    title: 'How to Change',
    author: 'Katy Milkman',
    gist: 'Match the tool to the specific barrier.',
    practicalMove: 'Fresh starts · temptation bundling · commitment devices · flexible goals with emergency passes.',
    inZainOs: 'Reset points · audio only during workouts · sadaqah stakes · freezes',
  },
  {
    category: 'life',
    categoryLabel: 'Business & life',
    title: '$100M Leads',
    author: 'Alex Hormozi',
    gist: 'Volume solves most business problems.',
    practicalMove: 'The Rule of 100: 100 lead-generation actions a day for 100 days. Track inputs.',
    inZainOs: 'The team carries outreach volume · your 3 revenue actions a day · things shipped',
  },
  {
    category: 'life',
    categoryLabel: 'Business & life',
    title: 'Four Thousand Weeks',
    author: 'Oliver Burkeman',
    gist: 'Life is short and you\'ll never do it all.',
    practicalMove: 'Limit work in progress to about 3. Pay yourself first in time. Decide what to neglect.',
    inZainOs: 'One WIG + one keep-alive + one maintenance project · Big Rock first',
  },
  {
    category: 'life',
    categoryLabel: 'Business & life',
    title: 'Why We Sleep',
    author: 'Matthew Walker',
    gist: 'Sleep underlies energy, mood and learning.',
    practicalMove: 'Regular sleep and wake times, 7+ hours, a dark and cool room. Some of the book\'s claims are disputed; these basics hold.',
    inZainOs: 'In bed by 21:45 after Isha · qailulah · sleep time logged in muhasaba',
  },
  {
    category: 'deen',
    categoryLabel: 'Deen',
    title: 'Iḥyāʾ ʿUlūm al-Dīn',
    author: 'al-Ghazālī · Book of Murāqaba & Muḥāsaba',
    gist: 'Six stations of self-discipline.',
    practicalMove: 'Set terms with the self in the morning, watch it through the day, account at night, apply a consequence, strive, reproach honestly.',
    inZainOs: 'The operating loop: morning confirm → checkpoints → muhasaba → stakes → Hard Mode → Sunday review',
  },
  {
    category: 'deen',
    categoryLabel: 'Deen',
    title: 'The Productive Muslim',
    author: 'Mohammed Faris',
    gist: 'Productivity = focus × energy × time, and barakah multiplies all three. It has spiritual, physical and social dimensions.',
    practicalMove:
      'Plan the day around salah. Guard the post-Fajr hours and qailulah. Eat by the one-third rule. Map your energy through the day. Keep a minimum level in every role (family, community, work). Draw barakah through dua, dhikr, sadaqah, ties of kinship and avoiding sins.',
    inZainOs: 'Salah checkpoints · barakah dua after Fajr · energy heatmap · daily sadaqah · weekly roles check · 1/3 eating · istikhara + shura for big decisions',
  },
  {
    category: 'deen',
    categoryLabel: 'Deen',
    title: 'al-Fawāʾid',
    author: 'Ibn al-Qayyim',
    gist: 'Time is your life. Wasting it cuts you off from Allah and the Hereafter.',
    practicalMove: 'Guard the hours. Value small deeds done consistently.',
    inZainOs: 'Time-blocked day · consistency over intensity · Deen minimums every single day',
  },
];

export interface DuaItem {
  id: string;
  title: string;
  arabic: string;
  meaning: string;
  source: string;
}

export const FAJR_DUA: DuaItem = {
  id: 'fajr_dua',
  title: 'After Fajr (after the salam)',
  arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا',
  meaning: 'O Allah, I ask You for beneficial knowledge, good provision, and accepted deeds.',
  source: 'Ibn Mājah 925',
};

export const LAZINESS_DUA: DuaItem = {
  id: 'laziness_dua',
  title: 'Against laziness (morning)',
  arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ، وَغَلَبَةِ الرِّجَالِ',
  meaning: 'O Allah, I seek refuge in You from worry and grief, from incapacity and laziness, from miserliness and cowardice, from the burden of debt and from being overpowered by men.',
  source: 'Ṣaḥīḥ al-Bukhārī 6369',
};

export const BISMILLAH: DuaItem = {
  id: 'bismillah',
  title: 'Start of the Big Rock',
  arabic: 'بِسْمِ اللَّهِ',
  meaning: 'In the name of Allah.',
  source: 'Sunnah',
};

export const DUAS: DuaItem[] = [FAJR_DUA, LAZINESS_DUA, BISMILLAH];

export interface ReflectionCard {
  id: string;
  arabic?: string;
  meaning: string;
  source: string;
}

export const REFLECTION_CARDS: ReflectionCard[] = [
  {
    id: 'reflection_1',
    arabic: 'أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ',
    meaning: 'The most beloved of deeds to Allah are the most consistent of them, even if they are small.',
    source: 'Bukhārī 6464 · Muslim 783',
  },
  {
    id: 'reflection_2',
    arabic: 'الْمُؤْمِنُ الْقَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللَّهِ مِنَ الْمُؤْمِنِ الضَّعِيفِ … احْرِصْ عَلَى مَا يَنْفَعُكَ وَاسْتَعِنْ بِاللَّهِ وَلَا تَعْجَزْ',
    meaning: 'The strong believer is better and more beloved to Allah than the weak believer… Be eager for what benefits you, seek Allah’s help, and do not give up.',
    source: 'Muslim 2664',
  },
  {
    id: 'reflection_3',
    arabic: 'اللَّهُمَّ بَارِكْ لِأُمَّتِي فِي بُكُورِهَا',
    meaning: 'O Allah, bless my ummah in its early mornings.',
    source: 'Abū Dāwūd 2606 · Tirmidhī 1212',
  },
  {
    id: 'reflection_4',
    arabic: 'مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ',
    meaning: 'Charity does not decrease wealth.',
    source: 'Muslim 2588',
  },
  {
    id: 'reflection_5',
    arabic: 'مَنْ سَرَّهُ أَنْ يُبْسَطَ لَهُ فِي رِزْقِهِ، وَيُنْسَأَ لَهُ فِي أَثَرِهِ، فَلْيَصِلْ رَحِمَهُ',
    meaning: 'Whoever would love for his provision to be expanded and his life to be extended, let him maintain the ties of kinship.',
    source: 'Bukhārī 5986',
  },
  {
    id: 'reflection_6',
    meaning: 'Hold yourselves to account before you are held to account.',
    source: 'ʿUmar ibn al-Khaṭṭāb (reported by al-Tirmidhī)',
  },
  {
    id: 'reflection_7',
    meaning: 'Do not belittle any good deed.',
    source: 'Muslim 2626',
  },
];

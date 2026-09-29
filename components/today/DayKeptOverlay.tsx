'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DayKeptOverlayProps {
  open: boolean;
  streak: number;
  onClose: () => void;
}

const REFLECTIONS = [
  {
    arabic: 'أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ',
    meaning: 'The most beloved of deeds to Allah are the most consistent of them, even if they are small.',
    source: 'Bukhārī 6464 · Muslim 783',
  },
  {
    arabic: 'الْمُؤْمِنُ الْقَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللَّهِ مِنَ الْمُؤْمِنِ الضَّعِيفِ … احْرِصْ عَلَى مَا يَنْفَعُكَ وَاسْتَعِنْ بِاللَّهِ وَلَا تَعْجَزْ',
    meaning: "The strong believer is better and more beloved to Allah than the weak believer… Be eager for what benefits you, seek Allah's help, and do not give up.",
    source: 'Muslim 2664',
  },
  {
    arabic: 'اللَّهُمَّ بَارِكْ لِأُمَّتِي فِي بُكُورِهَا',
    meaning: 'O Allah, bless my ummah in its early mornings.',
    source: 'Abū Dāwūd 2606 · Tirmidhī 1212',
  },
  {
    arabic: 'مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ',
    meaning: 'Charity does not decrease wealth.',
    source: 'Muslim 2588',
  },
  {
    arabic: 'حَاسِبُوا أَنْفُسَكُمْ قَبْلَ أَنْ تُحَاسَبُوا',
    meaning: 'Hold yourselves to account before you are held to account.',
    source: 'ʿUmar ibn al-Khaṭṭāb (al-Tirmidhī)',
  },
];

export function DayKeptOverlay({ open, streak, onClose }: DayKeptOverlayProps) {
  const reflection = REFLECTIONS[streak % REFLECTIONS.length];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-sm bg-neutral-900 border border-emerald-500/30 rounded-2xl p-6 text-center shadow-2xl relative overflow-hidden"
          >
            {/* Subtle glow background */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle className="w-8 h-8" />
              </div>
            </div>

            <p className="font-amiri text-2xl text-emerald-300 font-semibold mb-1">
              الْحَمْدُ لِلَّهِ
            </p>
            <h2 className="font-cormorant text-3xl font-semibold text-white tracking-wide mb-1">
              Day Kept
            </h2>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono text-sm font-semibold mb-6">
              <Flame className="w-4 h-4 fill-amber-500" />
              <span>{streak} days strong</span>
            </div>

            {/* Reflection card */}
            <div className="bg-neutral-950/60 border border-white/5 rounded-xl p-4 text-left mb-6">
              <p className="font-amiri text-lg text-emerald-200/90 text-right leading-relaxed mb-2" dir="rtl">
                {reflection.arabic}
              </p>
              <p className="text-xs text-neutral-300 italic mb-2 leading-relaxed">
                "{reflection.meaning}"
              </p>
              <p className="text-[10px] text-neutral-500 font-mono text-right">
                — {reflection.source}
              </p>
            </div>

            <Button
              onClick={onClose}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl shadow-lg transition-colors"
            >
              Alhamdulillah, Continue
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { DUAS } from '@/lib/content/duas';
import { ChevronDown, Check, Sparkles } from 'lucide-react';
import { confirmMorningPlan } from '@/app/actions/today';
import { toast } from 'sonner';

interface IdentityCardProps {
  date: string;
  confirmedAt: string | null;
  cycleWeek: number;
}

export function IdentityCard({ date, confirmedAt, cycleWeek }: IdentityCardProps) {
  const [confirmed, setConfirmed] = useState(Boolean(confirmedAt));
  const [loading, setLoading] = useState(false);
  const [showDua, setShowDua] = useState(false);

  const morningDua = DUAS[0];

  const handleConfirm = async () => {
    setLoading(true);
    setConfirmed(true);
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }

    const res = await confirmMorningPlan({ date });
    if (!res.success) {
      setConfirmed(false);
      toast.error('Failed to confirm plan. Please try again.');
    } else {
      toast.success('Morning commitment sealed. Bismillah!');
    }
    setLoading(false);
  };

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-b from-[var(--card)] to-[var(--bg)] border border-[var(--border)] shadow-md space-y-3">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-[var(--gold)] uppercase tracking-wider font-semibold">
          Daily Identity Anchor
        </span>
        <span className="text-[var(--muted)]">Cycle 1 · W{cycleWeek}</span>
      </div>

      <p className="font-serif text-lg italic text-[var(--fg)] leading-snug">
        &ldquo;I am a Muslim who keeps his promises to Allah and to himself, and a builder who ships every day.&rdquo;
      </p>

      {/* Dua toggle section */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowDua(!showDua)}
          className="flex items-center gap-1.5 text-xs font-mono text-[var(--gold)] hover:underline cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{morningDua.title}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              showDua ? 'rotate-180' : ''
            }`}
          />
        </button>

        <AnimatePresence>
          {showDua && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mt-2 p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-2 text-center"
            >
              <p className="font-amiri text-2xl text-[var(--gold)] leading-relaxed dir-rtl" dir="rtl">
                {morningDua.arabic}
              </p>
              <p className="text-xs text-[var(--fg)] italic">
                &ldquo;{morningDua.meaning}&rdquo;
              </p>
              <p className="text-[10px] font-mono text-[var(--muted)]">
                {morningDua.source}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Plan confirmation button */}
      <div>
        {confirmed ? (
          <div className="w-full py-2 px-3 rounded-xl bg-[var(--emerald)]/10 border border-[var(--emerald)]/20 flex items-center justify-center gap-2 text-xs font-mono text-[var(--emerald)]">
            <Check className="w-4 h-4" />
            <span>Morning Plan Confirmed</span>
          </div>
        ) : (
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full h-10 bg-[var(--gold)] hover:bg-[var(--gold)]/90 text-black font-semibold rounded-xl text-xs cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Confirm Morning Plan</span>
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

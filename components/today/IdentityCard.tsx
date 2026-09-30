'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { DUAS } from '@/lib/content/duas';
import { ChevronDown, Check, Sparkles } from 'lucide-react';
import { confirmMorningPlan } from '@/app/actions/today';
import { toast } from 'sonner';

interface IdentityPlan {
  top3?: string[];
  big_rock_first_action?: string;
  focusing_q?: string;
  if_then?: string;
}

interface IdentityCardProps {
  date: string;
  confirmedAt: string | null;
  cycleWeek: number;
  plan?: IdentityPlan | null;
}

export function IdentityCard({ date, confirmedAt, cycleWeek, plan }: IdentityCardProps) {
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

  const top3Items = (plan?.top3 || []).filter((item) => item && item.trim().length > 0);

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

      {/* Last Night's Plan (Top 3 + Big Rock First Action) */}
      <div className="pt-2 border-t border-[var(--border)] space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-[var(--gold)] uppercase tracking-wider font-semibold">
            Last Night&apos;s Plan
          </span>
          <span className="text-[var(--muted)]">Muhasaba Commitment</span>
        </div>

        {top3Items.length > 0 || plan?.big_rock_first_action ? (
          <div className="space-y-2 text-xs">
            {plan?.big_rock_first_action && (
              <div className="p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-1">
                <span className="text-[10px] font-mono uppercase text-[var(--gold)] block">
                  Big Rock First Action
                </span>
                <p className="text-sm font-medium text-[var(--fg)]">
                  {plan.big_rock_first_action}
                </p>
              </div>
            )}

            {top3Items.length > 0 && (
              <div className="p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-[var(--muted)] block">
                  Top 3 Outcomes
                </span>
                <ol className="space-y-1">
                  {top3Items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-[var(--fg)]">
                      <span className="font-mono text-[var(--gold)] font-bold text-[11px] shrink-0">
                        {idx + 1}.
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {plan?.if_then && (
              <div className="p-2 rounded-lg bg-[var(--bg)]/60 text-[11px] text-[var(--muted)] border border-[var(--border)] italic">
                &ldquo;{plan.if_then}&rdquo;
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-[var(--muted)] italic">
            No plan set last night. Decide your Big Rock and commit for today.
          </p>
        )}
      </div>

      {/* Plan confirmation button */}
      <div>
        {confirmed ? (
          <div className="w-full py-2 px-3 rounded-xl bg-[var(--gold)]/10 border border-[var(--gold)]/30 flex items-center justify-center gap-2 text-xs font-mono text-[var(--gold)]">
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

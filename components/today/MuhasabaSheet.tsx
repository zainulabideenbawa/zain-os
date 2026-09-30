'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Moon,
  Zap,
  HeartHandshake,
  Calendar,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Database } from '@/lib/database.types';
import { saveMuhasabaAndPlan } from '@/app/actions/muhasaba';
import { toggleHabitLog } from '@/app/actions/today';
import { getTomorrowDate, getKarachiParts } from '@/lib/time';
import { toast } from 'sonner';

type Habit = Database['public']['Tables']['habits']['Row'];
type DayLog = Database['public']['Tables']['day_logs']['Row'];

interface MuhasabaSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  habits: Habit[];
  dayLogsMap: Record<string, DayLog>;
  onLogUpdated: (habitId: string, field: 'done_min' | 'done_target', val: boolean) => void;
  onDayKept: (streak: number) => void;
}

const BARRIER_OPTIONS = [
  'forgot',
  'procrastinated',
  'tired',
  'overcommitted',
  'distracted',
];

const KHUSHU_OPTIONS = [
  { val: 1, label: 'Scattered' },
  { val: 2, label: 'Some' },
  { val: 3, label: 'Present' },
];

export function MuhasabaSheet({
  open,
  onOpenChange,
  date,
  habits,
  dayLogsMap,
  onLogUpdated,
  onDayKept,
}: MuhasabaSheetProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setStep(1);
    }
  }, [open]);

  // Step 2 Form State
  const [energy, setEnergy] = useState<number>(3);
  const [khushu, setKhushu] = useState<number>(2);
  const [wentWell, setWentWell] = useState('');
  const [wentWrong, setWentWrong] = useState('');
  const [barrier, setBarrier] = useState('procrastinated');
  const [owned, setOwned] = useState('');
  const [shukr, setShukr] = useState('');

  // Step 3 Form State
  const [focusingQ, setFocusingQ] = useState(
    "What's the ONE thing tomorrow that makes everything else easier?"
  );
  const [top1, setTop1] = useState('5 apps launched & earning');
  const [top2, setTop2] = useState('');
  const [top3, setTop3] = useState('');
  const [bigRockFirstAction, setBigRockFirstAction] = useState('');
  const [ifThen, setIfThen] = useState(
    'If I wake up tired, then I still do 45 minutes of the Big Rock first.'
  );

  const tomorrowDate = getTomorrowDate(date);
  const tomorrowParts = getKarachiParts(`${tomorrowDate}T12:00:00Z`);
  // Tahajjud days are 0 (Sun), 3 (Wed), 5 (Fri) pre-dawn
  const isTomorrowTahajjud = [0, 3, 5].includes(tomorrowParts.weekday);

  const handleToggleHabit = async (
    habitId: string,
    field: 'done_min' | 'done_target',
    currentVal: boolean
  ) => {
    const newVal = !currentVal;
    onLogUpdated(habitId, field, newVal);

    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }

    await toggleHabitLog({
      habitId,
      date,
      field,
      value: newVal,
    });
  };

  const handleSaveAndClose = async () => {
    if (!bigRockFirstAction.trim()) {
      toast.error('Please specify the Big Rock first action for tomorrow.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await saveMuhasabaAndPlan({
        date,
        energy,
        khushu,
        went_well: wentWell.trim() || 'Showed up and executed.',
        went_wrong: wentWrong.trim() || 'None',
        barrier,
        owned: owned.trim() || undefined,
        shukr: shukr.trim() || undefined,
        plan: {
          focusing_q: focusingQ.trim(),
          top3: [top1.trim(), top2.trim(), top3.trim()].filter(Boolean),
          big_rock_first_action: bigRockFirstAction.trim(),
          if_then: ifThen.trim(),
        },
      });

      if (!res.success) {
        toast.error(`Error saving: ${res.error}`);
        return;
      }

      toast.success('Saved. Sleep well.');
      onOpenChange(false);

      if (res.allMinDone) {
        onDayKept(res.streak);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px] w-[95vw] h-[90dvh] max-h-[820px] p-0 bg-[#0e0d0c] text-[var(--fg)] border border-[var(--line)] rounded-[24px] flex flex-col overflow-hidden shadow-2xl focus:outline-none gap-0 [&>button]:hidden">
        <DialogTitle className="sr-only">Muhasaba and Plan Flow</DialogTitle>

        {/* Top Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[var(--line)] bg-[#141210]">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[var(--gold)] font-semibold uppercase tracking-wider">
                Step {step} of 3
              </span>
              <span className="text-[var(--faint)]">·</span>
              <span className="text-xs text-[var(--muted)]">
                {step === 1 && 'Tick Habits'}
                {step === 2 && 'Evening Muhasaba'}
                {step === 3 && 'Plan Tomorrow'}
              </span>
            </div>
            <h2 className="font-cormorant text-2xl font-semibold text-[var(--fg)] tracking-wide mt-0.5">
              {step === 1 && 'Confirm Today’s Taps'}
              {step === 2 && 'Self-Accounting (Muhasaba)'}
              {step === 3 && 'Decide at Night, Execute at Dawn'}
            </h2>
          </div>

          <button
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[var(--muted)] hover:text-[var(--fg)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Step Content */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
          {/* STEP 1: TICK */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-xs text-[var(--muted)]">
                Review and adjust your habits logged today before closing the day.
              </p>

              <div className="space-y-2">
                {(() => {
                  const [y, m, d] = date.split('-').map(Number);
                  const currentDayOfWeek = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
                  const activeHabits = habits.filter((h) => {
                    if (h.days && Array.isArray(h.days) && h.days.length > 0) {
                      return h.days.includes(currentDayOfWeek);
                    }
                    return true;
                  });

                  return activeHabits.map((habit) => {
                    const log = dayLogsMap[habit.id];
                    const doneMin = log?.done_min ?? false;
                    const doneTarget = log?.done_target ?? false;

                    return (
                      <div
                        key={habit.id}
                        className="p-3.5 rounded-xl bg-[#181614] border border-[var(--line)] flex items-center justify-between"
                      >
                        <div className="pr-2">
                          <p className="text-sm font-medium text-[var(--fg)]">
                            {habit.name}
                          </p>
                          <p className="text-[11px] text-[var(--muted)] capitalize">
                            {habit.checkpoint} · {habit.pillar}
                            {habit.is_minimum && ' · Non-negotiable'}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleToggleHabit(habit.id, 'done_min', doneMin)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                              doneMin
                                ? 'bg-[var(--gold)] text-[#12110F] font-semibold'
                                : 'bg-white/5 text-[var(--muted)] hover:bg-white/10 hover:text-[var(--fg)]'
                            }`}
                          >
                            Min
                          </button>
                          {habit.target_value && (
                            <button
                              onClick={() => handleToggleHabit(habit.id, 'done_target', doneTarget)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                                doneTarget
                                  ? 'bg-[var(--gold)] text-[#12110F] font-semibold'
                                  : 'bg-white/5 text-[var(--muted)] hover:bg-white/10 hover:text-[var(--fg)]'
                              }`}
                            >
                              Target
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* STEP 2: MUHASABA */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Energy 1-5 */}
              <div>
                <label className="text-xs font-mono uppercase text-[var(--muted)] tracking-wider block mb-2">
                  Energy today (1–5)
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setEnergy(lvl)}
                      className={`h-11 rounded-xl text-sm font-mono font-semibold transition-all cursor-pointer ${
                        energy === lvl
                          ? 'bg-[var(--gold)] text-[#12110F] shadow-md shadow-[var(--gold)]/20'
                          : 'bg-[#181614] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--fg)]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Khushu 1-3 */}
              <div>
                <label className="text-xs font-mono uppercase text-[var(--muted)] tracking-wider block mb-2">
                  Khushu in salah
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {KHUSHU_OPTIONS.map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setKhushu(opt.val)}
                      className={`h-11 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        khushu === opt.val
                          ? 'bg-[var(--gold)] text-[#12110F] font-semibold shadow-md shadow-[var(--gold)]/20'
                          : 'bg-[#181614] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--fg)]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* What went well? */}
              <div>
                <label className="text-xs font-medium text-[var(--fg)] block mb-1">
                  What went well? <span className="text-[var(--faint)] text-[10px]">(Cookie Jar)</span>
                </label>
                <Input
                  value={wentWell}
                  onChange={(e) => setWentWell(e.target.value)}
                  placeholder="e.g. Shipped the onboarding flow before Dhuhr"
                  className="bg-[#181614] border-[var(--line)] text-sm h-11 text-[var(--fg)] placeholder:text-[var(--faint)] focus-visible:ring-[var(--gold)]"
                />
              </div>

              {/* What didn't, and why? */}
              <div>
                <label className="text-xs font-medium text-[var(--fg)] block mb-1">
                  What didn’t, and why?
                </label>
                <Input
                  value={wentWrong}
                  onChange={(e) => setWentWrong(e.target.value)}
                  placeholder="e.g. Checked Twitter after lunch instead of rest"
                  className="bg-[#181614] border-[var(--line)] text-sm h-11 mb-2 text-[var(--fg)] placeholder:text-[var(--faint)] focus-visible:ring-[var(--gold)]"
                />

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {BARRIER_OPTIONS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setBarrier(chip)}
                      className={`px-3 py-1 rounded-full text-xs font-mono capitalize transition-colors cursor-pointer ${
                        barrier === chip
                          ? 'bg-[var(--gold-glow)] text-[var(--gold)] border border-[var(--gold)]/40 font-semibold'
                          : 'bg-[#181614] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--fg)]'
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* What do I own? */}
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1">
                  What do I own about today? <span className="text-[var(--faint)] text-[10px]">(optional)</span>
                </label>
                <Input
                  value={owned}
                  onChange={(e) => setOwned(e.target.value)}
                  placeholder="e.g. I stayed up 20 mins late last night."
                  className="bg-[#181614] border-[var(--line)] text-sm h-11 text-[var(--fg)] placeholder:text-[var(--faint)] focus-visible:ring-[var(--gold)]"
                />
              </div>

              {/* Shukr / Istighfar */}
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1">
                  Shukr or istighfar <span className="text-[var(--faint)] text-[10px]">(optional)</span>
                </label>
                <Input
                  value={shukr}
                  onChange={(e) => setShukr(e.target.value)}
                  placeholder="Astaghfirullah wa atoobu ilayh"
                  className="bg-[#181614] border-[var(--line)] text-sm h-11 text-[var(--fg)] placeholder:text-[var(--faint)] focus-visible:ring-[var(--gold)]"
                />
              </div>
            </div>
          )}

          {/* STEP 3: PLAN TOMORROW */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Tomorrow Context Card */}
              <div className="p-3.5 rounded-xl bg-[#181614] border border-[var(--line)] text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[var(--muted)]">
                  <span className="font-mono">{tomorrowDate}</span>
                  <span className="capitalize">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][tomorrowParts.weekday]}</span>
                </div>
                {isTomorrowTahajjud ? (
                  <div className="flex items-center gap-1.5 text-[var(--gold)] font-medium">
                    <Moon className="w-3.5 h-3.5" />
                    <span>Tahajjud Morning · Alarm at 04:45</span>
                  </div>
                ) : (
                  <div className="text-[var(--muted)]">Regular morning schedule · Fajr jamaat</div>
                )}
                <div className="text-[11px] text-[var(--faint)] pt-1 border-t border-[var(--line)]">
                  07:30–09:30 Big Rock · 09:30 Sales standup
                </div>
              </div>

              {/* Focusing Question */}
              <div>
                <label className="text-xs font-mono uppercase text-[var(--gold)] tracking-wider block mb-1">
                  The Focusing Question
                </label>
                <p className="text-xs text-[var(--muted)] mb-2 italic">
                  &ldquo;What&apos;s the ONE thing tomorrow that makes everything else easier?&rdquo;
                </p>
                <Input
                  value={focusingQ}
                  onChange={(e) => setFocusingQ(e.target.value)}
                  className="bg-[#181614] border-[var(--line)] text-sm h-11 text-[var(--fg)] placeholder:text-[var(--faint)] focus-visible:ring-[var(--gold)]"
                />
              </div>

              {/* Top 3 Priorities */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase text-[var(--muted)] tracking-wider block">
                  Top 3 Priorities
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center font-mono text-xs text-[var(--gold)] font-semibold">1</span>
                    <Input
                      value={top1}
                      onChange={(e) => setTop1(e.target.value)}
                      placeholder="#1 Priority (WIG)"
                      className="bg-[#181614] border-[var(--line)] text-sm h-10 text-[var(--fg)] placeholder:text-[var(--faint)] focus-visible:ring-[var(--gold)]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center font-mono text-xs text-[var(--faint)] font-semibold">2</span>
                    <Input
                      value={top2}
                      onChange={(e) => setTop2(e.target.value)}
                      placeholder="#2 Priority"
                      className="bg-[#181614] border-[var(--line)] text-sm h-10 text-[var(--fg)] placeholder:text-[var(--faint)] focus-visible:ring-[var(--gold)]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center font-mono text-xs text-[var(--faint)] font-semibold">3</span>
                    <Input
                      value={top3}
                      onChange={(e) => setTop3(e.target.value)}
                      placeholder="#3 Priority"
                      className="bg-[#181614] border-[var(--line)] text-sm h-10 text-[var(--fg)] placeholder:text-[var(--faint)] focus-visible:ring-[var(--gold)]"
                    />
                  </div>
                </div>
              </div>

              {/* Big Rock First Action (REQUIRED) */}
              <div>
                <label className="text-xs font-mono uppercase text-[var(--gold)] tracking-wider block mb-1">
                  Big Rock First Action (Required)
                </label>
                <p className="text-[11px] text-[var(--faint)] mb-2">
                  What exact file or screen do you open at 07:30?
                </p>
                <Input
                  value={bigRockFirstAction}
                  onChange={(e) => setBigRockFirstAction(e.target.value)}
                  placeholder="e.g. Open PayClock repo, finish the paywall screen"
                  className="bg-[#181614] border-[var(--gold)]/30 text-sm h-11 text-[var(--fg)] placeholder:text-[var(--faint)] focus-visible:ring-[var(--gold)]"
                />
              </div>

              {/* If-Then */}
              <div>
                <label className="text-xs font-mono uppercase text-[var(--muted)] tracking-wider block mb-1">
                  If-Then Implementation Intention
                </label>
                <Input
                  value={ifThen}
                  onChange={(e) => setIfThen(e.target.value)}
                  placeholder="If I wake up tired, then I still do 45 minutes of the Big Rock first."
                  className="bg-[#181614] border-[var(--line)] text-sm h-11 text-[var(--fg)] placeholder:text-[var(--faint)] focus-visible:ring-[var(--gold)]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions Bar */}
        <div className="p-4 border-t border-[var(--line)] bg-[#141210] flex items-center justify-between gap-3">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
              className="h-11 px-4 rounded-xl border-[var(--line)] bg-transparent text-[var(--muted)] hover:text-[var(--fg)] hover:bg-white/5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button
              type="button"
              onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
              className="h-11 px-6 rounded-xl bg-[var(--gold)] hover:bg-[#b8985c] active:scale-[0.98] text-[#12110F] font-semibold text-sm flex-1 ml-auto max-w-[180px] shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              disabled={submitting}
              onClick={handleSaveAndClose}
              className="h-11 px-6 rounded-xl bg-[var(--gold)] hover:bg-[#b8985c] active:scale-[0.98] text-[#12110F] font-semibold text-sm flex-1 shadow-md shadow-[var(--gold)]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {submitting ? 'Saving...' : 'Close the Day'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

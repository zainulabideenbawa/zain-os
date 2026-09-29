'use client';

import React, { useState } from 'react';
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
      <DialogContent className="fixed inset-0 z-50 max-w-lg w-full h-[100dvh] p-0 bg-neutral-950 text-white flex flex-col border-none overflow-hidden focus:outline-none">
        <DialogTitle className="sr-only">Muhasaba and Plan Flow</DialogTitle>

        {/* Top Header */}
        <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-white/5 bg-neutral-900/60 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                Step {step} of 3
              </span>
              <span className="text-neutral-600">·</span>
              <span className="text-xs text-neutral-400">
                {step === 1 && 'Tick Habits'}
                {step === 2 && 'Evening Muhasaba'}
                {step === 3 && 'Plan Tomorrow'}
              </span>
            </div>
            <h2 className="font-cormorant text-2xl font-semibold text-white tracking-wide mt-0.5">
              {step === 1 && 'Confirm Today’s Taps'}
              {step === 2 && 'Self-Accounting (Muhasaba)'}
              {step === 3 && 'Decide at Night, Execute at Dawn'}
            </h2>
          </div>

          <button
            onClick={() => onOpenChange(false)}
            className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Step Content */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
          {/* STEP 1: TICK */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-400">
                Review and adjust your habits logged today before closing the day.
              </p>

              <div className="space-y-2">
                {habits.map((habit) => {
                  const log = dayLogsMap[habit.id];
                  const doneMin = log?.done_min ?? false;
                  const doneTarget = log?.done_target ?? false;

                  return (
                    <div
                      key={habit.id}
                      className="p-3.5 rounded-xl bg-neutral-900/70 border border-white/5 flex items-center justify-between"
                    >
                      <div className="pr-2">
                        <p className="text-sm font-medium text-neutral-200">
                          {habit.name}
                        </p>
                        <p className="text-[11px] text-neutral-500 capitalize">
                          {habit.checkpoint} · {habit.pillar}
                          {habit.is_minimum && ' · Non-negotiable'}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleToggleHabit(habit.id, 'done_min', doneMin)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                            doneMin
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-white/5 text-neutral-400 hover:bg-white/10'
                          }`}
                        >
                          Min
                        </button>
                        {habit.target_value && (
                          <button
                            onClick={() => handleToggleHabit(habit.id, 'done_target', doneTarget)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                              doneTarget
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                : 'bg-white/5 text-neutral-400 hover:bg-white/10'
                            }`}
                          >
                            Target
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: MUHASABA */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Energy 1-5 */}
              <div>
                <label className="text-xs font-mono uppercase text-neutral-400 tracking-wider block mb-2">
                  Energy today (1–5)
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setEnergy(lvl)}
                      className={`h-11 rounded-xl text-sm font-mono font-semibold transition-all ${
                        energy === lvl
                          ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                          : 'bg-neutral-900 border border-white/5 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Khushu 1-3 */}
              <div>
                <label className="text-xs font-mono uppercase text-neutral-400 tracking-wider block mb-2">
                  Khushu in salah
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {KHUSHU_OPTIONS.map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setKhushu(opt.val)}
                      className={`h-11 rounded-xl text-xs font-medium transition-all ${
                        khushu === opt.val
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                          : 'bg-neutral-900 border border-white/5 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* What went well? */}
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  What went well? <span className="text-neutral-500 text-[10px]">(Cookie Jar)</span>
                </label>
                <Input
                  value={wentWell}
                  onChange={(e) => setWentWell(e.target.value)}
                  placeholder="e.g. Shipped the onboarding flow before Dhuhr"
                  className="bg-neutral-900 border-white/10 text-sm h-11"
                />
              </div>

              {/* What didn't, and why? */}
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  What didn’t, and why?
                </label>
                <Input
                  value={wentWrong}
                  onChange={(e) => setWentWrong(e.target.value)}
                  placeholder="e.g. Checked Twitter after lunch instead of rest"
                  className="bg-neutral-900 border-white/10 text-sm h-11 mb-2"
                />

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {BARRIER_OPTIONS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setBarrier(chip)}
                      className={`px-3 py-1 rounded-full text-xs font-mono capitalize transition-colors ${
                        barrier === chip
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                          : 'bg-neutral-900 border border-white/5 text-neutral-500 hover:text-neutral-300'
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* What do I own? */}
              <div>
                <label className="text-xs font-medium text-neutral-400 block mb-1">
                  What do I own about today? <span className="text-neutral-600 text-[10px]">(optional)</span>
                </label>
                <Input
                  value={owned}
                  onChange={(e) => setOwned(e.target.value)}
                  placeholder="e.g. I stayed up 20 mins late last night."
                  className="bg-neutral-900 border-white/10 text-sm h-11"
                />
              </div>

              {/* Shukr / Istighfar */}
              <div>
                <label className="text-xs font-medium text-neutral-400 block mb-1">
                  Shukr or istighfar <span className="text-neutral-600 text-[10px]">(optional)</span>
                </label>
                <Input
                  value={shukr}
                  onChange={(e) => setShukr(e.target.value)}
                  placeholder="Astaghfirullah wa atoobu ilayh"
                  className="bg-neutral-900 border-white/10 text-sm h-11"
                />
              </div>
            </div>
          )}

          {/* STEP 3: PLAN TOMORROW */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Tomorrow Context Card */}
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-white/5 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="font-mono">{tomorrowDate}</span>
                  <span className="capitalize">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][tomorrowParts.weekday]}</span>
                </div>
                {isTomorrowTahajjud ? (
                  <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <Moon className="w-3.5 h-3.5" />
                    <span>Tahajjud Morning · Alarm at 04:45</span>
                  </div>
                ) : (
                  <div className="text-neutral-500">Regular morning schedule · Fajr jamaat</div>
                )}
                <div className="text-[11px] text-neutral-500 pt-1 border-t border-white/5">
                  07:30–09:30 Big Rock · 09:30 Sales standup
                </div>
              </div>

              {/* Focusing Question */}
              <div>
                <label className="text-xs font-mono uppercase text-emerald-400 tracking-wider block mb-1">
                  The Focusing Question
                </label>
                <p className="text-xs text-neutral-400 mb-2 italic">
                  "What's the ONE thing tomorrow that makes everything else easier?"
                </p>
                <Input
                  value={focusingQ}
                  onChange={(e) => setFocusingQ(e.target.value)}
                  className="bg-neutral-900 border-white/10 text-sm h-11"
                />
              </div>

              {/* Top 3 Priorities */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase text-neutral-400 tracking-wider block">
                  Top 3 Priorities
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center font-mono text-xs text-amber-400 font-semibold">1</span>
                    <Input
                      value={top1}
                      onChange={(e) => setTop1(e.target.value)}
                      placeholder="#1 Priority (WIG)"
                      className="bg-neutral-900 border-white/10 text-sm h-10"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center font-mono text-xs text-neutral-500 font-semibold">2</span>
                    <Input
                      value={top2}
                      onChange={(e) => setTop2(e.target.value)}
                      placeholder="#2 Priority"
                      className="bg-neutral-900 border-white/10 text-sm h-10"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center font-mono text-xs text-neutral-500 font-semibold">3</span>
                    <Input
                      value={top3}
                      onChange={(e) => setTop3(e.target.value)}
                      placeholder="#3 Priority"
                      className="bg-neutral-900 border-white/10 text-sm h-10"
                    />
                  </div>
                </div>
              </div>

              {/* Big Rock First Action (REQUIRED) */}
              <div>
                <label className="text-xs font-mono uppercase text-amber-400 tracking-wider block mb-1">
                  Big Rock First Action (Required)
                </label>
                <p className="text-[11px] text-neutral-500 mb-2">
                  What exact file or screen do you open at 07:30?
                </p>
                <Input
                  value={bigRockFirstAction}
                  onChange={(e) => setBigRockFirstAction(e.target.value)}
                  placeholder="e.g. Open PayClock repo, finish the paywall screen"
                  className="bg-neutral-900 border-amber-500/30 text-sm h-11 focus-visible:ring-amber-500"
                />
              </div>

              {/* If-Then */}
              <div>
                <label className="text-xs font-mono uppercase text-neutral-400 tracking-wider block mb-1">
                  If-Then Implementation Intention
                </label>
                <Input
                  value={ifThen}
                  onChange={(e) => setIfThen(e.target.value)}
                  placeholder="If I wake up tired, then I still do 45 minutes of the Big Rock first."
                  className="bg-neutral-900 border-white/10 text-sm h-11"
                />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions Bar */}
        <div className="p-4 border-t border-white/5 bg-neutral-900/60 backdrop-blur-md flex items-center justify-between gap-3">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
              className="h-12 px-4 rounded-xl border-white/10 text-neutral-300 hover:text-white"
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
              className="h-12 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex-1 ml-auto max-w-[200px]"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              disabled={submitting}
              onClick={handleSaveAndClose}
              className="h-12 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold flex-1 shadow-lg shadow-amber-500/20"
            >
              {submitting ? 'Saving...' : 'Close the Day'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

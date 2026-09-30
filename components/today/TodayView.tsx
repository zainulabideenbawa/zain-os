'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Flame, Shield, Moon, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import {
  type DayPrayerTimes,
  type PrayerSlot,
  getHabitAssignedTime,
} from '@/lib/prayer';
import type { Database } from '@/lib/database.types';
import { IdentityCard } from './IdentityCard';
import { BigRockCard } from './BigRockCard';
import { CheckpointDrawer } from './CheckpointDrawer';
import { ParkIdeaDialog } from './ParkIdeaDialog';
import { MuhasabaSheet } from './MuhasabaSheet';
import { DayKeptOverlay } from './DayKeptOverlay';
import { toggleHabitLog, toggleBadDayMode } from '@/app/actions/today';
import { enqueueOfflineAction } from '@/lib/offline-sync';
import { toast } from 'sonner';

type Habit = Database['public']['Tables']['habits']['Row'];
type DayLog = Database['public']['Tables']['day_logs']['Row'];
type Day = Database['public']['Tables']['days']['Row'];
type FocusSession = Database['public']['Tables']['focus_sessions']['Row'];

export interface StreakInfo {
  current: number;
  state: string;
  freezes_banked: number;
}

export interface TodayViewProps {
  date: string;
  cycleWeek: number;
  initialDay: Day | null;
  initialDayLogs: DayLog[];
  habits: Habit[];
  prayerSchedule: DayPrayerTimes;
  streak: StreakInfo | null;
  initialActiveSession?: FocusSession | null;
  initialCompletedMinutes?: number;
}

export function TodayView({
  date,
  cycleWeek,
  initialDay,
  initialDayLogs,
  habits,
  prayerSchedule,
  streak,
  initialActiveSession = null,
  initialCompletedMinutes = 0,
}: TodayViewProps) {
  const [badDayMode, setBadDayMode] = useState(Boolean(initialDay?.bad_day));
  const [selectedSlot, setSelectedSlot] = useState<PrayerSlot | null>(null);
  const [parkDialogOpen, setParkDialogOpen] = useState(false);
  const [muhasabaOpen, setMuhasabaOpen] = useState(false);
  const [dayKeptOpen, setDayKeptOpen] = useState(false);
  const [keptStreak, setKeptStreak] = useState(streak?.current ?? 1);

  const planObj = initialDay?.plan as { big_rock_first_action?: string } | null;
  const firstAction = planObj?.big_rock_first_action || null;

  // Map day logs by habit_id for instant O(1) optimistic lookups
  const [dayLogsMap, setDayLogsMap] = useState<Record<string, DayLog>>(() => {
    const map: Record<string, DayLog> = {};
    for (const log of initialDayLogs) {
      map[log.habit_id] = log;
    }
    return map;
  });

  const handleToggleBadDay = async (enabled: boolean) => {
    setBadDayMode(enabled);
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }

    if (enabled) {
      toast.info('Bad Day Mode engaged: Focus on 5 prayers and 1-line Muhasaba.');
    } else {
      toast.success('Standard mode restored. Aim for the full targets!');
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      await enqueueOfflineAction({
        action: 'toggleBadDay',
        payload: { date, badDay: enabled },
      });
      return;
    }

    const res = await toggleBadDayMode({ date, badDay: enabled });
    if (!res.success) {
      setBadDayMode(!enabled);
      toast.error('Failed to update Bad Day mode');
    }
  };

  const handleToggleHabit = async (
    habitId: string,
    field: 'done_min' | 'done_target',
    nextVal: boolean
  ) => {
    // 1. Instant optimistic update
    const current = dayLogsMap[habitId];
    const updated: DayLog = {
      habit_id: habitId,
      date,
      user_id: current?.user_id || '',
      done_min: field === 'done_min' ? nextVal : (field === 'done_target' && nextVal ? true : (current?.done_min ?? false)),
      done_target: field === 'done_target' ? nextVal : (current?.done_target ?? false),
      value: current?.value ?? 0,
      updated_at: new Date().toISOString(),
    };

    setDayLogsMap((prev) => ({
      ...prev,
      [habitId]: updated,
    }));

    // 2. Haptic feedback
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }

    // 3. Offline queue or Server Action
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      await enqueueOfflineAction({
        action: 'toggleHabit',
        payload: { habitId, date, field, value: nextVal },
      });
      return;
    }

    const res = await toggleHabitLog({
      habitId,
      date,
      field,
      value: nextVal,
    });

    if (!res.success) {
      // Revert optimistic update
      setDayLogsMap((prev) => ({
        ...prev,
        [habitId]: current || updated,
      }));
      toast.error('Failed to save habit status');
    }
  };

  // Group habits by anchor and active day of the week
  const [year, month, day] = date.split('-').map(Number);
  const currentDayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

  const getHabitsForSlot = (slotName: string) => {
    return habits.filter((h) => {
      if (h.checkpoint !== slotName) return false;
      if (h.days && Array.isArray(h.days) && h.days.length > 0) {
        return h.days.includes(currentDayOfWeek);
      }
      return true;
    });
  };

  const currentStreakCount = streak?.current ?? 1;
  const bankedFreezes = streak?.freezes_banked ?? 0;

  return (
    <div className="space-y-6">
      {/* Top Header Controls: Streak Status + Bad Day Mode */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[var(--gold)]/10 border border-[var(--gold)]/20 text-xs font-mono font-medium text-[var(--gold)]">
            <Flame className="w-3.5 h-3.5 fill-[var(--gold)]" />
            <span>{currentStreakCount}</span>
          </div>

          <div className="flex items-center gap-1 text-xs font-mono text-[var(--muted)]">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>{bankedFreezes}/2</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="bad-day-toggle" className="text-xs font-mono text-[var(--muted)] flex items-center gap-1.5 cursor-pointer">
            <Moon className="w-3.5 h-3.5" />
            <span>Bad Day</span>
          </label>
          <Switch
            id="bad-day-toggle"
            checked={badDayMode}
            onCheckedChange={handleToggleBadDay}
            aria-label="Bad Day Mode"
          />
        </div>
      </div>

      {/* Bad Day Mode Banner (Visible only when active) */}
      {badDayMode && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-300/90 leading-relaxed flex items-center gap-2"
        >
          <Moon className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Bad Day Mode active. All targets hidden. Focus exclusively on the 5 salah minimums.
          </span>
        </motion.div>
      )}

      {/* Identity & Morning Plan Anchor */}
      <IdentityCard
        date={date}
        confirmedAt={initialDay?.confirmed_at || null}
        cycleWeek={cycleWeek}
      />

      {/* The Big Rock (07:30 – 09:30) */}
      <BigRockCard
        onOpenParkDialog={() => setParkDialogOpen(true)}
        isBadDay={badDayMode}
        firstAction={firstAction}
        initialActiveSession={initialActiveSession}
        initialCompletedMinutes={initialCompletedMinutes}
      />

      {/* Five Daily Salah Checkpoints */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-mono uppercase tracking-wider text-[var(--muted)]">
            Five Salah Checkpoints
          </h2>
          <span className="text-[10px] font-mono text-[var(--muted)]">
            Tap to open
          </span>
        </div>

        <div className="space-y-2.5">
          {prayerSchedule.list.map((slot) => {
            const slotHabits = getHabitsForSlot(slot.name);
            const completedCount = slotHabits.filter(
              (h) => dayLogsMap[h.id]?.done_min
            ).length;
            const allCompleted = slotHabits.length > 0 && completedCount === slotHabits.length;

            return (
              <motion.div
                key={slot.name}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedSlot(slot)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  allCompleted
                    ? 'bg-[var(--emerald)]/5 border-[var(--emerald)]/30'
                    : 'bg-[var(--card)] border-[var(--border)] hover:border-[var(--card-hover-border)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      allCompleted
                        ? 'bg-[var(--emerald)]/10 text-[var(--emerald)]'
                        : 'bg-[var(--bg)] border border-[var(--border)] text-[var(--muted)]'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-[var(--fg)]">
                        {slot.label}
                      </span>
                      <span className="font-amiri text-xs text-[var(--gold)] ml-1" dir="rtl">
                        {slot.arabic}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[var(--muted)]">
                      <span>Azan {slot.azanStr}</span> ·{' '}
                      <span className="text-[var(--gold)]">Jamaat {slot.jamaatStr}</span>
                    </div>

                    {/* Assigned Tasks & Times Preview */}
                    {slotHabits.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {slotHabits.map((h) => {
                          const isDone = Boolean(dayLogsMap[h.id]?.done_min);
                          const assignedTime = getHabitAssignedTime(h.key, slot);
                          return (
                            <span
                              key={h.id}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono border transition-colors ${
                                isDone
                                  ? 'bg-[var(--emerald)]/10 text-[var(--emerald)] border-[var(--emerald)]/20 line-through opacity-75'
                                  : 'bg-[var(--bg)] text-[var(--muted)] border-[var(--border)]'
                              }`}
                            >
                              <span>{h.name}</span>
                              {assignedTime && (
                                <span className="text-[var(--gold)] font-medium text-[9px]">
                                  ({assignedTime})
                                </span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {slotHabits.length > 0 && (
                    <span
                      className={`text-xs font-mono px-2 py-0.5 rounded-lg border ${
                        allCompleted
                          ? 'bg-[var(--emerald)]/10 text-[var(--emerald)] border-[var(--emerald)]/30'
                          : 'bg-[var(--bg)] text-[var(--muted)] border-[var(--border)]'
                      }`}
                    >
                      {completedCount}/{slotHabits.length}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-[var(--muted)]" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Evening Muhasaba & Plan Flow */}
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={() => setMuhasabaOpen(true)}
        className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/30 to-indigo-950/30 border border-purple-800/40 hover:border-purple-700/60 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-lg shadow-purple-950/20"
      >
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-semibold text-purple-200">
              Evening Muhasaba & Plan
            </h4>
          </div>
          <p className="text-xs text-purple-300/80 leading-relaxed">
            Audit wins, log dhikr, and decide tomorrow&apos;s Big Rock.
          </p>
        </div>

        <Button
          size="sm"
          className="h-9 px-3.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-medium shrink-0 cursor-pointer shadow-md"
        >
          Start Flow
          <ChevronRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </motion.div>

      {/* Checkpoint Habits Drawer */}
      <CheckpointDrawer
        open={Boolean(selectedSlot)}
        onOpenChange={(open) => !open && setSelectedSlot(null)}
        slot={selectedSlot}
        habits={selectedSlot ? getHabitsForSlot(selectedSlot.name) : []}
        dayLogs={dayLogsMap}
        onToggleHabit={handleToggleHabit}
        isBadDay={badDayMode}
      />

      {/* Park Idea Dialog */}
      <ParkIdeaDialog
        open={parkDialogOpen}
        onOpenChange={setParkDialogOpen}
      />

      {/* Evening Muhasaba 3-Step Sheet */}
      <MuhasabaSheet
        open={muhasabaOpen}
        onOpenChange={setMuhasabaOpen}
        date={date}
        habits={habits}
        dayLogsMap={dayLogsMap}
        onLogUpdated={(habitId, field, val) => {
          setDayLogsMap((prev) => ({
            ...prev,
            [habitId]: {
              ...(prev[habitId] || {
                date,
                user_id: '',
                habit_id: habitId,
                value: 0,
                done_min: false,
                done_target: false,
                updated_at: new Date().toISOString(),
              }),
              [field]: val,
              ...(field === 'done_target' && val ? { done_min: true } : {}),
            },
          }));
        }}
        onDayKept={(stk) => {
          setKeptStreak(stk);
          setDayKeptOpen(true);
        }}
      />

      {/* Day Kept Celebration Overlay */}
      <DayKeptOverlay
        open={dayKeptOpen}
        streak={keptStreak}
        onClose={() => setDayKeptOpen(false)}
      />
    </div>
  );
}

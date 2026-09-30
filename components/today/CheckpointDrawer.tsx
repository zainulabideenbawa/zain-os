'use client';

import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { motion } from 'motion/react';
import { Check, Clock } from 'lucide-react';
import { type PrayerSlot, getHabitAssignedTime } from '@/lib/prayer';
import type { Database } from '@/lib/database.types';

type Habit = Database['public']['Tables']['habits']['Row'];
type DayLog = Database['public']['Tables']['day_logs']['Row'];

interface CheckpointDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slot: PrayerSlot | null;
  habits: Habit[];
  dayLogs: Record<string, DayLog>;
  onToggleHabit: (habitId: string, field: 'done_min' | 'done_target', nextVal: boolean) => void;
  isBadDay: boolean;
}

export function CheckpointDrawer({
  open,
  onOpenChange,
  slot,
  habits,
  dayLogs,
  onToggleHabit,
  isBadDay,
}: CheckpointDrawerProps) {
  if (!slot) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-[var(--card)] border-t border-[var(--border)] max-w-[430px] mx-auto p-4 pb-8 space-y-5">
        <DrawerHeader className="text-left px-0 pb-2 border-b border-[var(--border)] flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-lg">{slot.emoji}</span>
              <DrawerTitle className="font-serif text-2xl font-semibold text-[var(--fg)]">
                {slot.label}
              </DrawerTitle>
              <span className="font-amiri text-lg text-[var(--gold)] ml-1" dir="rtl">
                {slot.arabic}
              </span>
            </div>
            <DrawerDescription className="text-xs font-mono text-[var(--muted)] flex items-center gap-2">
              <span>Azan {slot.azanStr}</span>
              <span>·</span>
              <span className="text-[var(--gold)] font-medium">Jamaat {slot.jamaatStr}</span>
            </DrawerDescription>
          </div>

          <div className="px-2.5 py-1 rounded-full bg-[var(--bg)] border border-[var(--border)] text-[11px] font-mono text-[var(--muted)]">
            Checkpoint
          </div>
        </DrawerHeader>

        {/* Checkpoint Habits */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--muted)]">
              Habits & Commitments
            </h4>
            <span className="text-[10px] font-mono text-[var(--muted)]">
              Min / Target
            </span>
          </div>

          {habits.length === 0 ? (
            <p className="text-xs text-[var(--muted)] py-4 text-center">
              No habits scheduled for this checkpoint. Protect the prayer anchor!
            </p>
          ) : (
            <div className="space-y-2">
              {habits.map((habit) => {
                const log = dayLogs[habit.id];
                const isMinDone = Boolean(log?.done_min);
                const isTargetDone = Boolean(log?.done_target);

                const assignedTime = getHabitAssignedTime(habit.key, slot);

                return (
                  <div
                    key={habit.id}
                    className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="text-xs font-medium text-[var(--fg)] truncate">
                          {habit.name}
                        </h5>
                        {assignedTime && (
                          <span className="px-1.5 py-0.5 rounded bg-[var(--gold)]/10 border border-[var(--gold)]/20 text-[var(--gold)] font-mono text-[10px] shrink-0 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{assignedTime}</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--muted)]">
                        <span>Min: {habit.min_value ?? 1}</span>
                        {!isBadDay && habit.target_value && (
                          <>
                            <span>·</span>
                            <span className="text-[var(--gold)]">Target: {habit.target_value}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Minimum and Target Tap Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Minimum Checkbox */}
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => onToggleHabit(habit.id, 'done_min', !isMinDone)}
                        className={`h-8 px-2.5 rounded-lg text-[11px] font-mono font-medium flex items-center gap-1 transition-all cursor-pointer ${
                          isMinDone
                            ? 'bg-[var(--emerald)]/20 text-[var(--emerald)] border border-[var(--emerald)]/40 shadow-sm'
                            : 'bg-[var(--card)] text-[var(--muted)] border border-[var(--border)] hover:border-[var(--card-hover-border)]'
                        }`}
                      >
                        <Check className={`w-3.5 h-3.5 ${isMinDone ? 'opacity-100' : 'opacity-40'}`} />
                        <span>Min</span>
                      </motion.button>

                      {/* Target Checkbox (Dimmed/hidden in Bad Day Mode) */}
                      {!isBadDay && habit.target_value && (
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => onToggleHabit(habit.id, 'done_target', !isTargetDone)}
                          className={`h-8 px-2.5 rounded-lg text-[11px] font-mono font-medium flex items-center gap-1 transition-all cursor-pointer ${
                            isTargetDone
                              ? 'bg-[var(--gold)]/20 text-[var(--gold)] border border-[var(--gold)]/40 shadow-sm'
                              : 'bg-[var(--card)] text-[var(--muted)] border border-[var(--border)] hover:border-[var(--card-hover-border)]'
                          }`}
                        >
                          <Check className={`w-3.5 h-3.5 ${isTargetDone ? 'opacity-100' : 'opacity-40'}`} />
                          <span>Target</span>
                        </motion.button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Check } from 'lucide-react';
import type { Database } from '@/lib/database.types';
import { importPastDay } from '@/app/actions/import';
import { getYesterdayDate, getLogicalDate } from '@/lib/time';
import { toast } from 'sonner';

type Habit = Database['public']['Tables']['habits']['Row'];

interface ImportPastDaysDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habits: Habit[];
}

export function ImportPastDaysDialog({
  open,
  onOpenChange,
  habits,
}: ImportPastDaysDialogProps) {
  const yesterday = getYesterdayDate(getLogicalDate());
  const [selectedDate, setSelectedDate] = useState(yesterday);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [wentWell, setWentWell] = useState('');
  const [importing, setImporting] = useState(false);

  const minHabits = habits.filter((h) => h.is_minimum);

  const toggleHabit = (id: string) => {
    setCompletedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setCompletedIds(minHabits.map((h) => h.id));
  };

  const handleImport = async () => {
    if (!selectedDate) {
      toast.error('Please select a date.');
      return;
    }

    setImporting(true);
    try {
      const res = await importPastDay({
        date: selectedDate,
        completedHabitIds: completedIds,
        wentWell: wentWell.trim() || undefined,
      });

      if (!res.success) {
        toast.error(`Error importing day: ${res.error}`);
        return;
      }

      toast.success(
        res.dayKept
          ? `Imported ${selectedDate}: Day Kept! Streak updated to ${res.currentStreak}.`
          : `Imported ${selectedDate} logs successfully.`
      );
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error('Failed to import past day');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full max-h-[90vh] bg-neutral-950 text-white border border-white/10 rounded-2xl flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-5 border-b border-white/5 bg-neutral-900/50">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span className="font-mono text-xs text-amber-400 font-semibold uppercase tracking-wider">
              Apple Notes Backfill
            </span>
          </div>
          <DialogTitle className="font-cormorant text-2xl font-semibold text-white mt-1">
            Import Past Day
          </DialogTitle>
          <p className="text-xs text-neutral-400">
            Tick minimums for days already logged before Zain OS launch.
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Date Picker */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 block mb-1.5">
              Select Past Date (Cycle Start: 2026-09-28)
            </label>
            <Input
              type="date"
              min="2026-09-28"
              max={yesterday}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-neutral-900 border-white/10 text-xs h-10 font-mono"
            />
          </div>

          {/* Quick Select All */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              Completed Minimums ({completedIds.length}/{minHabits.length})
            </label>
            <button
              type="button"
              onClick={selectAll}
              className="text-xs font-mono text-emerald-400 hover:underline"
            >
              Select All Minimums
            </button>
          </div>

          {/* Habits Checkbox List */}
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {minHabits.map((h) => {
              const checked = completedIds.includes(h.id);
              return (
                <div
                  key={h.id}
                  onClick={() => toggleHabit(h.id)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    checked
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-neutral-900/60 border-white/5 text-neutral-400 hover:border-white/10'
                  }`}
                >
                  <span className="text-xs font-medium">{h.name}</span>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                      checked
                        ? 'bg-emerald-500 border-emerald-500 text-black'
                        : 'border-white/20'
                    }`}
                  >
                    {checked && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* What went well */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 block mb-1.5">
              What went well on this day? (Optional Cookie Jar entry)
            </label>
            <Input
              value={wentWell}
              onChange={(e) => setWentWell(e.target.value)}
              placeholder="e.g. Completed 90 min deep work on landing page"
              className="bg-neutral-900 border-white/10 text-xs h-10"
            />
          </div>
        </div>

        <div className="p-4 border-t border-white/5 bg-neutral-900/60 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-white/10 text-xs"
          >
            Cancel
          </Button>
          <Button
            disabled={importing}
            onClick={handleImport}
            className="bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs px-5 shadow-lg shadow-amber-500/20"
          >
            {importing ? 'Importing...' : 'Import & Recalculate'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

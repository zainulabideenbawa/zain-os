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
import { Flame, CheckCircle, ShieldCheck, PhoneOff, Users } from 'lucide-react';
import { saveSundayReview } from '@/app/actions/review';
import { toast } from 'sonner';

interface SundayReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weekStart: string;
  cycleWeek: number;
  streak: number;
  deepWorkHours: number;
  weeklyScore: number;
  keptDays: number;
}

export function SundayReviewDialog({
  open,
  onOpenChange,
  weekStart,
  cycleWeek,
  streak,
  deepWorkHours,
  weeklyScore,
  keptDays,
}: SundayReviewDialogProps) {
  // Roles check (4 items per spec §4.6)
  const [familyEvenings, setFamilyEvenings] = useState(true);
  const [parentsKin, setParentsKin] = useState(true);
  const [actOfService, setActOfService] = useState(false);
  const [thankedTeam, setThankedTeam] = useState(true);

  // Phone rules (2 items per spec §4.6)
  const [outsideBedroom, setOutsideBedroom] = useState(true);
  const [socialWindows, setSocialWindows] = useState(true);

  const [nextFocus, setNextFocus] = useState('');
  const [saving, setSaving] = useState(false);

  // Win condition per spec §5:
  // Week 1: kept_days >= 6 | Week 2: score >= 0.70 | Week 3+: score >= 0.85
  const isWin =
    cycleWeek === 1
      ? keptDays >= 6
      : cycleWeek === 2
      ? weeklyScore >= 70
      : weeklyScore >= 85;

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await saveSundayReview({
        weekStart,
        cycleWeek,
        score: weeklyScore,
        win: isWin,
        keptDays,
        roles: {
          familyEvenings,
          parentsKin,
          actOfService,
          thankedTeam,
        },
        phoneRules: {
          outsideBedroom,
          socialWindows,
        },
        nextFocus: nextFocus.trim() || 'Execute on the Big Rock.',
      });

      if (!res.success) {
        toast.error(`Error saving review: ${res.error}`);
        return;
      }

      toast.success('Sunday review saved. Barakah in your week.');
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error('Failed to save Sunday review');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full max-h-[90vh] bg-neutral-950 text-white border border-white/10 rounded-2xl flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-5 border-b border-white/5 bg-neutral-900/50">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-amber-400 font-semibold uppercase tracking-wider">
              Cycle Week {cycleWeek}
            </span>
            <span className="text-neutral-600">·</span>
            <span className="text-xs text-neutral-400">Weekly Scorecard</span>
          </div>
          <DialogTitle className="font-cormorant text-2xl font-semibold text-white mt-1">
            Sunday Retrospective
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Three Numbers Hero */}
          <div className="p-4 rounded-xl bg-neutral-900 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                The Three Numbers
              </span>
              <span
                className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ${
                  isWin
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-red-500/10 text-red-400 border-red-500/30'
                }`}
              >
                {isWin ? 'Week Won ✓' : 'Week Lost: One Fix'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-neutral-950/60">
                <span className="font-mono text-lg font-bold text-amber-400 block">
                  🔥 {streak}
                </span>
                <span className="text-[10px] text-neutral-400">Streak</span>
              </div>
              <div className="p-2 rounded-lg bg-neutral-950/60">
                <span className="font-mono text-lg font-bold text-sky-400 block">
                  {deepWorkHours}h
                </span>
                <span className="text-[10px] text-neutral-400">Deep Work</span>
              </div>
              <div className="p-2 rounded-lg bg-neutral-950/60">
                <span className="font-mono text-lg font-bold text-emerald-400 block">
                  {weeklyScore}%
                </span>
                <span className="text-[10px] text-neutral-400">Score</span>
              </div>
            </div>
          </div>

          {/* Roles Check (4 toggles) */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <label className="text-xs font-mono uppercase tracking-wider text-neutral-300">
                Roles Check (Beyond the Desk)
              </label>
            </div>

            <div className="space-y-2">
              {[
                {
                  id: 'family',
                  label: 'Family evenings (present & unhurried)',
                  checked: familyEvenings,
                  set: setFamilyEvenings,
                },
                {
                  id: 'parents',
                  label: 'Called or visited parents / kin',
                  checked: parentsKin,
                  set: setParentsKin,
                },
                {
                  id: 'service',
                  label: 'One deliberate act of service',
                  checked: actOfService,
                  set: setActOfService,
                },
                {
                  id: 'team',
                  label: 'Thanked / acknowledged someone on team',
                  checked: thankedTeam,
                  set: setThankedTeam,
                },
              ].map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900/60 border border-white/5 cursor-pointer text-xs"
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => item.set(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 bg-neutral-800 border-white/20 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-neutral-200">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Phone Rules (2 toggles) */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <PhoneOff className="w-4 h-4 text-amber-400" />
              <label className="text-xs font-mono uppercase tracking-wider text-neutral-300">
                Phone Discipline Rules
              </label>
            </div>

            <div className="space-y-2">
              {[
                {
                  id: 'bedroom',
                  label: 'Phone slept outside the bedroom',
                  checked: outsideBedroom,
                  set: setOutsideBedroom,
                },
                {
                  id: 'social',
                  label: 'Kept to two designated social media windows',
                  checked: socialWindows,
                  set: setSocialWindows,
                },
              ].map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900/60 border border-white/5 cursor-pointer text-xs"
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => item.set(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 bg-neutral-800 border-white/20 focus:ring-amber-500 cursor-pointer"
                  />
                  <span className="text-neutral-200">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Next Week's Focus */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-neutral-300 block mb-1.5">
              Next Week's One Line Focus
            </label>
            <Input
              value={nextFocus}
              onChange={(e) => setNextFocus(e.target.value)}
              placeholder="e.g. Ship PayClock billing integration before Friday"
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
            disabled={saving}
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-5 shadow-lg shadow-emerald-600/20"
          >
            {saving ? 'Saving...' : 'Save Weekly Review'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

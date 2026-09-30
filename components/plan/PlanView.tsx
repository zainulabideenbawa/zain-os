'use client';

import React, { useState } from 'react';
import {
  Layers,
  Bookmark,
  CheckSquare,
  Settings,
  Calendar,
  Sparkles,
  Plus,
  Trash2,
  Moon,
  Clock,
  Briefcase,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SettingsDialog } from './SettingsDialog';
import { SundayReviewDialog } from './SundayReviewDialog';
import { ImportPastDaysDialog } from './ImportPastDaysDialog';
import { addParkedItem, deleteParkedItem, updateCyclePersonalProject } from '@/app/actions/plan';
import type { Database } from '@/lib/database.types';
import { toast } from 'sonner';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Cycle = Database['public']['Tables']['cycles']['Row'];
type Habit = Database['public']['Tables']['habits']['Row'];
type Parked = Database['public']['Tables']['parked']['Row'];

interface PlanViewProps {
  profile: Profile | null;
  cycle: Cycle | null;
  habits: Habit[];
  parkedList: Parked[];
  makerHours: number;
  cycleWeek: number;
  daysRemaining: number;
  streak: number;
  weeklyScore: number;
  weekStart: string;
}

const MEETINGS = [
  { label: 'Sales standup + LinkedIn post', days: 'Mon–Fri', time: '09:30–10:00' },
  { label: 'Sales team kickoff', days: 'Mon', time: '11:30–12:15' },
  { label: 'PM updates (incl. Sindh Agri)', days: 'Tue, Thu', time: '11:30–12:00' },
  { label: 'SEO team', days: 'Thu', time: '12:00–12:45' },
];

export function PlanView({
  profile,
  cycle,
  habits,
  parkedList: initialParked,
  makerHours,
  cycleWeek,
  daysRemaining,
  streak,
  weeklyScore,
  weekStart,
}: PlanViewProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  // Parked List State
  const [parked, setParked] = useState<Parked[]>(initialParked);
  const [newParkedText, setNewParkedText] = useState('');
  const [addingParked, setAddingParked] = useState(false);

  // Personal Project
  const [personalProject, setPersonalProject] = useState(
    cycle?.personal_project && cycle.personal_project !== 'TBD'
      ? cycle.personal_project
      : ''
  );
  const [editingProject, setEditingProject] = useState(false);

  const handleAddParked = async () => {
    if (!newParkedText.trim()) return;
    setAddingParked(true);
    try {
      const res = await addParkedItem({ project: newParkedText.trim() });
      if (res.success && res.item) {
        setParked((prev) => [res.item, ...prev]);
        setNewParkedText('');
        toast.success('Idea parked for Sunday review.');
      } else {
        toast.error('Failed to park idea');
      }
    } finally {
      setAddingParked(false);
    }
  };

  const handleDeleteParked = async (id: string) => {
    const res = await deleteParkedItem(id);
    if (res.success) {
      setParked((prev) => prev.filter((p) => p.id !== id));
      toast.success('Parked idea removed.');
    }
  };

  const handleSaveProject = async () => {
    await updateCyclePersonalProject(personalProject);
    setEditingProject(false);
    toast.success('Personal project updated.');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 4-Week / 84-Day Cycle Card */}
      <div className="p-5 rounded-2xl bg-neutral-900/70 border border-white/5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
              84-Day Cycle · Week {cycleWeek} of 12
            </span>
            <h1 className="font-cormorant text-2xl font-bold text-white tracking-wide">
              {cycle?.wig || '5 apps launched & earning'}
            </h1>
          </div>
          <div className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-medium">
            {daysRemaining} days left
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="h-2 w-full rounded-full bg-neutral-800 border border-white/5 overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all"
              style={{
                width: `${Math.round(((84 - daysRemaining) / 84) * 100)}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-neutral-400">
            <span>Day {84 - daysRemaining}</span>
            <span>Day 84 (Dec 20)</span>
          </div>
        </div>

        {/* Shipped apps counter */}
        <div className="p-3 rounded-xl bg-neutral-950/50 border border-white/5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-neutral-300">
            <Target className="w-4 h-4 text-emerald-400" />
            <span>WIG Apps Shipped & Earning</span>
          </div>
          <span className="font-mono font-semibold text-emerald-400">
            0 / 5 Shipped
          </span>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          onClick={() => setSettingsOpen(true)}
          className="h-16 bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-neutral-200 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer"
        >
          <Settings className="w-4 h-4 text-amber-400" />
          <span className="text-[11px] font-medium">Settings</span>
        </Button>

        <Button
          onClick={() => setReviewOpen(true)}
          className="h-16 bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-neutral-200 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer"
        >
          <CheckSquare className="w-4 h-4 text-emerald-400" />
          <span className="text-[11px] font-medium">Sunday Review</span>
        </Button>

        <Button
          onClick={() => setImportOpen(true)}
          className="h-16 bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-neutral-200 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer"
        >
          <Calendar className="w-4 h-4 text-sky-400" />
          <span className="text-[11px] font-medium">Import Days</span>
        </Button>
      </div>

      {/* Maker Blocks Section */}
      <div className="p-5 rounded-2xl bg-neutral-900/70 border border-white/5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-300">
              Maker Blocks (Personal Project)
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-semibold">
            {makerHours}h / ≥ 3h
          </span>
        </div>

        {/* Project Name */}
        <div className="p-3 rounded-xl bg-neutral-950/60 border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">Current Focus Project</span>
            <button
              onClick={() => setEditingProject(!editingProject)}
              className="text-[11px] font-mono text-amber-400 hover:underline"
            >
              {editingProject ? 'Cancel' : 'Switch Project'}
            </button>
          </div>

          {editingProject ? (
            <div className="flex gap-2">
              <Input
                value={personalProject}
                onChange={(e) => setPersonalProject(e.target.value)}
                placeholder="e.g. PayClock, SolSniper, etc."
                className="bg-neutral-900 border-white/10 text-xs h-9"
              />
              <Button
                size="sm"
                onClick={handleSaveProject}
                className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold px-3 cursor-pointer"
              >
                Save
              </Button>
            </div>
          ) : personalProject ? (
            <p className="text-sm font-semibold text-white">
              {personalProject}
            </p>
          ) : (
            <div className="pt-0.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingProject(true)}
                className="border-[var(--gold)]/40 text-[var(--gold)] hover:bg-[var(--gold)]/10 text-xs font-mono h-8 cursor-pointer"
              >
                Pick your personal project
              </Button>
            </div>
          )}

          <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, Math.round((makerHours / 3) * 100))}%` }}
            />
          </div>
        </div>

        <p className="text-[11px] text-neutral-400 leading-relaxed">
          Friday 14:30–16:30 & Saturday 11:30–13:15 dedicated to shipping your personal ventures.
        </p>
      </div>

      {/* This Week: Targets, Tahajjud, and Meetings */}
      <div className="p-5 rounded-2xl bg-neutral-900/70 border border-white/5 space-y-4 shadow-xl">
        <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-300">
          This Week&apos;s Architecture
        </h3>

        {/* Tahajjud Nights */}
        <div className="p-3 rounded-xl bg-neutral-950/60 border border-white/5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <Moon className="w-3.5 h-3.5" />
            <span>Tahajjud Nights (Pre-dawn wakeups)</span>
          </div>
          <p className="text-[11px] text-neutral-400">
            Sunday, Wednesday, and Friday mornings at 04:45. Reminder sent at 21:30 the evening prior.
          </p>
        </div>

        {/* Meetings List */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-neutral-400 block">
            Scheduled Weekly Meetings
          </span>
          <div className="space-y-1.5">
            {MEETINGS.map((m, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-neutral-950/40 border border-white/5 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <span className="font-medium text-neutral-200 block">
                    {m.label}
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    {m.days}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-amber-400 shrink-0">
                  {m.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Parked List */}
      <div className="p-5 rounded-2xl bg-neutral-900/70 border border-white/5 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-300">
              Parked List ({parked.length})
            </h3>
          </div>
          <span className="text-[10px] font-mono text-neutral-400">
            Reviewed Sundays
          </span>
        </div>

        {/* Inline Add Input */}
        <div className="flex gap-2">
          <Input
            value={newParkedText}
            onChange={(e) => setNewParkedText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddParked()}
            placeholder="Quick park an idea..."
            className="bg-neutral-950/60 border-white/10 text-xs h-9"
          />
          <Button
            size="sm"
            disabled={addingParked}
            onClick={handleAddParked}
            className="h-9 px-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* List of items */}
        {parked.length === 0 ? (
          <p className="text-xs text-neutral-400 text-center py-4">
            Zero parked thoughts. Head is clear for deep work.
          </p>
        ) : (
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {parked.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-lg bg-neutral-950/50 border border-white/5 flex items-center justify-between gap-2 text-xs"
              >
                <span className="text-neutral-200">{item.project}</span>
                <button
                  onClick={() => handleDeleteParked(item.id)}
                  className="text-neutral-400 hover:text-red-400 transition-colors p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialog Modals */}
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        profile={profile}
        habits={habits}
      />

      <SundayReviewDialog
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        weekStart={weekStart}
        cycleWeek={cycleWeek}
        streak={streak}
        deepWorkHours={makerHours}
        weeklyScore={weeklyScore}
        keptDays={streak}
      />

      <ImportPastDaysDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        habits={habits}
      />
    </div>
  );
}

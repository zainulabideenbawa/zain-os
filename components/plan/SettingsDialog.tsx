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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import type { Database } from '@/lib/database.types';
import { updateProfileSettings, updateHabitConfig } from '@/app/actions/plan';
import { toast } from 'sonner';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Habit = Database['public']['Tables']['habits']['Row'];

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile | null;
  habits: Habit[];
}

export function SettingsDialog({
  open,
  onOpenChange,
  profile,
  habits,
}: SettingsDialogProps) {
  const [identityText, setIdentityText] = useState(
    profile?.identity_text ||
      'I am a Muslim who keeps his promises to Allah and to himself, and a builder who ships every day.'
  );
  const [niyyah, setNiyyah] = useState(profile?.niyyah || '');
  const [coachTone, setCoachTone] = useState(profile?.coach_tone || 'direct');
  const [tahajjudDays, setTahajjudDays] = useState<number[]>(
    profile?.tahajjud_days || [0, 3, 5]
  );
  const [saving, setSaving] = useState(false);

  const toggleTahajjudDay = (day: number) => {
    setTahajjudDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateProfileSettings({
        identityText,
        niyyah,
        coachTone,
        tahajjudDays,
      });

      if (!res.success) {
        toast.error(`Error saving settings: ${res.error}`);
        return;
      }

      toast.success('Settings updated successfully.');
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full max-h-[90vh] bg-neutral-950 text-white border border-white/10 rounded-2xl flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-5 border-b border-white/5 bg-neutral-900/50">
          <DialogTitle className="font-cormorant text-2xl font-semibold text-white">
            System Settings
          </DialogTitle>
          <p className="text-xs text-neutral-400">
            Configure your identity, prayer anchors, and habits.
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Identity Line */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 block mb-1.5">
              Identity Statement
            </label>
            <Textarea
              value={identityText}
              onChange={(e) => setIdentityText(e.target.value)}
              className="bg-neutral-900 border-white/10 text-xs min-h-[70px]"
            />
          </div>

          {/* Niyyah */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 block mb-1.5">
              Niyyah (Intention for this cycle)
            </label>
            <Input
              value={niyyah}
              onChange={(e) => setNiyyah(e.target.value)}
              placeholder="e.g. Build financial independence to serve the ummah"
              className="bg-neutral-900 border-white/10 text-xs h-10"
            />
          </div>

          {/* Coach Tone */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 block mb-1.5">
              Coach Tone (Phase 2)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'direct', label: 'Direct' },
                { id: 'gentle', label: 'Gentle' },
                { id: 'jocko', label: 'Jocko' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setCoachTone(t.id)}
                  className={`h-9 rounded-lg text-xs font-medium transition-all ${
                    coachTone === t.id
                      ? 'bg-amber-500 text-black font-semibold'
                      : 'bg-neutral-900 border border-white/5 text-neutral-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tahajjud Nights */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 block mb-1.5">
              Tahajjud Nights (Pre-dawn wakeups)
            </label>
            <div className="grid grid-cols-7 gap-1.5">
              {[
                { day: 0, label: 'Sun' },
                { day: 1, label: 'Mon' },
                { day: 2, label: 'Tue' },
                { day: 3, label: 'Wed' },
                { day: 4, label: 'Thu' },
                { day: 5, label: 'Fri' },
                { day: 6, label: 'Sat' },
              ].map((d) => (
                <button
                  key={d.day}
                  type="button"
                  onClick={() => toggleTahajjudDay(d.day)}
                  className={`h-9 rounded-lg text-xs font-mono font-medium transition-all ${
                    tahajjudDays.includes(d.day)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-900 border border-white/5 text-neutral-500'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-neutral-500 mt-1.5">
              Pre-dawn reminders trigger at 21:30 the evening prior.
            </p>
          </div>

          {/* Habits Min & Target Overview */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 block">
              Configured Habits ({habits.length})
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {habits.map((h) => (
                <div
                  key={h.id}
                  className="p-2.5 rounded-lg bg-neutral-900/60 border border-white/5 flex items-center justify-between text-xs"
                >
                  <span className="font-medium text-neutral-200">{h.name}</span>
                  <span className="font-mono text-[10px] text-neutral-500">
                    Min: {h.min_value || '1'} · Target: {h.target_value || '—'}
                  </span>
                </div>
              ))}
            </div>
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
            className="bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs px-5"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

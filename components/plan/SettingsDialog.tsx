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

          {/* Reminders & Push (P0-2) */}
          <div className="p-3.5 rounded-xl bg-[#141210] border border-[var(--line)] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-[var(--gold)] block">
                  Push Reminders
                </span>
                <p className="text-[11px] text-[var(--muted)]">
                  Status: {typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (!('Notification' in window)) {
                    toast.error('Web notifications are not supported in this browser.');
                    return;
                  }
                  try {
                    const permission = await Notification.requestPermission();
                    if (permission !== 'granted') {
                      toast.error('Notification permission was denied.');
                      return;
                    }
                    const reg = await navigator.serviceWorker.ready;
                    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
                    if (!vapidKey) {
                      toast.error('VAPID key not configured');
                      return;
                    }
                    const { urlBase64ToUint8Array } = await import('@/lib/push-client');
                    const sub = await reg.pushManager.subscribe({
                      userVisibleOnly: true,
                      applicationServerKey: urlBase64ToUint8Array(vapidKey) as unknown as BufferSource,
                    });
                    const subData = sub.toJSON();
                    const res = await fetch('/api/push/subscribe', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        endpoint: subData.endpoint,
                        keys: subData.keys,
                        user_agent: navigator.userAgent,
                      }),
                    });
                    const resData = await res.json().catch(() => ({}));
                    if (!res.ok) {
                      toast.error(resData.error || 'Failed to save subscription on server');
                      return;
                    }
                    toast.success('Reminders enabled and subscription saved!');
                  } catch (err: unknown) {
                    const msg = err instanceof Error ? err.message : 'Failed to enable reminders';
                    toast.error(msg);
                  }
                }}
                className="text-xs h-8 rounded-lg border-[var(--line)] bg-[#181614] text-[var(--fg)] hover:border-[var(--gold)] cursor-pointer"
              >
                Enable Reminders
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    const res = await fetch('/api/push/test', { method: 'POST' });
                    const data = await res.json();
                    if (res.ok && data.success) {
                      toast.success(`Test notification sent! Delivered to ${data.count} device(s).`);
                    } else {
                      toast.error(data.error || 'Failed to send test notification');
                    }
                  } catch (err) {
                    toast.error('Error sending test notification');
                  }
                }}
                className="text-xs h-8 rounded-lg border-[var(--line)] bg-[#181614] text-[var(--gold)] hover:border-[var(--gold)] cursor-pointer"
              >
                Send Test Notification
              </Button>
            </div>
          </div>

          {/* Habits Min & Target Overview */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-[var(--muted)] block">
              Configured Habits ({habits.length})
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {habits.map((h) => (
                <div
                  key={h.id}
                  className="p-2.5 rounded-lg bg-[#141210] border border-[var(--line)] flex items-center justify-between text-xs"
                >
                  <span className="font-medium text-[var(--fg)]">{h.name}</span>
                  <span className="font-mono text-[10px] text-[var(--muted)]">
                    Min: {h.min_value || '1'} · Target: {h.target_value || '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[var(--line)] bg-[#141210] flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[var(--line)] text-xs text-[var(--muted)] hover:text-[var(--fg)] bg-transparent cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            disabled={saving}
            onClick={handleSave}
            className="bg-[var(--gold)] hover:bg-[#b8985c] text-[#12110F] font-semibold text-xs px-5 cursor-pointer active:scale-[0.98] transition-all"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

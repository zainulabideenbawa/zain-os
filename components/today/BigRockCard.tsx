'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Sparkles, PlusCircle, Square, Flame, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { evaluateFocusProgress } from '@/lib/focus';
import { startFocusSession, stopFocusSession, setSessionEnergy } from '@/app/actions/focus';
import { toast } from 'sonner';
import type { Database } from '@/lib/database.types';

type FocusSession = Database['public']['Tables']['focus_sessions']['Row'];

interface BigRockCardProps {
  onOpenParkDialog: () => void;
  isBadDay: boolean;
  firstAction?: string | null;
  initialActiveSession?: FocusSession | null;
  initialCompletedMinutes?: number;
}

export function BigRockCard({
  onOpenParkDialog,
  isBadDay,
  firstAction,
  initialActiveSession = null,
  initialCompletedMinutes = 0,
}: BigRockCardProps) {
  const [focusModalOpen, setFocusModalOpen] = useState(false);
  const [energyModalOpen, setEnergyModalOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<FocusSession | null>(initialActiveSession);
  const [completedMinutes, setCompletedMinutes] = useState(initialCompletedMinutes);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [stoppedSessionId, setStoppedSessionId] = useState<string | null>(null);

  // Sync initial props
  useEffect(() => {
    setActiveSession(initialActiveSession);
    setCompletedMinutes(initialCompletedMinutes);
  }, [initialActiveSession, initialCompletedMinutes]);

  // Live timer interval if session is running
  useEffect(() => {
    if (!activeSession) {
      setElapsedSeconds(0);
      return;
    }

    function updateElapsed() {
      if (!activeSession) return;
      const startMs = new Date(activeSession.started_at).getTime();
      const nowMs = Date.now();
      const diffSecs = Math.max(0, Math.floor((nowMs - startMs) / 1000));
      setElapsedSeconds(diffSecs);
    }

    updateElapsed();
    const timer = setInterval(updateElapsed, 1000);
    return () => clearInterval(timer);
  }, [activeSession]);

  const activeElapsedMins = Math.floor(elapsedSeconds / 60);
  const isRunning = Boolean(activeSession);

  // Data-driven status label per P0-5
  const progress = evaluateFocusProgress(
    completedMinutes,
    90,
    180,
    isRunning,
    activeElapsedMins
  );

  const handleStartSprint = async () => {
    setLoading(true);
    try {
      const res = await startFocusSession({
        blockKey: 'big_rock',
        project: 'WIG',
        mode: 'block',
      });

      if (res.success && res.session) {
        setActiveSession(res.session as FocusSession);
        setFocusModalOpen(false);
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate?.([50, 50, 50]);
        }
        toast.success('Bismillah. Big Rock focus sprint started.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to start session';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleStopSprint = async () => {
    setLoading(true);
    try {
      const res = await stopFocusSession({
        sessionId: activeSession?.id,
      });

      if (res.success && res.session) {
        setStoppedSessionId(res.session.id);
        setActiveSession(null);
        setCompletedMinutes(res.totalMinutes);
        setEnergyModalOpen(true);

        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate?.([100, 50, 100]);
        }
        toast.success(`Session completed: ${res.session.minutes} minutes. Alhamdulillah.`);
      } else {
        toast.error(res.error || 'Failed to stop session');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to stop session';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEnergy = async (energy: 'low' | 'okay' | 'high') => {
    if (stoppedSessionId) {
      try {
        await setSessionEnergy(stoppedSessionId, energy);
      } catch (err) {
        console.warn('Could not save energy rating:', err);
      }
    }
    setEnergyModalOpen(false);
    setStoppedSessionId(null);
    toast.success('Energy recorded. Great work.');
  };

  // Format elapsed time as MM:SS
  const formatTimerDigits = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <>
      <div
        className={`p-4 rounded-2xl border transition-all ${
          isRunning
            ? 'bg-[#181510] border-[var(--gold)] shadow-[0_0_20px_rgba(200,169,110,0.18)]'
            : progress.doneMin
            ? 'bg-[#121411] border-emerald-500/30'
            : 'bg-[var(--card)] border-[var(--border)]'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isRunning
                  ? 'bg-[var(--gold)] text-[#12110F]'
                  : progress.doneMin
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-[var(--gold)]/10 text-[var(--gold)]'
              }`}
            >
              {progress.doneMin && !isRunning ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[var(--fg)]">
                  The Big Rock Block
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--gold)]">
                  07:30 – 09:30
                </span>
              </div>
              <p className="text-xs font-mono text-[var(--muted)]">
                {progress.statusLabel}
              </p>
            </div>
          </div>

          {isRunning && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/30 text-[11px] font-mono text-[var(--gold)]">
              <Flame className="w-3.5 h-3.5 animate-pulse text-[var(--gold)]" />
              <span className="font-semibold">{formatTimerDigits(elapsedSeconds)}</span>
            </div>
          )}
        </div>

        <p className="text-xs text-[var(--muted)] leading-relaxed mb-3">
          Your daily highest-leverage deep work. Phone in another room. Zero client context switching.
        </p>

        {firstAction && (
          <div className="mb-3 px-3 py-2 rounded-xl bg-[var(--gold-glow)]/30 border border-[var(--gold)]/20 text-xs">
            <span className="font-mono text-[10px] text-[var(--gold)] font-semibold uppercase tracking-wider block mb-0.5">
              First Action Planned
            </span>
            <span className="text-[var(--fg)] font-medium">{firstAction}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {isRunning ? (
            <Button
              size="sm"
              disabled={loading}
              onClick={handleStopSprint}
              className="flex-1 h-10 bg-red-600 hover:bg-red-500 active:scale-[0.98] text-white font-semibold rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-md shadow-red-950/40"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>{loading ? 'Finishing...' : 'Finish Focus Sprint'}</span>
            </Button>
          ) : (
            <Button
              size="sm"
              disabled={loading}
              onClick={() => setFocusModalOpen(true)}
              className="flex-1 h-10 bg-[var(--gold)] hover:bg-[#b8985c] active:scale-[0.98] text-[#12110F] font-semibold rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {progress.doneMin ? 'Start Another Sprint' : 'Start 90-Minute Sprint'}
              </span>
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={onOpenParkDialog}
            className="h-10 border-[var(--border)] text-xs text-[var(--muted)] hover:text-[var(--fg)] rounded-xl flex items-center gap-1 cursor-pointer bg-transparent"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Park Idea</span>
          </Button>
        </div>
      </div>

      {/* 5-4-3-2-1 Starter Dialog */}
      <Dialog open={focusModalOpen} onOpenChange={setFocusModalOpen}>
        <DialogContent className="max-w-[340px] rounded-2xl bg-[#0e0d0c] border border-[var(--line)] p-6 text-center space-y-4 text-[var(--fg)]">
          <DialogHeader className="space-y-1">
            <DialogTitle className="font-serif text-2xl font-semibold text-[var(--fg)]">
              Big Rock 5-4-3-2-1
            </DialogTitle>
            <DialogDescription className="text-xs text-[var(--muted)]">
              Clear your desk. Close all messaging apps. Enter the zone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <span className="font-amiri text-3xl text-[var(--gold)] block" dir="rtl">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </span>
            <p className="text-xs text-[var(--muted)] italic mt-2">
              &ldquo;In the name of Allah, the Most Gracious, the Most Merciful&rdquo;
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <Button
              disabled={loading}
              onClick={handleStartSprint}
              className="w-full h-11 bg-[var(--gold)] hover:bg-[#b8985c] text-[#12110F] font-semibold rounded-xl text-xs cursor-pointer shadow-md shadow-[var(--gold)]/20 active:scale-[0.98] transition-all"
            >
              {loading ? 'Starting...' : 'Start 90-Minute Sprint'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFocusModalOpen(false)}
              className="w-full text-xs text-[var(--muted)] hover:text-[var(--fg)]"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Energy Tap Dialog (P0-5) */}
      <Dialog open={energyModalOpen} onOpenChange={setEnergyModalOpen}>
        <DialogContent className="max-w-[340px] rounded-2xl bg-[#0e0d0c] border border-[var(--line)] p-6 text-center space-y-4 text-[var(--fg)]">
          <DialogHeader className="space-y-1">
            <DialogTitle className="font-serif text-xl font-semibold text-[var(--fg)]">
              Energy Check-in
            </DialogTitle>
            <DialogDescription className="text-xs text-[var(--muted)]">
              How was your energy and focus during this sprint?
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-2.5 pt-2">
            <Button
              variant="outline"
              onClick={() => handleSelectEnergy('low')}
              className="h-14 flex flex-col items-center justify-center gap-1 rounded-xl border-[var(--line)] bg-[#181614] hover:border-[var(--gold)] cursor-pointer"
            >
              <span className="text-lg">🔋</span>
              <span className="text-[11px] font-mono text-[var(--muted)]">Low</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSelectEnergy('okay')}
              className="h-14 flex flex-col items-center justify-center gap-1 rounded-xl border-[var(--line)] bg-[#181614] hover:border-[var(--gold)] cursor-pointer"
            >
              <span className="text-lg">⚡</span>
              <span className="text-[11px] font-mono text-[var(--muted)]">Okay</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSelectEnergy('high')}
              className="h-14 flex flex-col items-center justify-center gap-1 rounded-xl border-[var(--line)] bg-[#181614] hover:border-[var(--gold)] cursor-pointer"
            >
              <span className="text-lg">🔥</span>
              <span className="text-[11px] font-mono text-[var(--gold)]">High</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

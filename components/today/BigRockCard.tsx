'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Sparkles, PlusCircle, CheckCircle2, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { getKarachiParts } from '@/lib/time';
import { toast } from 'sonner';

interface BigRockCardProps {
  onOpenParkDialog: () => void;
  isBadDay: boolean;
  firstAction?: string | null;
}

export function BigRockCard({ onOpenParkDialog, isBadDay, firstAction }: BigRockCardProps) {
  const [focusModalOpen, setFocusModalOpen] = useState(false);
  const [focusActive, setFocusActive] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [isDuringBlock, setIsDuringBlock] = useState(false);

  useEffect(() => {
    function computeStatus() {
      const parts = getKarachiParts();
      const currentMinutes = parts.hour * 60 + parts.minute;
      const startMinutes = 7 * 60 + 30; // 07:30
      const endMinutes = 9 * 60 + 30; // 09:30

      if (currentMinutes < startMinutes) {
        const diff = startMinutes - currentMinutes;
        const hours = Math.floor(diff / 60);
        const mins = diff % 60;
        setStatusText(hours > 0 ? `Starts in ${hours}h ${mins}m` : `Starts in ${mins}m`);
        setIsDuringBlock(false);
      } else if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
        const remaining = endMinutes - currentMinutes;
        setStatusText(`Active Sprint · ${remaining}m left`);
        setIsDuringBlock(true);
      } else {
        setStatusText('Block completed');
        setIsDuringBlock(false);
      }
    }

    computeStatus();
    const interval = setInterval(computeStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStartSprint = () => {
    setFocusActive(true);
    setFocusModalOpen(false);
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([50, 50, 50]);
    }
    toast.success('Bismillah. 90-minute focus sprint engaged.');
  };

  return (
    <>
      <div
        className={`p-4 rounded-2xl border transition-all ${
          isDuringBlock || focusActive
            ? 'bg-amber-950/20 border-[var(--gold)] shadow-[0_0_15px_rgba(245,158,11,0.15)]'
            : 'bg-[var(--card)] border-[var(--border)]'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--gold)]/10 text-[var(--gold)] flex items-center justify-center">
              <Sun className="w-4 h-4" />
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
                {statusText}
              </p>
            </div>
          </div>

          {(isDuringBlock || focusActive) && (
            <div className="flex items-center gap-1 text-[11px] font-mono text-[var(--gold)] animate-pulse">
              <Flame className="w-3.5 h-3.5" />
              <span>LIVE</span>
            </div>
          )}
        </div>

        <p className="text-xs text-[var(--muted)] leading-relaxed mb-3">
          Your daily highest-leverage deep work. Phone in another room. Zero client context switching.
        </p>

        {firstAction && (
          <div className="mb-3 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
            <span className="font-mono text-[10px] text-amber-400 font-semibold uppercase tracking-wider block mb-0.5">
              First Action Planned
            </span>
            <span className="text-neutral-200 font-medium">{firstAction}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setFocusModalOpen(true)}
            className="flex-1 h-9 bg-[var(--gold)] hover:bg-[var(--gold)]/90 text-black font-semibold rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{focusActive ? 'Sprint Active' : 'Start Focus Session'}</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onOpenParkDialog}
            className="h-9 border-[var(--border)] text-xs text-[var(--muted)] hover:text-[var(--fg)] rounded-xl flex items-center gap-1 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Park Idea</span>
          </Button>
        </div>
      </div>

      {/* 5-4-3-2-1 Starter Dialog */}
      <Dialog open={focusModalOpen} onOpenChange={setFocusModalOpen}>
        <DialogContent className="max-w-[340px] rounded-2xl bg-[var(--card)] border border-[var(--border)] p-6 text-center space-y-4">
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
              onClick={handleStartSprint}
              className="w-full h-11 bg-[var(--gold)] hover:bg-[var(--gold)]/90 text-black font-semibold rounded-xl text-xs cursor-pointer shadow-md shadow-[var(--gold-glow)]"
            >
              Start 90-Minute Sprint
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFocusModalOpen(false)}
              className="w-full text-xs text-[var(--muted)]"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

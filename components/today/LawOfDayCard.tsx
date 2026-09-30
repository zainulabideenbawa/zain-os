'use client';

import React from 'react';
import { Scale } from 'lucide-react';
import { getLawOfDay } from '@/lib/content/laws';
import { getCycleDay } from '@/lib/time';

interface LawOfDayCardProps {
  date: string;
}

export function LawOfDayCard({ date }: LawOfDayCardProps) {
  const cycleDay = getCycleDay(date);
  const law = getLawOfDay(cycleDay);

  return (
    <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-md space-y-2 relative overflow-hidden">
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-1.5 text-[var(--gold)]">
          <Scale className="w-3.5 h-3.5" />
          <span className="uppercase tracking-wider font-semibold">
            Law of the Day
          </span>
        </div>
        <span className="text-[10px] font-mono text-[var(--muted)]">
          Rule #{law.number} of 12
        </span>
      </div>

      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-[var(--fg)]">
          &ldquo;{law.title}&rdquo;
        </h4>
        <p className="text-xs text-[var(--muted)] leading-relaxed">
          {law.rule}
        </p>
      </div>
    </div>
  );
}

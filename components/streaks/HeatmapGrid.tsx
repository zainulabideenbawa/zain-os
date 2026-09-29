'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { getCycleDay } from '@/lib/time';

export interface DayHeatmapItem {
  date: string;
  state: 'kept' | 'at_risk' | 'comeback' | 'frozen' | 'missed' | 'open' | 'future';
}

interface HeatmapGridProps {
  daysMap: Record<string, 'kept' | 'at_risk' | 'comeback' | 'frozen' | 'missed' | 'open' | 'future'>;
}

const STATE_COLORS: Record<string, string> = {
  kept: 'bg-emerald-500 shadow-sm shadow-emerald-500/20',
  at_risk: 'bg-amber-500 shadow-sm shadow-amber-500/20',
  comeback: 'bg-cyan-500 shadow-sm shadow-cyan-500/20',
  frozen: 'bg-sky-400 shadow-sm shadow-sky-400/20',
  missed: 'bg-red-500 shadow-sm shadow-red-500/20',
  open: 'bg-neutral-800 border border-amber-500/30',
  future: 'bg-neutral-900 border border-white/5',
};

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function HeatmapGrid({ daysMap }: HeatmapGridProps) {
  const [selectedDay, setSelectedDay] = useState<{ date: string; state: string } | null>(null);

  // Generate 84 days: 12 weeks * 7 days starting 2026-09-28
  const startDate = new Date(Date.UTC(2026, 8, 28)); // Sep 28, 2026
  const grid: { date: string; state: string }[][] = [];

  for (let w = 0; w < 12; w++) {
    const weekCol: { date: string; state: string }[] = [];
    for (let d = 0; d < 7; d++) {
      const dayOffset = w * 7 + d;
      const curDate = new Date(startDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);
      const y = curDate.getUTCFullYear();
      const m = String(curDate.getUTCMonth() + 1).padStart(2, '0');
      const dt = String(curDate.getUTCDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${dt}`;

      const state = daysMap[dateStr] || 'future';
      weekCol.push({ date: dateStr, state });
    }
    grid.push(weekCol);
  }

  return (
    <div className="space-y-3 p-4 rounded-2xl bg-neutral-900/60 border border-white/5 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
            12-Week Cycle Heatmap (84 Days)
          </h3>
          <p className="text-[11px] text-neutral-500">
            Sep 28 – Dec 20, 2026
          </p>
        </div>

        {selectedDay && (
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 capitalize">
            {selectedDay.date}: {selectedDay.state.replace('_', ' ')}
          </span>
        )}
      </div>

      <div className="flex gap-2">
        {/* Weekday indicators */}
        <div className="flex flex-col justify-between py-0.5 text-[9px] font-mono text-neutral-500 pr-1">
          {WEEKDAYS.map((wd, i) => (
            <span key={i} className="h-3.5 leading-none flex items-center">
              {wd}
            </span>
          ))}
        </div>

        {/* 12 columns */}
        <div className="grid grid-cols-12 gap-1.5 flex-1">
          {grid.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1.5">
              {week.map((day) => {
                const colorClass = STATE_COLORS[day.state] || STATE_COLORS.future;
                return (
                  <motion.button
                    key={day.date}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => setSelectedDay(day)}
                    title={`${day.date}: ${day.state}`}
                    className={`w-full aspect-square rounded-sm transition-all ${colorClass}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-[10px] font-mono text-neutral-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
          <span>Kept</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
          <span>At Risk</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500" />
          <span>Comeback</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-sky-400" />
          <span>Frozen</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-red-500" />
          <span>Missed</span>
        </div>
      </div>
    </div>
  );
}

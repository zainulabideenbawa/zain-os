'use client';

import React from 'react';
import { Flame, Shield, Award, Sparkles, CheckCircle2, Heart } from 'lucide-react';
import { MILESTONES } from '@/lib/content/milestones';
import { HeatmapGrid } from './HeatmapGrid';
import { ShareScorecard } from './ShareScorecard';

export interface CookieJarItem {
  date: string;
  went_well: string;
}

interface StreaksViewProps {
  streak: number;
  bestStreak: number;
  freezes: number;
  currentState: string;
  daysMap: Record<string, 'kept' | 'at_risk' | 'comeback' | 'frozen' | 'missed' | 'open' | 'future'>;
  cookieJar: CookieJarItem[];
  weeklyScore: number;
  deepWorkHours: number;
  cycleWeek: number;
}

export function StreaksView({
  streak,
  bestStreak,
  freezes,
  currentState,
  daysMap,
  cookieJar,
  weeklyScore,
  deepWorkHours,
  cycleWeek,
}: StreaksViewProps) {
  // Find next milestone
  const nextMilestone = MILESTONES.find((m) => m.days > streak) || MILESTONES[MILESTONES.length - 1];
  const prevMilestoneDays =
    MILESTONES.filter((m) => m.days <= streak).pop()?.days ?? 0;
  const milestoneProgress = Math.min(
    100,
    Math.round(((streak - prevMilestoneDays) / (nextMilestone.days - prevMilestoneDays || 1)) * 100)
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Streak Hero Card */}
      <div className="p-6 rounded-2xl bg-neutral-900/70 border border-white/5 shadow-2xl text-center space-y-4 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto">
          <Flame className="w-8 h-8 fill-amber-500" />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <span className="text-5xl font-cormorant font-bold text-white">
              {streak}
            </span>
            <span className="text-sm font-mono text-neutral-400">days</span>
          </div>
          <p className="text-xs font-mono uppercase tracking-wider text-neutral-400">
            Current Forgiving Streak
          </p>
        </div>

        {/* Next Milestone Progress */}
        <div className="p-3 rounded-xl bg-neutral-950/60 border border-white/5 space-y-1.5 text-left">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-neutral-400">Next: {nextMilestone.title}</span>
            <span className="text-amber-400 font-semibold">{nextMilestone.days}d</span>
          </div>
          <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all"
              style={{ width: `${milestoneProgress}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
          <div className="p-2.5 rounded-xl bg-neutral-950/50 border border-white/5 text-left">
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-0.5">
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              <span>Freezes</span>
            </div>
            <span className="text-sm font-mono font-semibold text-white">
              {freezes} / 2 banked ❄️
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-neutral-950/50 border border-white/5 text-left">
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-0.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>All-time Best</span>
            </div>
            <span className="text-sm font-mono font-semibold text-white">
              {bestStreak} days
            </span>
          </div>
        </div>
      </div>

      {/* Share Scorecard Button */}
      <ShareScorecard
        streak={streak}
        bestStreak={bestStreak}
        weeklyScore={weeklyScore}
        deepWorkHours={deepWorkHours}
      />

      {/* 12-Week Heatmap */}
      <HeatmapGrid daysMap={daysMap} />

      {/* Week Score Ring Card */}
      <div className="p-4 rounded-2xl bg-neutral-900/70 border border-white/5 shadow-xl flex items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
            Cycle Week {cycleWeek}
          </span>
          <h4 className="text-sm font-semibold text-white">
            Weekly Target Score
          </h4>
          <p className="text-xs text-neutral-400 leading-relaxed">
            {cycleWeek === 1 && 'Week 1: Minimums only · Foundation'}
            {cycleWeek === 2 && 'Week 2: + Big Rock target · 70% threshold'}
            {cycleWeek >= 3 && 'Weeks 3+: Full habit targets · 85% threshold'}
          </p>
        </div>

        {/* Circular Ring */}
        <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-neutral-800"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-emerald-500"
              strokeDasharray={`${weeklyScore}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="absolute font-mono text-xs font-bold text-white">
            {weeklyScore}%
          </span>
        </div>
      </div>

      {/* Cookie Jar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              Cookie Jar
            </h3>
            <p className="text-[11px] text-neutral-500">
              Evidence of execution when resistance hits
            </p>
          </div>
          <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            {cookieJar.length} wins
          </span>
        </div>

        {cookieJar.length === 0 ? (
          <div className="p-6 rounded-2xl bg-neutral-900/40 border border-white/5 text-center text-xs text-neutral-500">
            Your evening Muhasaba "What went well?" entries will appear here.
          </div>
        ) : (
          <div className="space-y-2">
            {cookieJar.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-neutral-900/60 border border-white/5 flex items-start gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <div className="space-y-0.5 flex-1">
                  <p className="text-xs text-neutral-200 leading-relaxed font-medium">
                    "{item.went_well}"
                  </p>
                  <p className="text-[10px] font-mono text-neutral-500">
                    {item.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

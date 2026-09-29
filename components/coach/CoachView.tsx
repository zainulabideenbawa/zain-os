'use client';

import React from 'react';
import { Sparkles, Brain, ArrowUpRight, Flame, Heart, AlertCircle, Shield } from 'lucide-react';
import Link from 'next/link';

export interface MuhasabaHistoryItem {
  date: string;
  energy: number | null;
  khushu: number | null;
  went_well: string | null;
  went_wrong: string | null;
  barrier: string | null;
  owned: string | null;
  shukr: string | null;
  closed_at: string | null;
}

interface CoachViewProps {
  history: MuhasabaHistoryItem[];
}

export function CoachView({ history }: CoachViewProps) {
  return (
    <div className="space-y-6 pb-12">
      {/* Phase 2 Placeholder Banner */}
      <div className="p-6 rounded-2xl bg-neutral-900/70 border border-white/5 shadow-2xl text-center space-y-4 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mx-auto">
          <Brain className="w-8 h-8" />
          <span className="absolute -top-1 -right-1 text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-purple-500 text-white font-bold">
            Phase 2
          </span>
        </div>

        <div className="space-y-1.5 max-w-[300px] mx-auto">
          <h1 className="font-cormorant text-3xl font-bold text-white tracking-wide">
            AI Founder Coach
          </h1>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Your daily salah checkpoints, Big Rock execution, and evening Muhasaba reflections
            are quietly building the context for your personal Claude coach.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-white/5 text-left space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Coming in Phase 2 (Mid-Cycle)</span>
          </div>
          <ul className="text-[11px] text-neutral-400 space-y-1.5 list-disc list-inside">
            <li>Daily reply after each Muhasaba (&le; 60 words: win, barrier fix, tomorrow setup)</li>
            <li>Weekly retrospective debriefs with Claude (Sundays 09:00)</li>
            <li>Energy & circadian rhythm coaching from focus session patterns</li>
            <li>Friction detection and automated habit shrink hints</li>
          </ul>
        </div>

        <div className="pt-1">
          <Link
            href="/today"
            className="inline-flex items-center justify-center gap-1.5 text-xs font-mono text-amber-400 hover:underline"
          >
            <span>Execute on Today&apos;s Cockpit</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Historical Muhasaba Stream */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              Muhasaba History ({history.length})
            </h3>
            <p className="text-[11px] text-neutral-500">
              Your evening self-accounting log
            </p>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="p-6 rounded-2xl bg-neutral-900/40 border border-white/5 text-center text-xs text-neutral-500">
            No closed days yet. Complete this evening&apos;s Muhasaba flow to start your audit stream.
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-neutral-900/70 border border-white/5 space-y-3 shadow-lg"
              >
                <div className="flex items-center justify-between text-xs pb-2 border-b border-white/5">
                  <span className="font-mono text-white font-semibold">
                    {item.date}
                  </span>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    {item.energy && (
                      <span className="text-amber-400">
                        ⚡ Energy {item.energy}/5
                      </span>
                    )}
                    {item.khushu && (
                      <span className="text-emerald-400">
                        ☪️ Khushu {['', 'Scattered', 'Some', 'Present'][item.khushu]}
                      </span>
                    )}
                  </div>
                </div>

                {item.went_well && (
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
                      Win (Cookie Jar)
                    </span>
                    <p className="text-xs text-neutral-200 mt-0.5">
                      "{item.went_well}"
                    </p>
                  </div>
                )}

                {item.went_wrong && (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-red-400 uppercase tracking-wider">
                        Miss & Friction
                      </span>
                      {item.barrier && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-500/10 text-red-300 border border-red-500/30 capitalize">
                          {item.barrier}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-300 mt-0.5">
                      "{item.went_wrong}"
                    </p>
                  </div>
                )}

                {item.shukr && (
                  <div className="pt-1 text-[11px] text-neutral-400 italic">
                    Shukr: {item.shukr}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

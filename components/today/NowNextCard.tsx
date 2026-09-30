'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Users, Zap, Coffee, BookOpen } from 'lucide-react';
import type { Database } from '@/lib/database.types';
import type { DayPrayerTimes } from '@/lib/prayer';
import { parseKarachiDateTime, formatKarachiTime } from '@/lib/time';

type RoutineBlock = Database['public']['Tables']['routine_blocks']['Row'];

interface ResolvedBlock {
  key: string;
  label: string;
  kind: string;
  project: string | null;
  startTime: Date;
  endTime: Date;
  startStr: string;
  endStr: string;
}

interface NowNextCardProps {
  date: string;
  routineBlocks: RoutineBlock[];
  prayerSchedule: DayPrayerTimes;
}

export function NowNextCard({ date, routineBlocks, prayerSchedule }: NowNextCardProps) {
  const [now, setNow] = useState(() => new Date());

  // Tick every 30 seconds to update live time remaining
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const [y, m, d] = date.split('-').map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();

  // Filter blocks active for today's day of week
  const todayBlocks = routineBlocks.filter(
    (b) => b.active && (b.days.length === 0 || b.days.includes(weekday))
  );

  // Resolve start and end Date objects for each block
  const resolved: ResolvedBlock[] = [];

  for (const b of todayBlocks) {
    let start: Date | null = null;
    let end: Date | null = null;

    if (b.anchor && prayerSchedule.prayers[b.anchor]) {
      const slot = prayerSchedule.prayers[b.anchor];
      const offsetMin = b.anchor_offset_min ?? 0;
      start = slot.jamaat;
      end = new Date(slot.jamaat.getTime() + offsetMin * 60 * 1000);
    } else if (b.start_time) {
      const timePart = b.start_time.slice(0, 5);
      start = parseKarachiDateTime(date, timePart);

      if (b.end_time) {
        const endTimePart = b.end_time.slice(0, 5);
        end = parseKarachiDateTime(date, endTimePart);
      } else {
        // default 30 min duration
        end = new Date(start.getTime() + 30 * 60 * 1000);
      }
    }

    if (start && end) {
      resolved.push({
        key: b.key,
        label: b.label,
        kind: b.kind,
        project: b.project,
        startTime: start,
        endTime: end,
        startStr: formatKarachiTime(start),
        endStr: formatKarachiTime(end),
      });
    }
  }

  // Sort chronologically by start time
  resolved.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  const nowMs = now.getTime();
  const current = resolved.find(
    (b) => nowMs >= b.startTime.getTime() && nowMs < b.endTime.getTime()
  );

  const upcoming = resolved.filter((b) => b.startTime.getTime() > nowMs);
  const next1 = upcoming[0] || null;
  const next2 = upcoming[1] || null;

  const getKindBadge = (kind: string, project: string | null) => {
    if (kind === 'meeting') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <Users className="w-3 h-3" />
          <span>Meeting</span>
        </span>
      );
    }
    if (kind === 'deep') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/20">
          <Zap className="w-3 h-3" />
          <span>{project || 'Deep Work'}</span>
        </span>
      );
    }
    if (kind === 'rest') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Coffee className="w-3 h-3" />
          <span>Rest</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/5 text-[var(--muted)] border border-[var(--border)]">
        <Clock className="w-3 h-3" />
        <span>{kind}</span>
      </span>
    );
  };

  const minutesLeft = current
    ? Math.max(1, Math.round((current.endTime.getTime() - nowMs) / 60000))
    : 0;

  return (
    <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-3 shadow-md">
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-[var(--gold)]" />
          <span className="text-[var(--gold)] uppercase tracking-wider font-semibold">
            Now / Next
          </span>
        </div>
        <span className="text-[var(--muted)]">Routine Schedule</span>
      </div>

      {/* Current block */}
      {current ? (
        <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--gold)]/30 space-y-1.5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--gold)] text-black font-bold">
              Now
            </span>
            <span className="text-xs font-mono text-[var(--gold)] font-medium">
              {minutesLeft}m left
            </span>
          </div>

          <div className="flex items-baseline justify-between gap-2 pt-0.5">
            <h4 className="text-sm font-semibold text-[var(--fg)]">
              {current.label}
            </h4>
            {getKindBadge(current.kind, current.project)}
          </div>

          <p className="text-[11px] font-mono text-[var(--muted)]">
            {current.startStr} – {current.endStr}
          </p>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--muted)] flex items-center justify-between">
          <span>Buffer window · Between scheduled blocks</span>
          <span className="font-mono text-[var(--gold)]">
            {next1 ? `Next in ${Math.max(1, Math.round((next1.startTime.getTime() - nowMs) / 60000))}m` : 'Done for today'}
          </span>
        </div>
      )}

      {/* Next blocks */}
      {(next1 || next2) && (
        <div className="space-y-1.5 pt-1 border-t border-[var(--border)]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] block">
            Upcoming Today
          </span>

          <div className="space-y-1">
            {next1 && (
              <div className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-[var(--bg)]/50 border border-[var(--border)]/60">
                <div className="flex items-center gap-2 truncate">
                  <span className="font-mono text-[11px] text-[var(--gold)] font-semibold shrink-0">
                    {next1.startStr}
                  </span>
                  <span className="text-[var(--fg)] truncate">{next1.label}</span>
                </div>
                <div className="shrink-0 ml-2">
                  {getKindBadge(next1.kind, next1.project)}
                </div>
              </div>
            )}

            {next2 && (
              <div className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-[var(--bg)]/30 border border-[var(--border)]/40">
                <div className="flex items-center gap-2 truncate">
                  <span className="font-mono text-[11px] text-[var(--muted)] shrink-0">
                    {next2.startStr}
                  </span>
                  <span className="text-[var(--muted)] truncate">{next2.label}</span>
                </div>
                <div className="shrink-0 ml-2">
                  {getKindBadge(next2.kind, next2.project)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

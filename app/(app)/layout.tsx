'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Flame, Calendar, Sparkles, Plus } from 'lucide-react';
import { getCycleWeek, getNowKarachi, formatInKarachi } from '@/lib/time';
import { QuickCaptureDialog } from '@/components/shared/QuickCaptureDialog';

const NAV_ITEMS = [
  {
    name: 'Today',
    href: '/today',
    icon: Compass,
  },
  {
    name: 'Streaks',
    href: '/streaks',
    icon: Flame,
  },
  {
    name: 'Plan',
    href: '/plan',
    icon: Calendar,
  },
  {
    name: 'Coach',
    href: '/coach',
    icon: Sparkles,
    badge: 'P2',
  },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [captureOpen, setCaptureOpen] = React.useState(false);
  const now = getNowKarachi();
  const cycleWeek = getCycleWeek(now);
  const formattedDate = formatInKarachi(now, 'EEE, d MMM');

  const handleTabClick = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] flex flex-col justify-between">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[var(--bg)]/80 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-[430px] mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg font-bold text-[var(--gold)]">
              Zain OS
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--card)] border border-[var(--border)] text-[var(--muted)]">
              W{cycleWeek}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setCaptureOpen(true)}
              title="Quick Capture (+)"
              className="w-7 h-7 rounded-full bg-white/5 border border-white/10 hover:border-amber-500/40 text-neutral-300 hover:text-amber-400 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono text-[var(--muted)]">
              {formattedDate}
            </span>
            <div className="w-2 h-2 rounded-full bg-[var(--emerald)] animate-pulse" />
          </div>
        </div>
      </header>

      {/* Quick Capture Global Modal */}
      <QuickCaptureDialog open={captureOpen} onOpenChange={setCaptureOpen} />

      {/* Main Content Area — Mobile First (max 430px) */}
      <main className="flex-1 max-w-[430px] w-full mx-auto px-4 pt-4 pb-24">
        {children}
      </main>

      {/* Bottom Tab Bar */}
      <nav
        aria-label="Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--card)]/90 backdrop-blur-lg border-t border-[var(--border)] pb-[env(safe-area-inset-bottom)]"
      >
        <div className="max-w-[430px] mx-auto h-16 flex items-center justify-around px-2">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/today' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleTabClick}
                className={`relative flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all ${
                  isActive
                    ? 'text-[var(--gold)] font-medium'
                    : 'text-[var(--muted)] hover:text-[var(--fg)]'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5 transition-transform" />
                  {item.badge && (
                    <span className="absolute -top-1.5 -right-3 text-[9px] font-mono px-1 py-0.2 rounded bg-[var(--gold)]/20 text-[var(--gold)] font-semibold leading-tight">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] mt-1 tracking-tight font-sans">
                  {item.name}
                </span>

                {/* Active indicator dot */}
                {isActive && (
                  <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-[var(--gold)] shadow-[0_0_6px_var(--gold)]" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

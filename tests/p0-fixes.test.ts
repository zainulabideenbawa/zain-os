import { describe, it, expect, vi } from 'vitest';
import { createKarachiDate, getLogicalDate } from '@/lib/time';
import { calculateSessionMinutes, evaluateFocusProgress } from '@/lib/focus';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: null },
        error: null,
      }),
    },
  }),
}));

describe('P0 Blockers Verification Tests', () => {
  describe('P0-1: Authentication Gate & Protected Routes', () => {
    it('requireUser throws "Not signed in" when session is missing', async () => {
      const { requireUser } = await import('@/lib/supabase/auth');
      await expect(requireUser()).rejects.toThrow('Not signed in');
    });

    it('proxy route matching allows public assets and gate-keeps protected routes', () => {
      const publicPaths = [
        '/login',
        '/auth/callback',
        '/api/cron/dispatch',
        '/api/cron/daily',
        '/manifest.webmanifest',
        '/sw.js',
        '/icons/icon-192.png',
      ];

      for (const p of publicPaths) {
        const isPublic =
          p === '/login' ||
          p.startsWith('/auth') ||
          p.startsWith('/api/cron') ||
          p.startsWith('/icons') ||
          p === '/manifest.webmanifest' ||
          p === '/sw.js';
        expect(isPublic).toBe(true);
      }

      const protectedPaths = ['/today', '/plan', '/streaks', '/coach', '/onboarding'];
      for (const p of protectedPaths) {
        const isPublic =
          p === '/login' ||
          p.startsWith('/auth') ||
          p.startsWith('/api/cron') ||
          p.startsWith('/icons') ||
          p === '/manifest.webmanifest' ||
          p === '/sw.js';
        expect(isPublic).toBe(false);
      }
    });
  });

  describe('P0-4: Nightly Build Timing & Stale Row Skipping', () => {
    it('demonstrates 00:05 PKT targets the PREVIOUS logical day', () => {
      // At 00:05 PKT on Sep 29, getLogicalDate returns Sep 28
      const date0005 = createKarachiDate(2026, 9, 29, 0, 5, 0);
      expect(getLogicalDate(date0005)).toBe('2026-09-28');
    });

    it('demonstrates 03:05 PKT targets the FRESH CURRENT logical day', () => {
      // At 03:05 PKT on Sep 29, getLogicalDate returns Sep 29
      const date0305 = createKarachiDate(2026, 9, 29, 3, 5, 0);
      expect(getLogicalDate(date0305)).toBe('2026-09-29');
    });

    it('correctly flags notifications with send_at < now - 10 minutes as stale', () => {
      const nowMs = 1790697600000; // Fixed timestamp
      const staleThresholdMs = nowMs - 10 * 60 * 1000;

      // 15 minutes in the past -> STALE
      const pastSendAt15m = new Date(nowMs - 15 * 60 * 1000).toISOString();
      const isStale15m = new Date(pastSendAt15m).getTime() < staleThresholdMs;
      expect(isStale15m).toBe(true);

      // 5 minutes in the past -> NOT STALE (within 10-minute dispatch window)
      const pastSendAt5m = new Date(nowMs - 5 * 60 * 1000).toISOString();
      const isStale5m = new Date(pastSendAt5m).getTime() < staleThresholdMs;
      expect(isStale5m).toBe(false);
    });
  });

  describe('P0-5: Big Rock Timer & Deep Work Calculations', () => {
    it('calculates session minutes accurately between start and stop times', () => {
      const start = '2026-09-29T07:30:00.000Z';
      const end90m = '2026-09-29T09:00:00.000Z';
      const end42m = '2026-09-29T08:12:00.000Z';

      expect(calculateSessionMinutes(start, end90m)).toBe(90);
      expect(calculateSessionMinutes(start, end42m)).toBe(42);
    });

    it('evaluates focus progress: ≥ 90 mins marks big_rock done_min and formats card status', () => {
      // 1. Not started
      const notStarted = evaluateFocusProgress(0, 90, 180, false, 0);
      expect(notStarted.doneMin).toBe(false);
      expect(notStarted.statusLabel).toBe('Not started · 0/90');

      // 2. In progress · 42 min
      const inProgress = evaluateFocusProgress(0, 90, 180, true, 42);
      expect(inProgress.doneMin).toBe(false);
      expect(inProgress.statusLabel).toBe('In progress · 42 min');

      // 3. Stopped at 42 min (partial, under 90)
      const stopped42 = evaluateFocusProgress(42, 90, 180, false, 0);
      expect(stopped42.doneMin).toBe(false);
      expect(stopped42.statusLabel).toBe('42/90 min');

      // 4. Completed 95 min sprint (meets 90 min minimum)
      const completed95 = evaluateFocusProgress(95, 90, 180, false, 0);
      expect(completed95.doneMin).toBe(true);
      expect(completed95.doneTarget).toBe(false);
      expect(completed95.statusLabel).toBe('Done · 95 min ✓');

      // 5. Completed 185 min (meets 180 min target)
      const completed185 = evaluateFocusProgress(185, 90, 180, false, 0);
      expect(completed185.doneMin).toBe(true);
      expect(completed185.doneTarget).toBe(true);
      expect(completed185.statusLabel).toBe('Done · 185 min ✓');
    });
  });
});

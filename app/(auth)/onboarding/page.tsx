'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import {
  Compass,
  Flame,
  Briefcase,
  Moon,
  Bell,
  Smartphone,
  ChevronRight,
  CheckCircle2,
  Share,
} from 'lucide-react';
import { urlBase64ToUint8Array } from '@/lib/push-client';
import { toast } from 'sonner';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [subscribing, setSubscribing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const handleEnablePush = async () => {
    if (!('Notification' in window)) {
      toast.error('Web notifications are not supported on this browser.');
      setStep(3);
      return;
    }

    setSubscribing(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.info('Notifications were not enabled. You can enable them later in settings.');
        setStep(3);
        return;
      }

      // Register or get SW registration
      const registration = await navigator.serviceWorker.ready;
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!vapidPublicKey) {
        toast.error('VAPID public key not configured.');
        setNotificationsEnabled(true);
        setStep(3);
        return;
      }

      const convertedKey = urlBase64ToUint8Array(vapidPublicKey);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey as unknown as BufferSource,
      });

      const subData = subscription.toJSON();
      if (subData.endpoint && subData.keys) {
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: subData.endpoint,
            keys: subData.keys,
            user_agent: navigator.userAgent,
          }),
        });
      }

      setNotificationsEnabled(true);
      toast.success('Prayer and accountability alerts enabled!');
      setTimeout(() => setStep(3), 800);
    } catch (err: unknown) {
      console.error('[Push Subscription error]', err);
      toast.error('Could not subscribe to push alerts. Proceeding to final step.');
      setStep(3);
    } finally {
      setSubscribing(false);
    }
  };

  const handleFinish = () => {
    router.push('/today');
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-[390px] mx-auto space-y-6">
        {/* Progress indicator */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-8 bg-[var(--gold)]'
                    : s < step
                    ? 'w-3 bg-[var(--emerald)]'
                    : 'w-3 bg-[var(--border)]'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-mono text-[var(--muted)]">
            Step {step} of 3
          </span>
        </div>

        {/* Card content */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-xl relative min-h-[460px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="space-y-1">
                  <h2 className="font-serif text-2xl font-semibold text-[var(--fg)]">
                    The Rules of Zain OS
                  </h2>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    Rigid on principles. Forgiving on execution.
                  </p>
                </div>

                <div className="space-y-3.5">
                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                    <div className="w-7 h-7 rounded-lg bg-[var(--gold)]/10 text-[var(--gold)] flex items-center justify-center shrink-0 mt-0.5">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-semibold text-[var(--fg)]">
                        Five Daily Anchors
                      </h4>
                      <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                        Fajr, Dhuhr, Asr, Maghrib, Isha. The schedule bends around Allah, not meetings.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                    <div className="w-7 h-7 rounded-lg bg-[var(--emerald)]/10 text-[var(--emerald)] flex items-center justify-center shrink-0 mt-0.5">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-semibold text-[var(--fg)]">
                        One Forgiving Streak
                      </h4>
                      <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                        Miss a day? It enters &lsquo;at-risk&rsquo; and recovers until Isha tomorrow. Bank up to 2 freezes.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-semibold text-[var(--fg)]">
                        The Big Rock · 07:30
                      </h4>
                      <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                        Deep work block locked before client noise. Phone in another room.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Moon className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-semibold text-[var(--fg)]">
                        Muhasaba · 22:30
                      </h4>
                      <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                        Nightly audit, dhikr, plan for tomorrow. The day closes at 03:00 PKT.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => setStep(2)}
                    className="w-full h-11 bg-[var(--gold)] hover:bg-[var(--gold)]/90 text-black font-semibold rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Acknowledge & Continue</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5 flex flex-col justify-between h-full"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--gold)]/10 text-[var(--gold)] flex items-center justify-center mx-auto">
                    <Bell className="w-6 h-6" />
                  </div>

                  <div className="text-center space-y-1">
                    <h2 className="font-serif text-2xl font-semibold text-[var(--fg)]">
                      Enable Notifications
                    </h2>
                    <p className="text-xs text-[var(--muted)] leading-relaxed max-w-[280px] mx-auto">
                      Zain OS uses silent web push to guide your day: prayer calls, deep-work focus, and evening muhasaba.
                    </p>
                  </div>

                  <div className="p-3 bg-[var(--bg)] border border-[var(--border)] rounded-xl space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-[var(--fg)] font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[var(--emerald)]" />
                      <span>Strict 8/day non-prayer cap</span>
                    </div>
                    <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                      Prayer reminders are never dropped. Zero spam, zero marketing, pure accountability.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <Button
                    onClick={handleEnablePush}
                    disabled={subscribing || notificationsEnabled}
                    className="w-full h-11 bg-[var(--gold)] hover:bg-[var(--gold)]/90 text-black font-semibold rounded-xl text-xs cursor-pointer flex items-center justify-center gap-2"
                  >
                    {subscribing ? (
                      <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : notificationsEnabled ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                        <span>Enabled</span>
                      </>
                    ) : (
                      <>
                        <Bell className="w-4 h-4" />
                        <span>Enable Push Notifications</span>
                      </>
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(3)}
                    className="w-full text-xs font-mono text-[var(--muted)] hover:text-[var(--fg)]"
                  >
                    Skip for now
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5 flex flex-col justify-between h-full"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--emerald)]/10 text-[var(--emerald)] flex items-center justify-center mx-auto">
                    <Smartphone className="w-6 h-6" />
                  </div>

                  <div className="text-center space-y-1">
                    <h2 className="font-serif text-2xl font-semibold text-[var(--fg)]">
                      Add to Home Screen
                    </h2>
                    <p className="text-xs text-[var(--muted)] leading-relaxed max-w-[280px] mx-auto">
                      Run Zain OS as a standalone native app on your phone.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <div className="p-3 bg-[var(--bg)] border border-[var(--border)] rounded-xl space-y-1">
                      <div className="flex items-center gap-2 text-xs font-medium text-[var(--fg)]">
                        <Share className="w-3.5 h-3.5 text-[var(--gold)]" />
                        <span>iOS Safari</span>
                      </div>
                      <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                        Tap the Share button at the bottom of Safari, then tap{' '}
                        <strong className="text-[var(--fg)]">Add to Home Screen</strong>.
                      </p>
                    </div>

                    <div className="p-3 bg-[var(--bg)] border border-[var(--border)] rounded-xl space-y-1">
                      <div className="flex items-center gap-2 text-xs font-medium text-[var(--fg)]">
                        <Smartphone className="w-3.5 h-3.5 text-[var(--emerald)]" />
                        <span>Android / Chrome</span>
                      </div>
                      <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                        Tap the three dots menu at the top-right, then select{' '}
                        <strong className="text-[var(--fg)]">Install App</strong>.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handleFinish}
                    className="w-full h-11 bg-[var(--gold)] hover:bg-[var(--gold)]/90 text-black font-semibold rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-[var(--gold-glow)]"
                  >
                    <span>Enter Zain OS</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

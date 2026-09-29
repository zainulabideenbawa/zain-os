'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Compass,
  Flame,
  Moon,
  Bell,
  Smartphone,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Share,
  Clock,
  Sparkles,
  Send,
} from 'lucide-react';
import { urlBase64ToUint8Array } from '@/lib/push-client';
import { getDayPrayerTimes, DEFAULT_JAMAAT_SETTINGS, type JamaatSettings } from '@/lib/prayer';
import { getLogicalDate } from '@/lib/time';
import { getOnboardingInitialData, completeOnboarding } from '@/app/actions/onboarding';
import { toast } from 'sonner';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);
  const [subscribing, setSubscribing] = useState(false);
  const [testingPush, setTestingPush] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [jamaat, setJamaat] = useState<JamaatSettings>(DEFAULT_JAMAAT_SETTINGS);
  const [identityText, setIdentityText] = useState(
    'I am a Muslim who keeps his promises to Allah and to himself, and a builder who ships every day.'
  );
  const [niyyah, setNiyyah] = useState('');
  const [parkedList, setParkedList] = useState<{ id: string; project: string; note: string | null }[]>([]);
  const [personalProject, setPersonalProject] = useState('Agency OS Client Portal');
  const [customProject, setCustomProject] = useState('');

  // Today's prayer times calculated with current jamaat settings
  const logicalDate = getLogicalDate();
  const prayerTimes = getDayPrayerTimes(logicalDate, jamaat);

  // Check standalone mode and load user data on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(Boolean(standalone));

      if ('Notification' in window && Notification.permission === 'granted') {
        setNotificationsEnabled(true);
      }
    }

    async function loadData() {
      try {
        const data = await getOnboardingInitialData();
        if (data.profile) {
          if (data.profile.identity_text) setIdentityText(data.profile.identity_text);
          if (data.profile.niyyah) setNiyyah(data.profile.niyyah);
          if (data.profile.jamaat && typeof data.profile.jamaat === 'object') {
            setJamaat({ ...DEFAULT_JAMAAT_SETTINGS, ...(data.profile.jamaat as Partial<JamaatSettings>) });
          }
        }
        if (data.parked && data.parked.length > 0) {
          setParkedList(data.parked);
        }
        if (data.personalProject) {
          setPersonalProject(data.personalProject);
        }
      } catch (err) {
        console.warn('Could not load initial onboarding data:', err);
      }
    }

    loadData();
  }, []);

  const handleEnablePush = async () => {
    if (!('Notification' in window)) {
      toast.error('Web notifications are not supported on this browser.');
      setStep(4);
      return;
    }

    setSubscribing(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.info('Notifications were not enabled. You can enable them later in settings.');
        setStep(4);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!vapidPublicKey) {
        toast.error('VAPID public key not configured.');
        setNotificationsEnabled(true);
        setStep(4);
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
    } catch (err: unknown) {
      console.error('[Push Subscription error]', err);
      toast.error('Could not subscribe to push alerts. Proceeding to next step.');
    } finally {
      setSubscribing(false);
    }
  };

  const handleSendTestPush = async () => {
    setTestingPush(true);
    try {
      const res = await fetch('/api/push/test', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Test notification delivered! Check your screen.`);
      } else {
        toast.error(data.error || 'Failed to send test push.');
      }
    } catch (err) {
      toast.error('Error sending test notification');
    } finally {
      setTestingPush(false);
    }
  };

  const handleFinishOnboarding = async () => {
    setSubmitting(true);
    try {
      const activeProject = customProject.trim() || personalProject;
      await completeOnboarding({
        jamaat,
        identityText,
        niyyah,
        personalProject: activeProject,
      });

      toast.success('Day 1 starts now. Bismillah.');
      router.push('/today');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to complete onboarding';
      toast.error(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] mx-auto space-y-6">
        {/* Progress indicator */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-7 bg-[var(--gold)]'
                    : s < step
                    ? 'w-2 bg-[var(--gold)]/40'
                    : 'w-2 bg-[var(--line)]'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] font-mono text-[var(--muted)]">
            Step {step} of 7
          </span>
        </div>

        {/* Card Container */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-2xl backdrop-blur-sm min-h-[460px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {/* STEP 1: Welcome + Corrected Rules */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--gold-glow)] text-[var(--gold)] border border-[var(--gold)]/30 text-xs font-mono">
                    <Compass className="w-3.5 h-3.5" />
                    <span>Foundation</span>
                  </div>
                  <h2 className="font-serif text-2xl font-semibold text-[var(--fg)] pt-1">
                    Assalamu alaikum, Zain.
                  </h2>
                  <p className="text-xs text-[var(--muted)]">
                    Five salah, five checkpoints, one streak.
                  </p>
                </div>

                <div className="space-y-2.5 text-xs text-[var(--muted)] leading-relaxed pt-1">
                  <div className="p-3 rounded-xl bg-[#181614] border border-[var(--line)] flex items-start gap-3">
                    <span className="font-mono text-[var(--gold)] font-bold text-sm">1</span>
                    <div>
                      <strong className="text-[var(--fg)] block font-medium">Five Salah Anchors</strong>
                      Fajr, Dhuhr, Asr, Maghrib, and Isha. Every daily habit is anchored to a prayer you already never miss.
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#181614] border border-[var(--line)] flex items-start gap-3">
                    <span className="font-mono text-[var(--gold)] font-bold text-sm">2</span>
                    <div>
                      <strong className="text-[var(--fg)] block font-medium">Muhasaba after Isha (≈20:40)</strong>
                      Accountability and planning for tomorrow happen right after Isha prayer—never delayed until midnight.
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#181614] border border-[var(--line)] flex items-start gap-3">
                    <span className="font-mono text-[var(--gold)] font-bold text-sm">3</span>
                    <div>
                      <strong className="text-[var(--fg)] block font-medium">Forgiving Streak (Next Whole Day)</strong>
                      Missed yesterday? The streak is marked at-risk and saved by keeping the <span className="text-[var(--gold)] font-semibold">next whole day</span>.
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Install Guide (iOS / Standalone) */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--gold-glow)] text-[var(--gold)] border border-[var(--gold)]/30 text-xs font-mono">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Home Screen Setup</span>
                  </div>
                  <h2 className="font-serif text-2xl font-semibold text-[var(--fg)] pt-1">
                    Install to Home Screen
                  </h2>
                  <p className="text-xs text-[var(--muted)]">
                    iOS Web Push notifications require the app to run from your Home Screen.
                  </p>
                </div>

                {isStandalone ? (
                  <div className="p-5 rounded-xl bg-[#141814] border border-emerald-500/30 text-center space-y-2 py-8">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-semibold text-[var(--fg)]">
                      Running from Home Screen
                    </h3>
                    <p className="text-xs text-[var(--muted)]">
                      Standalone PWA mode active. Push notifications are ready to be configured.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    <div className="p-3.5 rounded-xl bg-[#181614] border border-[var(--line)] space-y-2">
                      <div className="flex items-center gap-2 text-xs font-medium text-[var(--fg)]">
                        <Share className="w-4 h-4 text-[var(--gold)]" />
                        <span>1. Tap Share in Safari toolbar</span>
                      </div>
                      <p className="text-[11px] text-[var(--muted)] pl-6">
                        Located at the bottom of Safari on iPhone.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#181614] border border-[var(--line)] space-y-2">
                      <div className="flex items-center gap-2 text-xs font-medium text-[var(--fg)]">
                        <Smartphone className="w-4 h-4 text-[var(--gold)]" />
                        <span>2. Select &ldquo;Add to Home Screen&rdquo;</span>
                      </div>
                      <p className="text-[11px] text-[var(--muted)] pl-6">
                        Scroll down the share sheet and tap &ldquo;Add to Home Screen&rdquo;.
                      </p>
                    </div>

                    <p className="text-[11px] text-[var(--gold)] italic text-center pt-2">
                      Reminders only work after adding to Home Screen.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 3: Enable Reminders */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--gold-glow)] text-[var(--gold)] border border-[var(--gold)]/30 text-xs font-mono">
                    <Bell className="w-3.5 h-3.5" />
                    <span>Notifications</span>
                  </div>
                  <h2 className="font-serif text-2xl font-semibold text-[var(--fg)] pt-1">
                    Enable Reminders
                  </h2>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    Allow reminders. At most 8 a day, plus your prayers. Nothing after 21:45 except Tahajjud.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#181614] border border-[var(--line)] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--muted)] font-mono">Push Permission:</span>
                    <span className="font-mono text-[var(--gold)] font-medium">
                      {notificationsEnabled ? 'Granted ✓' : 'Not yet allowed'}
                    </span>
                  </div>

                  <Button
                    type="button"
                    disabled={subscribing || notificationsEnabled}
                    onClick={handleEnablePush}
                    className="w-full h-11 bg-[var(--gold)] hover:bg-[#b8985c] active:scale-[0.98] text-[#12110F] font-semibold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    {subscribing ? (
                      'Enabling...'
                    ) : notificationsEnabled ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                        <span>Reminders Enabled</span>
                      </>
                    ) : (
                      <>
                        <Bell className="w-4 h-4" />
                        <span>Allow Notifications</span>
                      </>
                    )}
                  </Button>

                  {notificationsEnabled && (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={testingPush}
                      onClick={handleSendTestPush}
                      className="w-full h-10 border-[var(--line)] bg-transparent text-[var(--gold)] hover:bg-white/5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{testingPush ? 'Sending test...' : 'Send Test Notification'}</span>
                    </Button>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 4: Masjid Jamaat Times */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-3"
              >
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--gold-glow)] text-[var(--gold)] border border-[var(--gold)]/30 text-xs font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Prayer Offsets</span>
                  </div>
                  <h2 className="font-serif text-2xl font-semibold text-[var(--fg)] pt-1">
                    Masjid Jamaat Times
                  </h2>
                  <p className="text-xs text-[var(--muted)]">
                    Confirm your masjid&apos;s jamaat times. The app recalculates them every day.
                  </p>
                </div>

                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {prayerTimes.list.map((slot) => {
                    const rule = jamaat[slot.name];
                    return (
                      <div
                        key={slot.name}
                        className="p-2.5 rounded-xl bg-[#181614] border border-[var(--line)] flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span>{slot.emoji}</span>
                          <div>
                            <span className="font-medium text-[var(--fg)] block">{slot.label}</span>
                            <span className="font-mono text-[10px] text-[var(--muted)]">
                              Azan {slot.azanStr} · Jamaat {slot.jamaatStr}
                            </span>
                          </div>
                        </div>

                        {slot.name === 'dhuhr' ? (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-mono text-[var(--muted)]">Fixed:</span>
                            <Input
                              value={rule.fixed || '13:15'}
                              onChange={(e) =>
                                setJamaat((prev) => ({
                                  ...prev,
                                  dhuhr: { fixed: e.target.value },
                                }))
                              }
                              className="w-16 h-7 text-xs font-mono text-center bg-[#12110F] border-[var(--line)] p-1 text-[var(--gold)]"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-mono text-[var(--muted)]">+</span>
                            <Input
                              type="number"
                              value={rule.offset ?? 15}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 0;
                                setJamaat((prev) => ({
                                  ...prev,
                                  [slot.name]: { offset: val },
                                }));
                              }}
                              className="w-12 h-7 text-xs font-mono text-center bg-[#12110F] border-[var(--line)] p-1 text-[var(--gold)]"
                            />
                            <span className="text-[10px] font-mono text-[var(--muted)]">min</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 5: Identity Line + Niyyah */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--gold-glow)] text-[var(--gold)] border border-[var(--gold)]/30 text-xs font-mono">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Identity</span>
                  </div>
                  <h2 className="font-serif text-2xl font-semibold text-[var(--fg)] pt-1">
                    Identity & Niyyah
                  </h2>
                  <p className="text-xs text-[var(--muted)]">
                    Your identity line. Edit it into your own words.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted)] block mb-1">
                      Identity Statement
                    </label>
                    <Textarea
                      value={identityText}
                      onChange={(e) => setIdentityText(e.target.value)}
                      className="bg-[#181614] border-[var(--line)] text-xs min-h-[80px] text-[var(--fg)] rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted)] block mb-1">
                      Cycle Niyyah (Intention)
                    </label>
                    <Input
                      value={niyyah}
                      onChange={(e) => setNiyyah(e.target.value)}
                      placeholder="e.g. Build financial independence to serve the ummah"
                      className="bg-[#181614] border-[var(--line)] text-xs h-10 text-[var(--fg)] rounded-xl font-mono"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 6: Personal Project */}
            {step === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-3"
              >
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--gold-glow)] text-[var(--gold)] border border-[var(--gold)]/30 text-xs font-mono">
                    <Flame className="w-3.5 h-3.5" />
                    <span>Maker Block</span>
                  </div>
                  <h2 className="font-serif text-2xl font-semibold text-[var(--fg)] pt-1">
                    Personal Project
                  </h2>
                  <p className="text-xs text-[var(--muted)]">
                    Pick your personal project for Maker blocks, or type one.
                  </p>
                </div>

                <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                  {parkedList.map((p) => {
                    const isSelected = personalProject === p.project && !customProject;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setPersonalProject(p.project);
                          setCustomProject('');
                        }}
                        className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between text-xs cursor-pointer ${
                          isSelected
                            ? 'bg-[var(--gold-glow)]/40 border-[var(--gold)] text-[var(--fg)] font-semibold'
                            : 'bg-[#181614] border-[var(--line)] text-[var(--muted)] hover:text-[var(--fg)]'
                        }`}
                      >
                        <div>
                          <span>{p.project}</span>
                          {p.note && <span className="block text-[10px] text-[var(--muted)] font-normal">{p.note}</span>}
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[var(--gold)]" />}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <label className="text-[11px] font-mono text-[var(--muted)] block mb-1">
                    Or type a custom project:
                  </label>
                  <Input
                    value={customProject}
                    onChange={(e) => setCustomProject(e.target.value)}
                    placeholder="e.g. LoreOS or Custom Project"
                    className="bg-[#181614] border-[var(--line)] text-xs h-10 text-[var(--fg)] rounded-xl"
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 7: Day 1 Starts Now */}
            {step === 7 && (
              <motion.div
                key="step7"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6 text-center py-6"
              >
                <div className="space-y-3">
                  <span className="font-amiri text-4xl text-[var(--gold)] block" dir="rtl">
                    بِسْمِ اللَّهِ
                  </span>
                  <h2 className="font-serif text-3xl font-semibold text-[var(--fg)]">
                    Day 1 starts now.
                  </h2>
                  <p className="text-xs text-[var(--muted)] max-w-[280px] mx-auto leading-relaxed">
                    Five salah checkpoints, one streak, ninety minutes of Big Rock deep work. Bismillah.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#181614] border border-[var(--line)] text-xs text-left space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Status:</span>
                    <span className="text-[var(--gold)]">Configured</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Schedule:</span>
                    <span className="text-[var(--fg)]">Daily Queue Ready</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Focus:</span>
                    <span className="text-[var(--fg)]">{customProject || personalProject}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-[var(--line)] flex items-center justify-between gap-3">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep((s) => (s - 1) as any)}
                className="h-10 px-4 rounded-xl border-[var(--line)] bg-transparent text-[var(--muted)] hover:text-[var(--fg)] cursor-pointer text-xs"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}

            {step < 7 ? (
              <Button
                type="button"
                onClick={() => setStep((s) => (s + 1) as any)}
                className="h-10 px-6 rounded-xl bg-[var(--gold)] hover:bg-[#b8985c] active:scale-[0.98] text-[#12110F] font-semibold text-xs flex-1 ml-auto max-w-[160px] flex items-center justify-center gap-1 cursor-pointer transition-all shadow-sm"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="button"
                disabled={submitting}
                onClick={handleFinishOnboarding}
                className="h-11 px-6 rounded-xl bg-[var(--gold)] hover:bg-[#b8985c] active:scale-[0.98] text-[#12110F] font-semibold text-xs w-full flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md shadow-[var(--gold)]/20"
              >
                {submitting ? 'Starting...' : 'Enter Zain OS · Bismillah'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

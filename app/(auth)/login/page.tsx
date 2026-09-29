'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, ArrowRight, CheckCircle2, Shield } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('zainulabideenbawa@gmail.com');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const supabase = createClient();
      const origin =
        typeof window !== 'undefined'
          ? window.location.origin
          : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSent(true);
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[390px] mx-auto space-y-8"
      >
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-inner mb-2">
            <span className="font-serif text-2xl font-bold text-[var(--gold)]">
              Z
            </span>
          </div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-[var(--fg)]">
            Zain OS
          </h1>
          <p className="text-xs uppercase tracking-widest text-[var(--muted)] font-mono">
            Karachi · 24.86° N, 67.00° E
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-6">
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4 space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-[var(--emerald-glow)] text-[var(--emerald)] mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-medium text-[var(--fg)]">
                  Check your inbox
                </h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">
                  We sent a magic link to{' '}
                  <span className="text-[var(--gold)] font-mono">{email}</span>.
                  Click the link to sign in.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSent(false)}
                className="text-xs font-mono text-[var(--muted)] hover:text-[var(--fg)] border-[var(--border)]"
              >
                Use another email
              </Button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-xs font-mono uppercase tracking-wider text-[var(--muted)]"
                >
                  Founder Email
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="zainulabideenbawa@gmail.com"
                    required
                    className="pl-10 h-12 bg-[var(--bg)] border-[var(--border)] focus-visible:border-[var(--gold)] text-sm rounded-xl font-mono"
                  />
                  <Mail className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-xl text-xs text-red-400">
                  {errorMsg}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[var(--gold)] hover:bg-[var(--gold)]/90 text-black font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Magic Link</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </Button>
            </form>
          )}

          <div className="pt-2 border-t border-[var(--border)] flex items-center justify-center gap-2 text-[11px] text-[var(--muted)] font-mono">
            <Shield className="w-3.5 h-3.5 text-[var(--gold)]" />
            <span>Single-user encrypted workspace</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

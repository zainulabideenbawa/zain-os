'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Bookmark, Sparkles } from 'lucide-react';
import { parkIdea } from '@/app/actions/today';
import { toast } from 'sonner';

interface ParkIdeaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ParkIdeaDialog({ open, onOpenChange }: ParkIdeaDialogProps) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }

    const res = await parkIdea({ title: title.trim(), notes: notes.trim() });
    if (res.success) {
      toast.success('Idea parked safely. Back to the Big Rock!');
      setTitle('');
      setNotes('');
      onOpenChange(false);
    } else {
      toast.error('Failed to park idea. Please try again.');
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[360px] rounded-2xl bg-[var(--card)] border border-[var(--border)] p-6 space-y-4">
        <DialogHeader className="space-y-1">
          <div className="w-10 h-10 rounded-xl bg-[var(--gold)]/10 text-[var(--gold)] flex items-center justify-center mx-auto mb-1">
            <Bookmark className="w-5 h-5" />
          </div>
          <DialogTitle className="font-serif text-xl font-semibold text-center text-[var(--fg)]">
            Park an Idea
          </DialogTitle>
          <DialogDescription className="text-xs text-center text-[var(--muted)]">
            Capture sudden distractions without breaking your flow.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted)]">
              Idea / Task
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Check client email or new API doc"
              autoFocus
              required
              className="h-10 bg-[var(--bg)] border-[var(--border)] text-xs rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted)]">
              Quick Notes (Optional)
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Context or link..."
              rows={2}
              className="bg-[var(--bg)] border-[var(--border)] text-xs rounded-xl resize-none"
            />
          </div>

          <div className="pt-2 flex items-center gap-2">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 h-10 bg-[var(--gold)] hover:bg-[var(--gold)]/90 text-black font-semibold rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Save & Resume Focus</span>
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 border-[var(--border)] text-xs rounded-xl"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

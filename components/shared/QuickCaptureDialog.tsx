'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Sparkles } from 'lucide-react';
import { saveQuickCapture } from '@/app/actions/capture';
import { toast } from 'sonner';

interface QuickCaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickCaptureDialog({
  open,
  onOpenChange,
}: QuickCaptureDialogProps) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCapture = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;

    setSubmitting(true);
    try {
      const res = await saveQuickCapture(text.trim());
      if (res.success) {
        toast.success('Captured for Sunday review.');
        setText('');
        onOpenChange(false);
      } else {
        toast.error(`Error: ${res.error}`);
      }
    } catch (err: unknown) {
      toast.error('Failed to capture thought');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full bg-neutral-950 text-white border border-white/10 rounded-2xl p-5 shadow-2xl">
        <DialogHeader className="mb-2">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <DialogTitle className="font-cormorant text-xl font-semibold text-white">
              Quick Capture
            </DialogTitle>
          </div>
          <p className="text-xs text-neutral-400">
            Dump fleeting ideas, tasks, or observations. Empty your working memory.
          </p>
        </DialogHeader>

        <form onSubmit={handleCapture} className="space-y-4">
          <Input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. Call supplier about fabric margins on Monday"
            className="bg-neutral-900 border-white/10 text-sm h-11 focus-visible:ring-amber-500"
          />

          <div className="flex items-center justify-between text-[11px] text-neutral-500">
            <span>Reviewed during Sunday Retrospective</span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="border-white/10 text-xs h-8"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submitting || !text.trim()}
                className="bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs h-8 px-4"
              >
                {submitting ? 'Saving...' : 'Capture'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

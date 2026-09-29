'use client';

import React, { useRef, useState } from 'react';
import { Share2, Download, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ShareScorecardProps {
  streak: number;
  bestStreak: number;
  weeklyScore: number;
  deepWorkHours: number;
}

export function ShareScorecard({
  streak,
  bestStreak,
  weeklyScore,
  deepWorkHours,
}: ShareScorecardProps) {
  const [sharing, setSharing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const generateScorecardCanvas = async (): Promise<Blob | null> => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350; // Instagram story / social aspect ratio (4:5)
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, 1080, 1350);

    // Subtle background gradient glow
    const gradient = ctx.createRadialGradient(540, 350, 50, 540, 350, 500);
    gradient.addColorStop(0, 'rgba(245, 158, 11, 0.12)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1350);

    // Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, 1000, 1270);

    // App Header
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ZAIN OS · ACCOUNTABILITY SCORECARD', 540, 130);

    // Subtitle
    ctx.fillStyle = '#a3a3a3';
    ctx.font = '28px sans-serif';
    ctx.fillText('Karachi · 84-Day Founder Cycle', 540, 180);

    // Streak Hero Box
    ctx.fillStyle = '#141414';
    ctx.beginPath();
    ctx.roundRect(140, 240, 800, 280, 24);
    ctx.fill();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
    ctx.stroke();

    // Streak Number
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 120px serif';
    ctx.fillText(`🔥 ${streak}`, 540, 390);

    ctx.fillStyle = '#e5e5e5';
    ctx.font = '32px sans-serif';
    ctx.fillText('Consecutive Kept Days', 540, 460);

    ctx.fillStyle = '#737373';
    ctx.font = '24px monospace';
    ctx.fillText(`All-time Best: ${bestStreak} days`, 540, 495);

    // Two Grid Stat Cards: Weekly Score & Deep Work
    ctx.fillStyle = '#141414';
    ctx.beginPath();
    ctx.roundRect(140, 560, 380, 200, 20);
    ctx.fill();
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
    ctx.stroke();

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 72px monospace';
    ctx.fillText(`${weeklyScore}%`, 330, 660);
    ctx.fillStyle = '#a3a3a3';
    ctx.font = '24px sans-serif';
    ctx.fillText('Weekly Target Score', 330, 720);

    // Deep work hours
    ctx.fillStyle = '#141414';
    ctx.beginPath();
    ctx.roundRect(560, 560, 380, 200, 20);
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 72px monospace';
    ctx.fillText(`${deepWorkHours}h`, 750, 660);
    ctx.fillStyle = '#a3a3a3';
    ctx.font = '24px sans-serif';
    ctx.fillText('Deep Work This Week', 750, 720);

    // Four Pillars Check
    ctx.fillStyle = '#171717';
    ctx.beginPath();
    ctx.roundRect(140, 800, 800, 320, 20);
    ctx.fill();

    ctx.fillStyle = '#d4d4d4';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Four Pillars of Daily Consistency', 190, 850);

    const pillars = [
      { name: 'Deen', desc: '5 Salah on time · Quran · Adhkar · Muhasaba' },
      { name: 'Body', desc: 'Move · Clean Eating · Sleep by 21:45' },
      { name: 'Build', desc: '07:30 Big Rock Deep Work Block' },
      { name: 'Business', desc: 'Revenue Actions · Daily Standup' },
    ];

    pillars.forEach((p, idx) => {
      const y = 910 + idx * 45;
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('✓', 190, y);

      ctx.fillStyle = '#f5f5f5';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(p.name, 230, y);

      ctx.fillStyle = '#737373';
      ctx.font = '20px sans-serif';
      ctx.fillText(`— ${p.desc}`, 340, y);
    });

    // Arabic quote footer
    ctx.textAlign = 'center';
    ctx.fillStyle = '#10b981';
    ctx.font = '36px serif';
    ctx.fillText('أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ', 540, 1190);

    ctx.fillStyle = '#737373';
    ctx.font = 'italic 22px sans-serif';
    ctx.fillText('"The most beloved deeds to Allah are the most consistent, even if small."', 540, 1230);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const blob = await generateScorecardCanvas();
      if (!blob) throw new Error('Could not generate scorecard image');

      const file = new File([blob], 'zain-os-scorecard.png', { type: 'image/png' });

      if (
        typeof navigator !== 'undefined' &&
        'canShare' in navigator &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: 'Zain OS Scorecard',
          text: `🔥 ${streak} Days Kept on Zain OS. Consistency over intensity.`,
          files: [file],
        });
        toast.success('Scorecard shared!');
      } else {
        // Download fallback
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `zain-os-scorecard-${new Date().toISOString().split('T')[0]}.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Scorecard downloaded as PNG image!');
      }
    } catch (err: unknown) {
      if ((err as Error)?.name !== 'AbortError') {
        toast.error('Sharing canceled or unsupported on this device.');
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <Button
      onClick={handleShare}
      disabled={sharing}
      className="w-full h-12 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-white/10 rounded-xl font-medium flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-colors"
    >
      <Share2 className="w-4 h-4 text-amber-400" />
      <span>{sharing ? 'Generating Card...' : 'Share Scorecard'}</span>
    </Button>
  );
}

import React, { useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  remainingSeconds: number;
  totalSeconds: number;
  isRunning: boolean;
  onTick: (nextSeconds: number) => void;
  onTimeUp: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  remainingSeconds,
  totalSeconds,
  isRunning,
  onTick,
  onTimeUp,
}) => {
  const remainingRef = useRef(remainingSeconds);
  remainingRef.current = remainingSeconds;

  useEffect(() => {
    if (!isRunning) return;
    const timer = window.setInterval(() => {
      const next = remainingRef.current - 1;
      if (next <= 0) {
        window.clearInterval(timer);
        onTick(0);
        onTimeUp();
      } else {
        onTick(next);
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isRunning, onTick, onTimeUp]);

  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const isUrgent = remainingSeconds <= Math.max(30, totalSeconds * 0.15);

  return (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-sm font-mono font-bold tabular-nums transition-colors ${
        isUrgent
          ? 'bg-rose-50 border-rose-300 text-rose-700'
          : 'bg-slate-50 border-slate-200 text-slate-800'
      }`}
      aria-live="polite"
      aria-label={`Thời gian còn lại ${formatted}`}
    >
      <Clock className={`w-4 h-4 ${isUrgent ? 'text-rose-600' : 'text-blue-600'}`} />
      <span>{formatted}</span>
    </div>
  );
};

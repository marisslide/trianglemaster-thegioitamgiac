import React from 'react';
import { Flame, Star } from 'lucide-react';
import { GameMode } from '../types';
import { CountdownTimer } from './CountdownTimer';

interface ScoreBoardProps {
  gameTitle: string;
  mode: GameMode;
  currentIndex: number;
  totalQuestions: number;
  sessionPoints: number;
  correctCount: number;
  streak: number;
  accentColor: string;
  remainingSeconds: number;
  totalDurationSeconds: number;
  timerRunning: boolean;
  onTickTimer: (next: number) => void;
  onTimeUp: () => void;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  gameTitle,
  mode,
  currentIndex,
  totalQuestions,
  sessionPoints,
  correctCount,
  streak,
  accentColor,
  remainingSeconds,
  totalDurationSeconds,
  timerRunning,
  onTickTimer,
  onTimeUp,
}) => {
  const progressPercent =
    totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-slate-500">
            {mode === 'practice' ? 'Chế độ Luyện tập' : 'Chế độ Thử thách có tính giờ'}
          </div>
          <h2 className="font-display text-base sm:text-lg font-extrabold text-slate-900">
            {gameTitle}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {mode === 'challenge' && (
            <CountdownTimer
              remainingSeconds={remainingSeconds}
              totalSeconds={totalDurationSeconds}
              isRunning={timerRunning}
              onTick={onTickTimer}
              onTimeUp={onTimeUp}
            />
          )}

          <div className="flex items-center gap-4 text-sm font-semibold tabular-nums">
            <div className="flex items-center gap-1.5 text-amber-600">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              <span>+{sessionPoints} điểm</span>
            </div>
            {streak >= 2 && (
              <div className="flex items-center gap-1 text-orange-600">
                <Flame className="w-4 h-4 fill-orange-500 text-orange-600" />
                <span>Chuỗi {streak}</span>
              </div>
            )}
            <div className="text-slate-600">
              Đúng <span className="text-slate-900 font-bold">{correctCount}</span>/{totalQuestions}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500 tabular-nums">
          <span>
            Câu hỏi {Math.min(currentIndex + 1, totalQuestions)} / {totalQuestions}
          </span>
          <span>{progressPercent}%</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: accentColor,
            }}
          />
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Award, Compass, Crown, Lock, Ruler, Shield, Triangle } from 'lucide-react';
import { STAGES } from '../data/stages';

interface BadgeSystemProps {
  earnedBadgeIds: string[];
  compact?: boolean;
}

export function getStageIcon(stageId: number, className = 'w-6 h-6') {
  switch (stageId) {
    case 1:
      return <Compass className={className} />;
    case 2:
      return <Triangle className={className} />;
    case 3:
      return <Ruler className={className} />;
    case 4:
      return <Shield className={className} />;
    case 5:
      return <Award className={className} />;
    case 6:
    default:
      return <Crown className={className} />;
  }
}

export const BadgeSystem: React.FC<BadgeSystemProps> = ({ earnedBadgeIds, compact = false }) => {
  const earnedSet = new Set(earnedBadgeIds);

  return (
    <div
      className={
        compact
          ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3'
          : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
      }
    >
      {STAGES.map((stage) => {
        const isEarned = earnedSet.has(stage.badge.id);
        return (
          <div
            key={stage.badge.id}
            className={`rounded-2xl border p-4 transition-all ${
              isEarned
                ? 'bg-white border-slate-200 shadow-sm'
                : 'bg-slate-50/80 border-slate-200/80 opacity-75'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: isEarned ? `${stage.accentColor}1A` : '#E2E8F0',
                  color: isEarned ? stage.accentColor : '#94A3B8',
                }}
              >
                {isEarned ? getStageIcon(stage.id, 'w-6 h-6') : <Lock className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-500">
                  {stage.code} · {isEarned ? 'Đã sở hữu' : 'Chưa mở khóa'}
                </div>
                <div className="font-display font-bold text-sm sm:text-[15px] text-slate-900 leading-snug mt-0.5">
                  {stage.badge.name}
                </div>
                {!compact && (
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {stage.badge.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

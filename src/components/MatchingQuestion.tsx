import React, { useMemo, useState } from 'react';
import { CheckCircle2, Link2, RotateCcw, XCircle } from 'lucide-react';
import { Question } from '../types';

interface MatchingQuestionProps {
  question: Question;
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
  disabled: boolean;
  showResult: boolean;
}

function deterministicShuffle<T>(items: T[], seedStr: string): T[] {
  const arr = [...items];
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed = (seed * 31 + seedStr.charCodeAt(i)) % 9973;
  }
  for (let i = arr.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const j = seed % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const MatchingQuestion: React.FC<MatchingQuestionProps> = ({
  question,
  value,
  onChange,
  disabled,
  showResult,
}) => {
  const pairs = question.matchingPairs ?? [];
  const [activeLeftId, setActiveLeftId] = useState<string | null>(null);
  const [draggedRightText, setDraggedRightText] = useState<string | null>(null);

  const rightChoices = useMemo(
    () => deterministicShuffle(pairs.map((p) => p.right), question.id),
    [pairs, question.id]
  );

  const assignPair = (leftId: string, rightText: string) => {
    if (disabled) return;
    const next = { ...value };
    // Remove rightText from any other slot to enforce 1-to-1 matching
    for (const key of Object.keys(next)) {
      if (next[key] === rightText) {
        delete next[key];
      }
    }
    next[leftId] = rightText;
    onChange(next);
    setActiveLeftId(null);
  };

  const clearPair = (leftId: string) => {
    if (disabled) return;
    const next = { ...value };
    delete next[leftId];
    onChange(next);
  };

  const usedRightValues = new Set(Object.values(value));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-slate-600">
        <span>
          Kéo thẻ bên phải thả vào ô tương ứng bên trái, hoặc <strong>chạm chọn</strong> vế trái rồi chạm thẻ bên phải (tiện lợi cho điện thoại).
        </span>
        {!disabled && Object.keys(value).length > 0 && (
          <button
            type="button"
            onClick={() => {
              onChange({});
              setActiveLeftId(null);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Ghép lại
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left column: Targets */}
        <div className="lg:col-span-7 space-y-3">
          <div className="text-xs font-semibold text-slate-500">Cột A — Giả thiết / Yếu tố</div>
          {pairs.map((pair, idx) => {
            const matchedRight = value[pair.id];
            const isSelectedLeft = activeLeftId === pair.id;
            const isPairCorrect = matchedRight === pair.right;

            let boxClass = 'border-slate-200 bg-white';
            if (showResult) {
              boxClass = isPairCorrect
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-rose-500 bg-rose-50';
            } else if (isSelectedLeft) {
              boxClass = 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-600/20';
            } else if (matchedRight) {
              boxClass = 'border-teal-400 bg-teal-50/50';
            }

            return (
              <div
                key={pair.id}
                onClick={() => {
                  if (!disabled) setActiveLeftId(pair.id);
                }}
                onDragOver={(e) => {
                  if (!disabled) e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const dropped = e.dataTransfer.getData('text/plain') || draggedRightText;
                  if (dropped) {
                    assignPair(pair.id, dropped);
                  }
                  setDraggedRightText(null);
                }}
                className={`rounded-xl border-2 p-3.5 transition-all ${boxClass} ${
                  disabled ? '' : 'cursor-pointer hover:border-blue-400'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-semibold text-slate-800 leading-snug">
                      {pair.left}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {matchedRight ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900">
                        <Link2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>{matchedRight}</span>
                        {!disabled && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              clearPair(pair.id);
                            }}
                            className="ml-1 text-slate-400 hover:text-rose-600 font-bold"
                            aria-label="Xóa cặp này"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-slate-400 px-3 py-1.5 rounded-lg border border-dashed border-slate-300">
                        {isSelectedLeft ? 'Chọn thẻ ở Cột B →' : 'Chạm hoặc thả vào đây'}
                      </span>
                    )}

                    {showResult &&
                      (isPairCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      ))}
                  </div>
                </div>

                {showResult && !isPairCorrect && (
                  <div className="mt-2 pt-2 border-t border-rose-200 text-xs font-semibold text-emerald-800">
                    Ghép đúng: {pair.right}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right column: Draggable / Tappable Choices */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-semibold text-slate-500">Cột B — Đáp án ghép cặp</div>
          <div className="grid grid-cols-1 gap-2.5">
            {rightChoices.map((rightText) => {
              const isUsed = usedRightValues.has(rightText);
              return (
                <button
                  key={rightText}
                  type="button"
                  disabled={disabled}
                  draggable={!disabled}
                  onDragStart={(e) => {
                    setDraggedRightText(rightText);
                    e.dataTransfer.setData('text/plain', rightText);
                  }}
                  onClick={() => {
                    if (disabled) return;
                    if (activeLeftId) {
                      assignPair(activeLeftId, rightText);
                    } else {
                      // Auto-assign to first empty slot for rapid mobile ergonomics
                      const firstEmpty = pairs.find((p) => !value[p.id]);
                      if (firstEmpty) {
                        assignPair(firstEmpty.id, rightText);
                      }
                    }
                  }}
                  className={`w-full text-left px-4 py-3 min-h-[48px] rounded-xl border-2 text-sm font-semibold transition-all ${
                    isUsed
                      ? 'border-slate-200 bg-slate-100 text-slate-400'
                      : activeLeftId
                      ? 'border-blue-300 bg-blue-50/60 text-blue-900 hover:border-blue-600 hover:bg-blue-100/70'
                      : 'border-slate-200 bg-white text-slate-800 hover:border-blue-400 hover:bg-slate-50'
                  } ${disabled ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
                >
                  {rightText}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

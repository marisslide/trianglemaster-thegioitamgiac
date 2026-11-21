import React, { useState } from 'react';
import { ArrowDown, ArrowUp, CheckCircle2, GripVertical, XCircle } from 'lucide-react';
import { Question } from '../types';

interface OrderingQuestionProps {
  question: Question;
  order: string[];
  onChange: (nextOrder: string[]) => void;
  disabled: boolean;
  showResult: boolean;
}

export const OrderingQuestion: React.FC<OrderingQuestionProps> = ({
  question,
  order,
  onChange,
  disabled,
  showResult,
}) => {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const steps = question.orderingSteps ?? [];
  const stepMap = new Map(steps.map((s) => [s.id, s.text]));
  const expectedOrder = Array.isArray(question.correctAnswer) ? question.correctAnswer : [];

  const moveItem = (fromIdx: number, toIdx: number) => {
    if (disabled || toIdx < 0 || toIdx >= order.length || fromIdx === toIdx) return;
    const next = [...order];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs sm:text-sm text-slate-600">
        Kéo thả các bước chứng minh hoặc dùng nút mũi tên lên/xuống để sắp xếp theo trình tự toán học chặt chẽ từ Bước 1 đến bước kết luận.
      </p>

      <div className="space-y-2.5">
        {order.map((stepId, idx) => {
          const text = stepMap.get(stepId) ?? '';
          const isPositionCorrect = expectedOrder[idx] === stepId;

          let cardClass = 'border-slate-200 bg-white hover:border-blue-300';
          if (showResult) {
            cardClass = isPositionCorrect
              ? 'border-emerald-500 bg-emerald-50'
              : 'border-rose-500 bg-rose-50';
          } else if (dragIdx === idx) {
            cardClass = 'border-blue-600 bg-blue-50 opacity-75';
          }

          return (
            <div
              key={stepId}
              draggable={!disabled}
              onDragStart={() => setDragIdx(idx)}
              onDragOver={(e) => {
                if (!disabled) e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIdx !== null) {
                  moveItem(dragIdx, idx);
                }
                setDragIdx(null);
              }}
              onDragEnd={() => setDragIdx(null)}
              className={`rounded-xl border-2 p-3.5 flex items-center justify-between gap-3 transition-all ${cardClass} ${
                disabled ? '' : 'cursor-grab active:cursor-grabbing'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                  {!disabled && <GripVertical className="w-4 h-4 text-slate-400" />}
                  <span className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center tabular-nums">
                    {idx + 1}
                  </span>
                </div>
                <p className="text-sm sm:text-[15px] font-medium text-slate-800 leading-relaxed">
                  {text}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {!disabled ? (
                  <>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveItem(idx, idx - 1)}
                      className="p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
                      aria-label="Chuyển lên trên"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === order.length - 1}
                      onClick={() => moveItem(idx, idx + 1)}
                      className="p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
                      aria-label="Chuyển xuống dưới"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </>
                ) : isPositionCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showResult && !order.every((id, i) => id === expectedOrder[i]) && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 space-y-2">
          <div className="text-sm font-bold text-emerald-900">Trình tự chứng minh chuẩn:</div>
          <ol className="space-y-1.5 text-sm text-emerald-950 list-decimal list-inside">
            {expectedOrder.map((id) => (
              <li key={id} className="leading-relaxed">
                {stepMap.get(id)}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

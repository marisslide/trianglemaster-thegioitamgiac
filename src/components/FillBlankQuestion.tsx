import React from 'react';
import { Question } from '../types';

interface FillBlankQuestionProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  onSubmitEnter?: () => void;
  disabled: boolean;
  showResult: boolean;
  isCorrect?: boolean;
}

export const FillBlankQuestion: React.FC<FillBlankQuestionProps> = ({
  question,
  value,
  onChange,
  onSubmitEnter,
  disabled,
  showResult,
  isCorrect,
}) => {
  const unit = question.unit || '';

  let borderClass = 'border-slate-300 focus:border-blue-600 focus:ring-blue-600/20 bg-white';
  if (showResult) {
    borderClass = isCorrect
      ? 'border-emerald-500 bg-emerald-50 text-emerald-950'
      : 'border-rose-500 bg-rose-50 text-rose-950';
  }

  return (
    <div className="space-y-3">
      <label
        htmlFor={`fill_${question.id}`}
        className="block text-sm font-semibold text-slate-700"
      >
        Nhập đáp án số của bạn (chấp nhận số nguyên hoặc thập phân dùng dấu phẩy hoặc dấu chấm):
      </label>

      <div className="flex items-center gap-3 max-w-md">
        <div className="relative flex-1">
          <input
            id={`fill_${question.id}`}
            type="text"
            inputMode="decimal"
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !disabled && value.trim() && onSubmitEnter) {
                e.preventDefault();
                onSubmitEnter();
              }
            }}
            placeholder="Ví dụ: 70 hoặc 55,5"
            className={`w-full px-4 py-3.5 text-lg font-math font-semibold rounded-xl border-2 outline-none focus:ring-4 transition-all ${borderClass}`}
            autoComplete="off"
          />
          {unit && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-base font-bold text-slate-500 select-none">
              {unit.trim()}
            </span>
          )}
        </div>
      </div>

      {showResult && !isCorrect && (
        <p className="text-sm font-semibold text-emerald-700">
          Đáp án chính xác:{' '}
          <span className="font-math">
            {String(question.correctAnswer)}
            {unit}
          </span>
        </p>
      )}
    </div>
  );
};

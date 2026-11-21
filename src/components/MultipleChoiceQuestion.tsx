import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Question } from '../types';

interface MultipleChoiceQuestionProps {
  question: Question;
  selected: string;
  onChange: (value: string) => void;
  disabled: boolean;
  showResult: boolean;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E'];

export const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  question,
  selected,
  onChange,
  disabled,
  showResult,
}) => {
  const options = question.options ?? [];
  const correctValue = String(question.correctAnswer);
  const isShortOptions = options.every((opt) => opt.length <= 48);

  return (
    <div
      className={
        question.questionType === 'true_false' || isShortOptions
          ? 'grid grid-cols-1 sm:grid-cols-2 gap-3'
          : 'grid grid-cols-1 gap-3'
      }
      role="radiogroup"
      aria-label="Các lựa chọn trả lời"
    >
      {options.map((opt, idx) => {
        const isSelected = selected === opt;
        const isCorrectOpt = opt === correctValue;

        let cardStyle =
          'border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/40 text-slate-800';
        let letterStyle = 'bg-slate-100 text-slate-700 border-slate-200';

        if (showResult) {
          if (isCorrectOpt) {
            cardStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950';
            letterStyle = 'bg-emerald-600 text-white border-emerald-600';
          } else if (isSelected && !isCorrectOpt) {
            cardStyle = 'border-rose-500 bg-rose-50 text-rose-950';
            letterStyle = 'bg-rose-600 text-white border-rose-600';
          } else {
            cardStyle = 'border-slate-200 bg-slate-50/70 text-slate-500';
          }
        } else if (isSelected) {
          cardStyle = 'border-blue-600 bg-blue-50 text-blue-950 ring-2 ring-blue-600/20';
          letterStyle = 'bg-blue-600 text-white border-blue-600';
        }

        return (
          <button
            key={opt}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt)}
            aria-checked={isSelected}
            role="radio"
            className={`w-full text-left px-4 py-3.5 min-h-[54px] rounded-xl border-2 transition-all duration-150 flex items-center justify-between gap-3 ${cardStyle} ${
              disabled ? 'cursor-default' : 'cursor-pointer active:scale-[0.99]'
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <span
                className={`w-8 h-8 rounded-lg border text-sm font-bold flex items-center justify-center shrink-0 transition-colors ${letterStyle}`}
              >
                {OPTION_LETTERS[idx] || idx + 1}
              </span>
              <span className="text-[15px] font-medium leading-snug">{opt}</span>
            </div>

            {showResult && isCorrectOpt && (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            )}
            {showResult && isSelected && !isCorrectOpt && (
              <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
          </button>
        );
      })}
    </div>
  );
};

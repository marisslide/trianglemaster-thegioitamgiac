import React from 'react';
import { Question } from '../types';
import { TriangleDiagram } from './TriangleDiagram';
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion';
import { FillBlankQuestion } from './FillBlankQuestion';
import { MatchingQuestion } from './MatchingQuestion';
import { OrderingQuestion } from './OrderingQuestion';

export type QuestionAnswerValue = string | Record<string, string> | string[];

interface QuestionRendererProps {
  question: Question;
  answerValue: QuestionAnswerValue;
  onChange: (value: QuestionAnswerValue) => void;
  onSubmitEnter?: () => void;
  disabled: boolean;
  showResult: boolean;
  isCorrect?: boolean;
  children?: React.ReactNode;
}

const QUESTION_TYPE_LABELS: Record<Question['questionType'], string> = {
  multiple_choice: 'Trắc nghiệm lựa chọn',
  true_false: 'Đúng hay Sai',
  fill_blank: 'Điền đáp án số',
  matching: 'Ghép cặp tương ứng',
  ordering: 'Sắp xếp bước chứng minh',
};

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  answerValue,
  onChange,
  onSubmitEnter,
  disabled,
  showResult,
  isCorrect,
  children,
}) => {
  const renderMeta = () => (
    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
      <span className="text-blue-700 font-semibold">{question.difficulty}</span>
      <span aria-hidden="true">·</span>
      <span>{QUESTION_TYPE_LABELS[question.questionType]}</span>
      <span aria-hidden="true">·</span>
      <span>{question.knowledgeTag}</span>
      <span aria-hidden="true">·</span>
      <span className="font-mono tabular-nums text-slate-700">+{question.score} điểm</span>
    </div>
  );

  const renderAnswerInput = () => (
    <div className="pt-1">
      {(question.questionType === 'multiple_choice' ||
        question.questionType === 'true_false') && (
        <MultipleChoiceQuestion
          question={question}
          selected={typeof answerValue === 'string' ? answerValue : ''}
          onChange={(val) => onChange(val)}
          disabled={disabled}
          showResult={showResult}
        />
      )}

      {question.questionType === 'fill_blank' && (
        <FillBlankQuestion
          question={question}
          value={typeof answerValue === 'string' ? answerValue : ''}
          onChange={(val) => onChange(val)}
          onSubmitEnter={onSubmitEnter}
          disabled={disabled}
          showResult={showResult}
          isCorrect={isCorrect}
        />
      )}

      {question.questionType === 'matching' && (
        <MatchingQuestion
          question={question}
          value={
            typeof answerValue === 'object' && !Array.isArray(answerValue) ? answerValue : {}
          }
          onChange={(val) => onChange(val)}
          disabled={disabled}
          showResult={showResult}
        />
      )}

      {question.questionType === 'ordering' && (
        <OrderingQuestion
          question={question}
          order={
            Array.isArray(answerValue)
              ? answerValue
              : (question.orderingSteps ?? []).map((s) => s.id)
          }
          onChange={(val) => onChange(val)}
          disabled={disabled}
          showResult={showResult}
        />
      )}
    </div>
  );

  if (question.diagramData) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left column: Diagram & Prompt on horizontal viewports */}
        <div className="lg:col-span-5 xl:col-span-6 space-y-4">
          {renderMeta()}
          <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 leading-snug">
            {question.question}
          </h2>
          <div className="lg:sticky lg:top-20">
            <TriangleDiagram data={question.diagramData} />
          </div>
        </div>

        {/* Right column: Answer options and controls/feedback */}
        <div className="lg:col-span-7 xl:col-span-6 space-y-5">
          {renderAnswerInput()}
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {renderMeta()}

      <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 leading-snug">
        {question.question}
      </h2>

      {renderAnswerInput()}
      {children}
    </div>
  );
};

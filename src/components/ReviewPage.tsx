import React, { useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, Filter, XCircle } from 'lucide-react';
import { StudentRecord } from '../types';
import { STAGES } from '../data/stages';
import { getQuestionById } from '../data/questionBank';
import { TriangleDiagram } from './TriangleDiagram';

interface ReviewPageProps {
  student: StudentRecord;
  onSelectStage: (stageId: number) => void;
}

export const ReviewPage: React.FC<ReviewPageProps> = ({ student, onSelectStage }) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'wrong' | 'correct'>('wrong');
  const [stageFilter, setStageFilter] = useState<number>(0);

  const attempts = useMemo(() => {
    const all = Object.values(student.questionAttempts).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return all.filter((att) => {
      if (statusFilter === 'wrong' && att.isCorrect) return false;
      if (statusFilter === 'correct' && !att.isCorrect) return false;
      if (stageFilter !== 0 && att.stageId !== stageFilter) return false;
      return true;
    });
  }, [student.questionAttempts, statusFilter, stageFilter]);

  const totalAll = Object.keys(student.questionAttempts).length;
  const totalWrong = Object.values(student.questionAttempts).filter((a) => !a.isCorrect).length;
  const totalCorrect = totalAll - totalWrong;

  return (
    <div className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-blue-700">ÔN TẬP & CỦNG CỐ</div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
            Xem lại câu đã làm & Lời giải chi tiết
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Kiểm tra lại đáp án, giải thích toán học và kiến thức cần ghi nhớ cho mọi câu hỏi bạn đã thực hiện.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl">
            <button
              type="button"
              onClick={() => setStatusFilter('wrong')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                statusFilter === 'wrong'
                  ? 'bg-white text-rose-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Câu sai ({totalWrong})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('correct')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                statusFilter === 'correct'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Câu đúng ({totalCorrect})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({totalAll})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(Number(e.target.value))}
              aria-label="Lọc theo chặng"
              className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 outline-none focus:border-blue-600"
            >
              <option value={0}>Tất cả 6 chặng</option>
              {STAGES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code}: {s.shortName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {attempts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-4">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <div className="space-y-1">
            <h2 className="font-display text-lg font-bold text-slate-900">
              {totalAll === 0
                ? 'Chưa có câu hỏi nào được ghi nhận'
                : statusFilter === 'wrong'
                ? 'Tuyệt vời! Không có câu sai nào trong bộ lọc hiện tại'
                : 'Không có câu hỏi nào khớp với bộ lọc'}
            </h2>
            <p className="text-sm text-slate-500">
              {totalAll === 0
                ? 'Hãy vào Chặng 1 và bắt đầu luyện tập để lưu kết quả ôn tập tại đây.'
                : 'Bạn có thể chuyển sang tab "Tất cả" hoặc luyện tập thêm các chặng mới.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelectStage(stageFilter || 1)}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700"
          >
            Luyện tập ngay
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {attempts.map((att) => {
            const q = getQuestionById(att.questionId);
            if (!q) return null;
            return (
              <article
                key={att.questionId}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                    <span className="text-blue-700">Chặng {q.stageId}</span>
                    <span aria-hidden="true">·</span>
                    <span>{q.difficulty}</span>
                    <span aria-hidden="true">·</span>
                    <span>{q.knowledgeTag}</span>
                  </div>

                  {att.isCorrect ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4" />
                      Trả lời đúng
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700">
                      <XCircle className="w-4 h-4" />
                      Cần ôn lại
                    </span>
                  )}
                </div>

                {q.diagramData ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-5 space-y-3">
                      <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {q.question}
                      </h3>
                      <div className="lg:sticky lg:top-20">
                        <TriangleDiagram data={q.diagramData} compact />
                      </div>
                    </div>

                    <div className="lg:col-span-7 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div
                          className={`rounded-xl p-3.5 border ${
                            att.isCorrect
                              ? 'bg-emerald-50 border-emerald-200'
                              : 'bg-rose-50 border-rose-200'
                          }`}
                        >
                          <div className="text-xs font-semibold text-slate-500">Câu trả lời của bạn</div>
                          <div className="font-bold text-slate-900 mt-0.5">{att.userAnswer}</div>
                        </div>
                        <div className="rounded-xl p-3.5 border bg-emerald-50/70 border-emerald-200">
                          <div className="text-xs font-semibold text-emerald-800">Đáp án chuẩn</div>
                          <div className="font-bold text-emerald-950 mt-0.5">
                            {att.correctAnswerDisplay}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-sm">
                        <div>
                          <span className="font-bold text-slate-900">Giải thích: </span>
                          <span className="text-slate-700 leading-relaxed">{q.explanation}</span>
                        </div>
                        <div>
                          <span className="font-bold text-blue-800">Kiến thức cần ôn tập: </span>
                          <span className="text-slate-700">{q.keyKnowledge}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      {q.question}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div
                        className={`rounded-xl p-3.5 border ${
                          att.isCorrect
                            ? 'bg-emerald-50 border-emerald-200'
                            : 'bg-rose-50 border-rose-200'
                        }`}
                      >
                        <div className="text-xs font-semibold text-slate-500">Câu trả lời của bạn</div>
                        <div className="font-bold text-slate-900 mt-0.5">{att.userAnswer}</div>
                      </div>
                      <div className="rounded-xl p-3.5 border bg-emerald-50/70 border-emerald-200">
                        <div className="text-xs font-semibold text-emerald-800">Đáp án chuẩn</div>
                        <div className="font-bold text-emerald-950 mt-0.5">
                          {att.correctAnswerDisplay}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-sm">
                      <div>
                        <span className="font-bold text-slate-900">Giải thích: </span>
                        <span className="text-slate-700 leading-relaxed">{q.explanation}</span>
                      </div>
                      <div>
                        <span className="font-bold text-blue-800">Kiến thức cần ôn tập: </span>
                        <span className="text-slate-700">{q.keyKnowledge}</span>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

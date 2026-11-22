import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  FileSearch,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  XCircle,
} from 'lucide-react';
import { ErrorDiagnosisCase, StudentRecord } from '../types';
import { ERROR_DIAGNOSIS_CASES } from '../data/errorDiagnosisBank';
import { TriangleDiagram } from './TriangleDiagram';

interface ErrorDiagnosisLabProps {
  student: StudentRecord;
  onUpdateStudent: (updated: StudentRecord) => void;
  onBackToMap: () => void;
}

export const ErrorDiagnosisLab: React.FC<ErrorDiagnosisLabProps> = ({
  student,
  onUpdateStudent,
  onBackToMap,
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    ERROR_DIAGNOSIS_CASES[0].id
  );

  const currentCase =
    ERROR_DIAGNOSIS_CASES.find((c) => c.id === selectedCaseId) ||
    ERROR_DIAGNOSIS_CASES[0];

  // Interactive step state for current case:
  // Step 1: Detect wrong step number
  // Step 2: Choose wrong reason
  // Step 3: Choose correction
  // Step 4: Completed
  const [selectedStepNum, setSelectedStepNum] = useState<number | null>(null);
  const [step1Feedback, setStep1Feedback] = useState<boolean | null>(null);

  const [selectedReason, setSelectedReason] = useState<string>('');
  const [step2Feedback, setStep2Feedback] = useState<boolean | null>(null);

  const [selectedCorrection, setSelectedCorrection] = useState<string>('');
  const [step3Feedback, setStep3Feedback] = useState<boolean | null>(null);

  const [caseDone, setCaseDone] = useState<boolean>(false);

  const completedIds = student.completedErrorCaseIds || [];
  const isCurrentCompleted = completedIds.includes(currentCase.id);

  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setSelectedStepNum(null);
    setStep1Feedback(null);
    setSelectedReason('');
    setStep2Feedback(null);
    setSelectedCorrection('');
    setStep3Feedback(null);
    setCaseDone(false);
  };

  const handleCheckStep1 = (stepNum: number) => {
    if (caseDone) return;
    setSelectedStepNum(stepNum);
    const isCorrect = stepNum === currentCase.wrongStepNum;
    setStep1Feedback(isCorrect);
  };

  const handleCheckStep2 = (reason: string) => {
    if (caseDone) return;
    setSelectedReason(reason);
    const isCorrect = reason === currentCase.correctReason;
    setStep2Feedback(isCorrect);
  };

  const handleCheckStep3 = (correction: string) => {
    if (caseDone) return;
    setSelectedCorrection(correction);
    const isCorrect = correction === currentCase.correctCorrection;
    setStep3Feedback(isCorrect);

    if (isCorrect) {
      setCaseDone(true);
      // Award points if not completed yet
      if (!completedIds.includes(currentCase.id)) {
        const nextCompleted = [...completedIds, currentCase.id];
        const updated: StudentRecord = {
          ...student,
          totalPoints: student.totalPoints + 20, // +20 bonus for critical thinking
          completedErrorCaseIds: nextCompleted,
          lastActiveAt: new Date().toISOString(),
        };
        onUpdateStudent(updated);
      }
    }
  };

  const handleResetCurrentCase = () => {
    setSelectedStepNum(null);
    setStep1Feedback(null);
    setSelectedReason('');
    setStep2Feedback(null);
    setSelectedCorrection('');
    setStep3Feedback(null);
    setCaseDone(false);
  };

  const currentCaseIndex = ERROR_DIAGNOSIS_CASES.findIndex(
    (c) => c.id === currentCase.id
  );
  const nextCase = ERROR_DIAGNOSIS_CASES[currentCaseIndex + 1];

  return (
    <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBackToMap}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại Bản đồ hành trình
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-full">
          <Stethoscope className="w-4 h-4 text-amber-600" />
          <span>
            Đã hoàn thành chẩn đoán: <strong>{completedIds.length}</strong> /{' '}
            {ERROR_DIAGNOSIS_CASES.length} tình huống (+
            {completedIds.length * 20} điểm thưởng)
          </span>
        </div>
      </div>

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-3xl space-y-2.5">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-amber-300 uppercase bg-white/10 px-3 py-1 rounded-full backdrop-blur-xs">
            <FileSearch className="w-3.5 h-3.5" />
            Biện pháp 3: Phát hiện và sửa lỗi sai trong giải toán hình học
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
            PHÒNG CHẨN ĐOÁN & SỬA LỖI SAI HÌNH HỌC
          </h1>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
            Trở thành "Thám tử Toán học": Soi chiếu từng bước giải, vạch trần cạm bẫy ngộ nhận, giải mã nguyên nhân và điều chỉnh bài chứng minh thành lời giải chuẩn mực!
          </p>
        </div>
      </section>

      {/* Main Two-Column Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Case Selector List (4 cols on lg, 3 on xl) */}
        <aside className="lg:col-span-4 xl:col-span-4 space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                Hồ sơ lỗi sai kinh điển ({ERROR_DIAGNOSIS_CASES.length})
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Chọn hồ sơ bên dưới để bắt đầu quy trình phản biện và chẩn đoán lỗi:
            </p>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {ERROR_DIAGNOSIS_CASES.map((item, idx) => {
                const isSelected = item.id === currentCase.id;
                const isDone = completedIds.includes(item.id);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectCase(item.id)}
                    className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                        <span className="text-blue-700 font-bold">{item.stageCode}</span>
                        <span>·</span>
                        <span className="truncate">{item.topic}</span>
                      </div>
                      <div className="text-xs sm:text-[13px] font-bold text-slate-900 line-clamp-2 mt-0.5">
                        {item.title}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Right Column: Case Analysis & Interactive Repair Workspace (8 cols on lg, 8 on xl) */}
        <main className="lg:col-span-8 xl:col-span-8 space-y-6">
          {/* Active Case Card */}
          <article className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
            {/* Header info */}
            <div className="space-y-2 border-b border-slate-100 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
                  <span className="px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200">
                    {currentCase.stageCode}
                  </span>
                  <span>{currentCase.topic}</span>
                </div>

                {isCurrentCompleted && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Đã hoàn thành chẩn đoán
                  </span>
                )}
              </div>

              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                {currentCase.title}
              </h2>
            </div>

            {/* Problem Statement Box */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Đề bài bài toán
              </div>
              <p className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
                {currentCase.problem}
              </p>

              {/* Diagram if available */}
              {currentCase.diagramData && (
                <div className="pt-2">
                  <TriangleDiagram data={currentCase.diagramData} compact />
                </div>
              )}
            </div>

            {/* TASK 1: IDENTIFY THE WRONG STEP */}
            <section className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  Nhiệm vụ 1: Soi chiếu lời giải – Bước nào chứa lỗi sai?
                </h3>

                <span className="text-xs text-slate-500">
                  Nhấn vào thẻ bước để chọn
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {currentCase.solutionSteps.map((step) => {
                  const isSelected = selectedStepNum === step.stepNum;
                  const isWrongStep = step.stepNum === currentCase.wrongStepNum;

                  let borderClass = 'border-slate-200 hover:border-blue-400 bg-white';
                  if (isSelected) {
                    if (step1Feedback === true) {
                      borderClass = 'border-rose-500 bg-rose-50/80 ring-2 ring-rose-500/20';
                    } else if (step1Feedback === false) {
                      borderClass = 'border-amber-400 bg-amber-50/60';
                    }
                  } else if (step1Feedback === true && isWrongStep) {
                    borderClass = 'border-rose-500 bg-rose-50/80';
                  }

                  return (
                    <button
                      key={step.stepNum}
                      type="button"
                      onClick={() => handleCheckStep1(step.stepNum)}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start justify-between gap-4 ${borderClass}`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="text-xs font-bold text-slate-500 flex items-center gap-2">
                          <span>{step.title}</span>
                          {isSelected && step1Feedback === true && (
                            <span className="text-rose-700 font-extrabold bg-rose-100 px-2 py-0.5 rounded text-[11px]">
                              ← ĐÂY LÀ BƯỚC CHỨA LỖI SAI!
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-slate-900 leading-relaxed font-mono">
                          {step.content}
                        </p>
                      </div>

                      <div className="shrink-0 mt-1">
                        {isSelected && step1Feedback === true && (
                          <AlertTriangle className="w-5 h-5 text-rose-600" />
                        )}
                        {isSelected && step1Feedback === false && (
                          <CheckCircle2 className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {step1Feedback === false && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-xs sm:text-sm text-amber-900 flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Bước bạn chọn vẫn suy luận hợp lí. Hãy đọc kĩ lại bước kế tiếp xem kết luận có bị ngộ nhận hoặc nhầm căn cứ không nhé!
                  </span>
                </div>
              )}
            </section>

            {/* TASK 2: DIAGNOSE THE ROOT CAUSE (Unlocked when step 1 correct) */}
            {step1Feedback === true && (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 pt-4 border-t border-slate-100"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    Nhiệm vụ 2: Phân tích nguyên nhân sai lầm toán học
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {currentCase.wrongReasonOptions.map((opt) => {
                    const isSelected = selectedReason === opt;
                    const isCorrect = opt === currentCase.correctReason;

                    let style =
                      'border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/40 text-slate-800';
                    if (step2Feedback !== null) {
                      if (isCorrect) {
                        style = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold';
                      } else if (isSelected && !isCorrect) {
                        style = 'border-rose-400 bg-rose-50 text-rose-950';
                      } else {
                        style = 'border-slate-200 bg-slate-50/60 text-slate-400';
                      }
                    }

                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleCheckStep2(opt)}
                        className={`w-full text-left p-3.5 sm:p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${style}`}
                      >
                        <div className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0 mt-0.5">
                          {isSelected && isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          )}
                          {isSelected && !isCorrect && (
                            <XCircle className="w-4 h-4 text-rose-600" />
                          )}
                        </div>
                        <span className="text-xs sm:text-sm leading-relaxed">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.section>
            )}

            {/* TASK 3: PROPOSE THE REPAIR (Unlocked when step 2 correct) */}
            {step2Feedback === true && (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 pt-4 border-t border-slate-100"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                      3
                    </span>
                    Nhiệm vụ 3: Đề xuất phương án sửa chữa lời giải
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {currentCase.correctionOptions.map((opt) => {
                    const isSelected = selectedCorrection === opt;
                    const isCorrect = opt === currentCase.correctCorrection;

                    let style =
                      'border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/40 text-slate-800';
                    if (step3Feedback !== null) {
                      if (isCorrect) {
                        style = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold';
                      } else if (isSelected && !isCorrect) {
                        style = 'border-rose-400 bg-rose-50 text-rose-950';
                      } else {
                        style = 'border-slate-200 bg-slate-50/60 text-slate-400';
                      }
                    }

                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleCheckStep3(opt)}
                        className={`w-full text-left p-3.5 sm:p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${style}`}
                      >
                        <div className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0 mt-0.5">
                          {isSelected && isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          )}
                          {isSelected && !isCorrect && (
                            <XCircle className="w-4 h-4 text-rose-600" />
                          )}
                        </div>
                        <span className="text-xs sm:text-sm leading-relaxed">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.section>
            )}

            {/* COMPLETION SHOWCASE & CORRECTED SOLUTION */}
            {step3Feedback === true && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border-2 border-emerald-400 bg-emerald-50/80 p-5 sm:p-6 space-y-5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-display text-lg font-extrabold text-emerald-950">
                      CHẨN ĐOÁN & SỬA LỖI HOÀN TẤT XUẤT SẮC!
                    </h4>
                    <p className="text-xs sm:text-sm font-semibold text-emerald-800">
                      Bạn vừa nhận được +20 điểm thưởng tư duy phản biện vào hồ sơ học sinh!
                    </p>
                  </div>
                </div>

                {/* Standard Corrected Solution */}
                <div className="bg-white rounded-xl border border-emerald-200 p-4 space-y-2">
                  <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Lời giải chuẩn mực sau khi điều chỉnh:
                  </div>
                  <div className="space-y-1 text-xs sm:text-sm text-slate-800 font-mono pl-2 border-l-2 border-emerald-500">
                    {currentCase.correctedSolution.map((line, idx) => (
                      <div key={idx}>{line}</div>
                    ))}
                  </div>
                </div>

                {/* Lesson learned */}
                <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 space-y-1 text-xs sm:text-sm text-amber-950">
                  <div className="font-bold flex items-center gap-1.5 text-amber-800">
                    <Award className="w-4 h-4" />
                    Bài học kinh nghiệm tránh bẫy:
                  </div>
                  <p className="leading-relaxed font-medium">
                    {currentCase.lessonLearned}
                  </p>
                </div>

                {/* Action Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleResetCurrentCase}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Thực hành lại hồ sơ này
                  </button>

                  {nextCase ? (
                    <button
                      type="button"
                      onClick={() => handleSelectCase(nextCase.id)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-colors shadow-sm"
                    >
                      Chuyển sang hồ sơ tiếp theo ({nextCase.stageCode})
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onBackToMap}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-colors shadow-sm"
                    >
                      Hoàn thành toàn bộ hồ sơ lỗi sai!
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </article>
        </main>
      </div>
    </div>
  );
};

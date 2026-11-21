import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Trophy,
  XCircle,
} from 'lucide-react';
import {
  GameMode,
  Question,
  QuestionAttempt,
  SessionRecord,
  StageConfig,
  StudentRecord,
} from '../types';
import { getValidatedQuestionsForStage } from '../data/questionBank';
import { checkQuestionAnswer, formatDuration, getArenaExamTitle } from '../utils/scoring';
import { QuestionAnswerValue, QuestionRenderer } from './QuestionRenderer';
import { ScoreBoard } from './ScoreBoard';
import { getStageIcon } from './BadgeSystem';

interface GameEngineProps {
  stage: StageConfig;
  mode: GameMode;
  student: StudentRecord;
  unlockThreshold: number;
  onUpdateStudent: (updated: StudentRecord) => void;
  onExit: () => void;
  onGoToNextStage?: (nextStageId: number) => void;
  onGoToReview: () => void;
}

function createInitialAnswer(q: Question): QuestionAnswerValue {
  if (q.questionType === 'matching') return {};
  if (q.questionType === 'ordering') {
    return (q.orderingSteps ?? []).map((s) => s.id);
  }
  return '';
}

function isAnswerReady(q: Question, val: QuestionAnswerValue): boolean {
  if (q.questionType === 'multiple_choice' || q.questionType === 'true_false') {
    return typeof val === 'string' && val.trim().length > 0;
  }
  if (q.questionType === 'fill_blank') {
    return typeof val === 'string' && val.trim().length > 0;
  }
  if (q.questionType === 'matching') {
    const map = typeof val === 'object' && !Array.isArray(val) ? val : {};
    const totalPairs = q.matchingPairs?.length ?? 0;
    return totalPairs > 0 && Object.keys(map).length === totalPairs;
  }
  if (q.questionType === 'ordering') {
    return Array.isArray(val) && val.length === (q.orderingSteps?.length ?? 0);
  }
  return false;
}

interface TurnFeedback {
  isCorrect: boolean;
  pointsAwarded: number;
  alreadyCredited: boolean;
  userDisplay: string;
  correctDisplay: string;
}

export const GameEngine: React.FC<GameEngineProps> = ({
  stage,
  mode,
  student,
  unlockThreshold,
  onUpdateStudent,
  onExit,
  onGoToNextStage,
  onGoToReview,
}) => {
  // Validate stage questions right before starting gameplay (Section X requirement)
  const { questions, audit } = useMemo(
    () => getValidatedQuestionsForStage(stage.id),
    [stage.id]
  );

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answerValue, setAnswerValue] = useState<QuestionAnswerValue>(() =>
    questions[0] ? createInitialAnswer(questions[0]) : ''
  );
  const [feedback, setFeedback] = useState<TurnFeedback | null>(null);
  const [showHint, setShowHint] = useState(false);

  const [sessionPoints, setSessionPoints] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionAnsweredIds, setSessionAnsweredIds] = useState<Set<string>>(new Set());
  const [sessionWrongQuestions, setSessionWrongQuestions] = useState<Question[]>([]);
  const [streak, setStreak] = useState(0);

  const [remainingSeconds, setRemainingSeconds] = useState(stage.challengeDurationSec);
  const [isFinished, setIsFinished] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [finishSummary, setFinishSummary] = useState<{
    accuracy: number;
    bonusPoints: number;
    newlyUnlockedBadge: boolean;
    newlyCompletedStage: boolean;
    durationSec: number;
  } | null>(null);

  const startedAtRef = useRef<number>(Date.now());
  const studentRef = useRef<StudentRecord>(student);
  studentRef.current = student;

  const currentQuestion = questions[currentIdx];

  // Reset answer state when advancing question
  useEffect(() => {
    if (currentQuestion) {
      setAnswerValue(createInitialAnswer(currentQuestion));
      setFeedback(null);
      setShowHint(false);
    }
  }, [currentIdx, currentQuestion?.id]);

  const finishGame = useCallback(
    (wasTimeout = false, finalCorrectOverride?: number, finalPointsOverride?: number) => {
      if (isFinished) return;
      const nowIso = new Date().toISOString();
      const durationSec = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
      const totalQ = questions.length;
      const finalCorrect = finalCorrectOverride ?? sessionCorrect;
      const baseSessionPoints = finalPointsOverride ?? sessionPoints;
      const accuracy = totalQ > 0 ? Math.round((finalCorrect / totalQ) * 100) : 0;

      const latestStudent = studentRef.current;
      const prevStage = latestStudent.stageProgress[stage.id] ?? {
        stageId: stage.id,
        bestAccuracy: 0,
        attemptsCount: 0,
        completed: false,
        completionBonusAwarded: false,
        highAccuracyBonusAwarded: false,
        finalBonusAwarded: false,
      };

      const passedStage = accuracy >= unlockThreshold;
      const newlyCompletedStage = passedStage && !prevStage.completed;

      let bonusPoints = 0;
      let completionBonusAwarded = prevStage.completionBonusAwarded;
      let highAccuracyBonusAwarded = prevStage.highAccuracyBonusAwarded;
      let finalBonusAwarded = prevStage.finalBonusAwarded;

      if (passedStage && !completionBonusAwarded) {
        bonusPoints += stage.completionBonus; // +30
        completionBonusAwarded = true;
      }
      if (accuracy >= 90 && !highAccuracyBonusAwarded) {
        bonusPoints += stage.highAccuracyBonus; // +20
        highAccuracyBonusAwarded = true;
      }
      if (stage.id === 6 && passedStage && stage.finalStageBonus && !finalBonusAwarded) {
        bonusPoints += stage.finalStageBonus; // +100
        finalBonusAwarded = true;
      }

      const nextBadges = [...latestStudent.earnedBadgeIds];
      let newlyUnlockedBadge = false;
      if (passedStage && !nextBadges.includes(stage.badge.id)) {
        nextBadges.push(stage.badge.id);
        newlyUnlockedBadge = true;
      }

      const nextStageProgress = {
        ...latestStudent.stageProgress,
        [stage.id]: {
          ...prevStage,
          bestAccuracy: Math.max(prevStage.bestAccuracy, accuracy),
          attemptsCount: prevStage.attemptsCount + 1,
          completed: prevStage.completed || passedStage,
          completionBonusAwarded,
          highAccuracyBonusAwarded,
          finalBonusAwarded,
          lastPlayedAt: nowIso,
        },
      };

      const allSixCompleted = [1, 2, 3, 4, 5, 6].every((id) => nextStageProgress[id]?.completed);

      const newSession: SessionRecord = {
        id: `ses_${Date.now()}`,
        stageId: stage.id,
        stageName: stage.name,
        mode,
        startedAt: new Date(startedAtRef.current).toISOString(),
        completedAt: nowIso,
        durationSec,
        totalQuestions: totalQ,
        correctCount: finalCorrect,
        accuracyPercent: accuracy,
        pointsEarned: baseSessionPoints + bonusPoints,
      };

      const updatedStudent: StudentRecord = {
        ...latestStudent,
        lastActiveAt: nowIso,
        totalPoints: latestStudent.totalPoints + bonusPoints,
        totalStudySeconds: latestStudent.totalStudySeconds + durationSec,
        stageProgress: nextStageProgress,
        earnedBadgeIds: nextBadges,
        sessions: [newSession, ...latestStudent.sessions].slice(0, 60),
        certificateIssuedAt:
          latestStudent.certificateIssuedAt || (allSixCompleted ? nowIso : undefined),
      };

      onUpdateStudent(updatedStudent);
      setTimedOut(wasTimeout);
      setIsFinished(true);
      setFinishSummary({
        accuracy,
        bonusPoints,
        newlyUnlockedBadge,
        newlyCompletedStage,
        durationSec,
      });
    },
    [
      isFinished,
      mode,
      onUpdateStudent,
      questions.length,
      sessionCorrect,
      sessionPoints,
      stage,
      unlockThreshold,
    ]
  );

  const handleSubmitAnswer = () => {
    if (!currentQuestion || feedback) return;
    const result = checkQuestionAnswer(currentQuestion, answerValue);

    const latestStudent = studentRef.current;
    const alreadyCredited = latestStudent.creditedQuestionIds.includes(currentQuestion.id);
    const pointsAwarded = result.isCorrect && !alreadyCredited ? currentQuestion.score : 0;

    const nowIso = new Date().toISOString();
    const attempt: QuestionAttempt = {
      questionId: currentQuestion.id,
      stageId: stage.id,
      knowledgeTag: currentQuestion.knowledgeTag,
      isCorrect: result.isCorrect,
      userAnswer: result.userDisplay,
      correctAnswerDisplay: result.correctDisplay,
      timestamp: nowIso,
      mode,
      pointsAwarded,
    };

    const nextCredited =
      result.isCorrect && !alreadyCredited
        ? [...latestStudent.creditedQuestionIds, currentQuestion.id]
        : latestStudent.creditedQuestionIds;

    const updatedStudent: StudentRecord = {
      ...latestStudent,
      lastActiveAt: nowIso,
      totalPoints: latestStudent.totalPoints + pointsAwarded,
      creditedQuestionIds: nextCredited,
      questionAttempts: {
        ...latestStudent.questionAttempts,
        [currentQuestion.id]: attempt,
      },
    };
    onUpdateStudent(updatedStudent);

    const firstTimeInThisSession = !sessionAnsweredIds.has(currentQuestion.id);
    if (firstTimeInThisSession) {
      setSessionAnsweredIds((prev) => new Set(prev).add(currentQuestion.id));
      if (result.isCorrect) {
        setSessionCorrect((c) => c + 1);
      } else {
        setSessionWrongQuestions((prev) => [...prev, currentQuestion]);
      }
    }

    if (result.isCorrect) {
      setSessionPoints((p) => p + pointsAwarded);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }

    setFeedback({
      isCorrect: result.isCorrect,
      pointsAwarded,
      alreadyCredited,
      userDisplay: result.userDisplay,
      correctDisplay: result.correctDisplay,
    });
  };

  const handleNext = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((i) => i + 1);
    } else {
      finishGame(false);
    }
  };

  const handleRetryCurrentPractice = () => {
    if (!currentQuestion) return;
    setAnswerValue(createInitialAnswer(currentQuestion));
    setFeedback(null);
  };

  const handleRestartSession = () => {
    startedAtRef.current = Date.now();
    setCurrentIdx(0);
    setAnswerValue(questions[0] ? createInitialAnswer(questions[0]) : '');
    setFeedback(null);
    setShowHint(false);
    setSessionPoints(0);
    setSessionCorrect(0);
    setSessionAnsweredIds(new Set());
    setSessionWrongQuestions([]);
    setStreak(0);
    setRemainingSeconds(stage.challengeDurationSec);
    setIsFinished(false);
    setTimedOut(false);
    setFinishSummary(null);
  };

  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
        <p className="text-slate-700 font-medium">
          Không tìm thấy câu hỏi hợp lệ cho chặng này sau khi kiểm định toán học.
        </p>
        <button
          type="button"
          onClick={onExit}
          className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
        >
          Quay lại
        </button>
      </div>
    );
  }

  // COMPLETION SUMMARY SCREEN
  if (isFinished && finishSummary) {
    const passed = finishSummary.accuracy >= unlockThreshold;
    const totalWrong = questions.length - sessionCorrect;
    const arenaTitle = stage.id === 6 ? getArenaExamTitle(finishSummary.accuracy) : null;
    const weakTagsInSession = Array.from(
      new Set(sessionWrongQuestions.map((q) => q.knowledgeTag))
    );

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 max-w-3xl mx-auto shadow-sm"
      >
        <div className="text-center space-y-3">
          <div
            className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center shadow-sm"
            style={{
              backgroundColor: passed ? `${stage.accentColor}1A` : '#FEF2F2',
              color: passed ? stage.accentColor : '#DC2626',
            }}
          >
            {passed ? <Trophy className="w-10 h-10" /> : <RotateCcw className="w-9 h-9" />}
          </div>

          <div className="text-xs font-semibold text-slate-500">
            {timedOut ? 'Hết thời gian làm bài' : `${stage.code} · ${stage.gameTitle}`}
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
            {passed
              ? stage.id === 6
                ? 'CHÚC MỪNG! BẠN ĐÃ CHINH PHỤC ĐẤU TRƯỜNG TRIANGLE MASTER!'
                : `XUẤT SẮC! HOÀN THÀNH ${stage.name}!`
              : `CẦN CỐ GẮNG THÊM (MỤC TIÊU ≥ ${unlockThreshold}%)`}
          </h2>

          {arenaTitle && (
            <p className="text-base font-bold text-amber-700">
              Danh hiệu đạt được: {arenaTitle}
            </p>
          )}
        </div>

        {/* Newly Unlocked Badge Celebration */}
        {finishSummary.newlyUnlockedBadge && (
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 flex flex-col sm:flex-row items-center gap-4"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-sm"
              style={{ backgroundColor: stage.accentColor }}
            >
              {getStageIcon(stage.id, 'w-7 h-7')}
            </div>
            <div className="text-center sm:text-left">
              <div className="text-xs font-bold text-amber-700 flex items-center justify-center sm:justify-start gap-1.5">
                <Sparkles className="w-4 h-4" />
                MỞ KHÓA HUY HIỆU MỚI
              </div>
              <div className="font-display text-lg font-extrabold text-slate-900">
                {stage.badge.name}
              </div>
              <p className="text-xs text-slate-600 mt-0.5">{stage.badge.description}</p>
            </div>
          </motion.div>
        )}

        {/* Quantitative Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-center">
            <div className="text-xs text-slate-500 font-medium">Tỉ lệ chính xác</div>
            <div className="font-display text-2xl font-extrabold text-blue-700 tabular-nums mt-1">
              {finishSummary.accuracy}%
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-center">
            <div className="text-xs text-slate-500 font-medium">Đúng / Sai</div>
            <div className="font-display text-2xl font-extrabold text-slate-900 tabular-nums mt-1">
              <span className="text-emerald-600">{sessionCorrect}</span>
              <span className="text-slate-400 mx-1">/</span>
              <span className="text-rose-600">{totalWrong}</span>
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-center">
            <div className="text-xs text-slate-500 font-medium">Điểm lượt này</div>
            <div className="font-display text-2xl font-extrabold text-amber-600 tabular-nums mt-1">
              +{sessionPoints + finishSummary.bonusPoints}
            </div>
            {finishSummary.bonusPoints > 0 && (
              <div className="text-[11px] font-semibold text-amber-700 mt-0.5">
                Gồm +{finishSummary.bonusPoints} điểm thưởng
              </div>
            )}
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-center">
            <div className="text-xs text-slate-500 font-medium">Thời gian</div>
            <div className="font-display text-lg font-extrabold text-slate-900 tabular-nums mt-1.5">
              {formatDuration(finishSummary.durationSec)}
            </div>
          </div>
        </div>

        {/* Weak Topics Diagnosis */}
        {weakTagsInSession.length > 0 ? (
          <div className="rounded-2xl bg-rose-50/70 border border-rose-200 p-4 space-y-2">
            <div className="text-sm font-bold text-rose-900">
              Kiến thức cần ôn tập thêm từ lượt làm này:
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-rose-800">
              {weakTagsInSession.map((tag, idx) => (
                <span key={tag} className="font-medium">
                  {idx > 0 ? '· ' : ''}
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
            <Award className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-semibold text-emerald-900">
              Tuyệt đối không sai câu nào! Bạn đã nắm rất vững kiến thức của chặng này.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleRestartSession}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-300 bg-white text-slate-800 font-semibold hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Làm lại chặng này
          </button>

          {weakTagsInSession.length > 0 && (
            <button
              type="button"
              onClick={onGoToReview}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 transition-colors"
            >
              Xem lại lời giải câu sai
            </button>
          )}

          {passed && stage.id < 6 && onGoToNextStage ? (
            <button
              type="button"
              onClick={() => onGoToNextStage(stage.id + 1)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-sm"
            >
              Mở khóa Chặng {stage.id + 1}
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onExit}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-sm"
            >
              Về Bản đồ hành trình
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  const readyToSubmit = isAnswerReady(currentQuestion, answerValue);

  return (
    <div className="space-y-5 max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Thoát lượt chơi
        </button>

        {audit.invalidCount > 0 && (
          <span className="text-xs font-medium text-amber-700">
            Đã tự động lọc {audit.invalidCount} câu chưa đạt kiểm định toán học
          </span>
        )}
      </div>

      <ScoreBoard
        gameTitle={stage.gameTitle}
        mode={mode}
        currentIndex={currentIdx}
        totalQuestions={questions.length}
        sessionPoints={sessionPoints}
        correctCount={sessionCorrect}
        streak={streak}
        accentColor={stage.accentColor}
        remainingSeconds={remainingSeconds}
        totalDurationSeconds={stage.challengeDurationSec}
        timerRunning={mode === 'challenge' && !isFinished}
        onTickTimer={setRemainingSeconds}
        onTimeUp={() => finishGame(true)}
      />

      {/* Main Question Card */}
      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 space-y-6 shadow-sm"
      >
        <QuestionRenderer
          question={currentQuestion}
          answerValue={answerValue}
          onChange={setAnswerValue}
          onSubmitEnter={handleSubmitAnswer}
          disabled={Boolean(feedback)}
          showResult={Boolean(feedback)}
          isCorrect={feedback?.isCorrect}
        >
          {/* Practice Mode Hint Box */}
          {mode === 'practice' && !feedback && (
            <div>
              {showHint ? (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-950">
                    <span className="font-bold">Gợi ý kiến thức: </span>
                    {currentQuestion.hint}
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowHint(true)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800"
                >
                  <HelpCircle className="w-4 h-4" />
                  Xem gợi ý cách giải
                </button>
              )}
            </div>
          )}

          {/* Submit / Next Control Bar */}
          {!feedback ? (
            <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={!readyToSubmit}
                onClick={handleSubmitAnswer}
                className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm sm:text-base hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                Kiểm tra đáp án
              </button>
            </div>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border-2 p-5 space-y-4 ${
                  feedback.isCorrect
                    ? 'border-emerald-400 bg-emerald-50/90'
                    : 'border-rose-300 bg-rose-50/90'
                }`}
              >
                {/* Exact Required Feedback Headlines */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {feedback.isCorrect ? (
                      <motion.div
                        initial={{ scale: 0.6, rotate: -15 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0"
                      >
                        <CheckCircle2 className="w-6 h-6" />
                      </motion.div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                        <XCircle className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <div
                        className={`font-display text-base sm:text-lg font-extrabold ${
                          feedback.isCorrect ? 'text-emerald-900' : 'text-rose-900'
                        }`}
                      >
                        {feedback.isCorrect
                          ? 'CHÍNH XÁC! BẠN ĐÃ CHINH PHỤC THỬ THÁCH!'
                          : 'CHƯA CHÍNH XÁC! HÃY THỬ LẠI NHÉ!'}
                      </div>
                      {feedback.isCorrect && (
                        <div className="text-xs font-semibold text-emerald-700">
                          {feedback.pointsAwarded > 0
                            ? `+${feedback.pointsAwarded} điểm thưởng đã được cộng vào hồ sơ!`
                            : 'Bạn đã nhận điểm câu này ở lượt trước (không cộng trùng điểm).'}
                        </div>
                      )}
                    </div>
                  </div>

                  {feedback.isCorrect && (
                    <div className="flex items-center gap-1 text-amber-500">
                      <Sparkles className="w-5 h-5" />
                      <span className="font-mono font-bold text-sm text-amber-700">
                        +{feedback.pointsAwarded}đ
                      </span>
                    </div>
                  )}
                </div>

                {/* Detailed Explanation & Key Knowledge */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-4 space-y-2.5 text-sm">
                  {!feedback.isCorrect && (
                    <div>
                      <span className="font-bold text-emerald-700">Đáp án đúng: </span>
                      <span className="font-semibold text-slate-900">{feedback.correctDisplay}</span>
                    </div>
                  )}
                  <div>
                    <span className="font-bold text-slate-900">Giải thích chi tiết: </span>
                    <span className="text-slate-700 leading-relaxed">
                      {currentQuestion.explanation}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-blue-800">Kiến thức cần ghi nhớ: </span>
                    <span className="text-slate-700">{currentQuestion.keyKnowledge}</span>
                  </div>
                  {!feedback.isCorrect && (
                    <div>
                      <span className="font-bold text-amber-800">Gợi ý cách giải: </span>
                      <span className="text-slate-700">{currentQuestion.hint}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3">
                  {mode === 'practice' && !feedback.isCorrect && (
                    <button
                      type="button"
                      onClick={handleRetryCurrentPractice}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm font-semibold hover:bg-slate-50"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Thử lại câu này
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors"
                  >
                    {currentIdx + 1 < questions.length ? 'Câu tiếp theo' : 'Xem kết quả chặng'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </QuestionRenderer>
      </motion.div>
    </div>
  );
};

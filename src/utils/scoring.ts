import { Question, StageStatus, StudentRecord } from '../types';
import { STAGES } from '../data/stages';

export interface TitleInfo {
  title: string;
  minScore: number;
  description: string;
  color: string;
}

export const STUDENT_TITLES: TitleInfo[] = [
  {
    title: 'Huyền thoại TRIANGLE MASTER',
    minScore: 650,
    description: 'Làm chủ xuất sắc toàn bộ Chương IV Tam giác bằng nhau!',
    color: '#D97706',
  },
  {
    title: 'Bậc thầy tam giác',
    minScore: 480,
    description: 'Tư duy hình học sắc bén, phân biệt chuẩn xác mọi trường hợp bằng nhau.',
    color: '#8B5CF6',
  },
  {
    title: 'Cao thủ hình học',
    minScore: 300,
    description: 'Nắm chắc kiến thức cốt lõi và giải tốt các bài tập vận dụng.',
    color: '#2563EB',
  },
  {
    title: 'Chiến binh tam giác',
    minScore: 120,
    description: 'Đang tiến bộ vững vàng trên hành trình khám phá hình học 7.',
    color: '#14B8A6',
  },
  {
    title: 'Tân binh hình học',
    minScore: 0,
    description: 'Khởi đầu hành trình chinh phục thế giới tam giác!',
    color: '#64748B',
  },
];

export function getStudentTitle(totalPoints: number, stage6Completed: boolean, stage6Accuracy: number): TitleInfo {
  if (stage6Completed && stage6Accuracy >= 90 && totalPoints >= 500) {
    return STUDENT_TITLES[0];
  }
  for (const tier of STUDENT_TITLES) {
    if (totalPoints >= tier.minScore) {
      return tier;
    }
  }
  return STUDENT_TITLES[STUDENT_TITLES.length - 1];
}

export function getArenaExamTitle(accuracyPercent: number): string {
  if (accuracyPercent >= 93) return 'Huyền thoại TRIANGLE MASTER';
  if (accuracyPercent >= 80) return 'Bậc thầy tam giác';
  if (accuracyPercent >= 67) return 'Cao thủ hình học';
  if (accuracyPercent >= 45) return 'Chiến binh tam giác';
  return 'Tân binh hình học';
}

/**
 * Parse numeric input forgivingly:
 * - Strips spaces, degree symbols (°), and unit words (cm, mm, m, độ)
 * - Accepts comma (,) or dot (.) as decimal separator
 */
export function parseNumericAnswer(raw: string): number | null {
  const cleaned = raw
    .trim()
    .replace(/\s+/g, '')
    .replace(/°/g, '')
    .replace(/(cm|mm|dm|m|độ)$/i, '')
    .replace(',', '.');

  if (!cleaned || !/^-?\d+(\.\d+)?$/.test(cleaned)) {
    return null;
  }
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

export function checkQuestionAnswer(
  question: Question,
  submitted: string | Record<string, string> | string[]
): { isCorrect: boolean; userDisplay: string; correctDisplay: string } {
  if (question.questionType === 'multiple_choice' || question.questionType === 'true_false') {
    const userVal = typeof submitted === 'string' ? submitted.trim() : '';
    const correctVal = String(question.correctAnswer);
    return {
      isCorrect: userVal === correctVal,
      userDisplay: userVal || '(Chưa chọn)',
      correctDisplay: correctVal,
    };
  }

  if (question.questionType === 'fill_blank') {
    const rawStr = typeof submitted === 'string' ? submitted : '';
    const parsed = parseNumericAnswer(rawStr);
    const expected = Number(question.correctAnswer);
    const tolerance = question.numericTolerance ?? 0.01;
    const isCorrect = parsed !== null && Math.abs(parsed - expected) <= tolerance;
    const unitSuffix = question.unit ? question.unit : '';
    return {
      isCorrect,
      userDisplay: rawStr.trim() ? `${rawStr.trim()}${unitSuffix && !rawStr.includes(unitSuffix) ? unitSuffix : ''}` : '(Chưa nhập)',
      correctDisplay: `${expected}${unitSuffix}`,
    };
  }

  if (question.questionType === 'matching') {
    const map = typeof submitted === 'object' && !Array.isArray(submitted) ? submitted : {};
    const pairs = question.matchingPairs ?? [];
    const allMatched =
      pairs.length > 0 &&
      pairs.every((pair) => (map[pair.id] ?? '').trim() === pair.right.trim());
    const userSummary = pairs
      .map((p) => `${p.left} → ${map[p.id] || '?'}`)
      .join('; ');
    const correctSummary = pairs
      .map((p) => `${p.left} → ${p.right}`)
      .join('; ');
    return {
      isCorrect: allMatched,
      userDisplay: userSummary,
      correctDisplay: correctSummary,
    };
  }

  if (question.questionType === 'ordering') {
    const userOrder = Array.isArray(submitted) ? submitted : [];
    const expectedOrder = Array.isArray(question.correctAnswer) ? question.correctAnswer : [];
    const isCorrect =
      userOrder.length === expectedOrder.length &&
      userOrder.every((id, idx) => id === expectedOrder[idx]);

    const stepLookup = new Map((question.orderingSteps ?? []).map((s) => [s.id, s.text]));
    const userSummary = userOrder.map((id, i) => `(${i + 1}) ${stepLookup.get(id) ?? id}`).join(' → ');
    const correctSummary = expectedOrder
      .map((id, i) => `(${i + 1}) ${stepLookup.get(id) ?? id}`)
      .join(' → ');
    return {
      isCorrect,
      userDisplay: userSummary,
      correctDisplay: correctSummary,
    };
  }

  return { isCorrect: false, userDisplay: '', correctDisplay: '' };
}

export function getStageStatus(
  student: StudentRecord,
  stageId: number,
  unlockThreshold: number,
  teacherUnlockAll: boolean
): StageStatus {
  const progress = student.stageProgress[stageId];
  if (progress?.completed || (progress && progress.bestAccuracy >= unlockThreshold)) {
    return 'completed';
  }
  if (stageId === 1 || teacherUnlockAll) {
    return 'in_progress';
  }
  const prev = student.stageProgress[stageId - 1];
  const prevCompleted = Boolean(prev?.completed || (prev && prev.bestAccuracy >= unlockThreshold));
  return prevCompleted ? 'in_progress' : 'locked';
}

export function computeStudentStats(student: StudentRecord) {
  const attempts = Object.values(student.questionAttempts);
  const totalAnswered = attempts.length;
  const totalCorrect = attempts.filter((a) => a.isCorrect).length;
  const totalWrong = totalAnswered - totalCorrect;
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const completedStages = STAGES.filter((s) => student.stageProgress[s.id]?.completed).length;

  // Weak knowledge tags (sorted by error rate)
  const tagStats: Record<string, { total: number; wrong: number }> = {};
  for (const a of attempts) {
    if (!tagStats[a.knowledgeTag]) {
      tagStats[a.knowledgeTag] = { total: 0, wrong: 0 };
    }
    tagStats[a.knowledgeTag].total += 1;
    if (!a.isCorrect) tagStats[a.knowledgeTag].wrong += 1;
  }

  const weakTopics = Object.entries(tagStats)
    .filter(([, st]) => st.wrong > 0)
    .map(([tag, st]) => ({
      tag,
      wrongCount: st.wrong,
      totalCount: st.total,
      errorRate: Math.round((st.wrong / st.total) * 100),
    }))
    .sort((a, b) => b.wrongCount - a.wrongCount || b.errorRate - a.errorRate);

  const canReceiveCertificate = completedStages === STAGES.length;

  return {
    totalAnswered,
    totalCorrect,
    totalWrong,
    accuracy,
    completedStages,
    weakTopics,
    canReceiveCertificate,
  };
}

export function formatDuration(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  if (hrs > 0) {
    return `${hrs}g ${mins}p ${secs}s`;
  }
  if (mins > 0) {
    return `${mins} phút ${secs} giây`;
  }
  return `${secs} giây`;
}

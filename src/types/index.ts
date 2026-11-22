export type QuestionType =
  | 'multiple_choice'
  | 'fill_blank'
  | 'true_false'
  | 'matching'
  | 'ordering';

export type Difficulty = 'Nhận biết' | 'Thông hiểu' | 'Vận dụng';

export type GameMode = 'practice' | 'challenge';

export type StageStatus = 'locked' | 'in_progress' | 'completed';

export interface DiagramPoint {
  id: string;
  label: string;
  x: number;
  y: number;
  labelOffset?: { dx: number; dy: number };
}

export interface DiagramSegment {
  from: string;
  to: string;
  ticks?: 0 | 1 | 2 | 3;
  label?: string;
  labelOffset?: { dx: number; dy: number };
  highlight?: boolean;
  color?: string;
  dashed?: boolean;
}

export interface DiagramAngle {
  vertex: string;
  from: string;
  to: string;
  arcs?: 1 | 2 | 3;
  isRightAngle?: boolean;
  label?: string;
  color?: string;
  highlight?: boolean;
  radius?: number;
}

export interface DiagramTriangleFill {
  vertices: [string, string, string];
  fill?: string;
}

export interface DiagramData {
  viewBox?: string; // e.g. "0 0 460 220"
  points: DiagramPoint[];
  segments: DiagramSegment[];
  angles?: DiagramAngle[];
  fills?: DiagramTriangleFill[];
  caption?: string;
  notToScale?: boolean;
}

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface OrderingStep {
  id: string;
  text: string;
}

export interface MathCheckMetadata {
  triangleAngles?: number[][]; // Each sub-array must sum to 180
  triangleSides?: number[][]; // Each sub-array of 3 sides must satisfy triangle inequality
  requiresRightAngleMarker?: boolean;
}

export interface Question {
  id: string;
  stageId: number;
  questionType: QuestionType;
  difficulty: Difficulty;
  question: string;
  options?: string[];
  matchingPairs?: MatchingPair[];
  orderingSteps?: OrderingStep[];
  /**
   * - multiple_choice / true_false: exact option string
   * - fill_blank: number
   * - matching: Record<pairId, rightText> (or validated directly via matchingPairs)
   * - ordering: string[] of step IDs in correct order
   */
  correctAnswer: string | number | Record<string, string> | string[];
  numericTolerance?: number;
  unit?: string;
  explanation: string;
  hint: string;
  keyKnowledge: string;
  diagramData?: DiagramData;
  score: number;
  knowledgeTag: string;
  mathCheck?: MathCheckMetadata;
}

export interface KnowledgeSection {
  id: string;
  title: string;
  formula?: string;
  points: string[];
  example?: {
    title: string;
    given: string;
    solution: string[];
    conclusion: string;
  };
  warning?: string;
  diagramData?: DiagramData;
}

export interface BadgeConfig {
  id: string;
  stageId: number;
  name: string;
  description: string;
  color: string;
  accentHex: string;
}

export interface StageConfig {
  id: number;
  code: string;
  name: string;
  shortName: string;
  topic: string;
  description: string;
  gameTitle: string;
  accentColor: string; // hex
  challengeDurationSec: number;
  completionBonus: number;
  highAccuracyBonus: number;
  finalStageBonus?: number;
  badge: BadgeConfig;
  knowledgeSections: KnowledgeSection[];
}

export interface QuestionAttempt {
  questionId: string;
  stageId: number;
  knowledgeTag: string;
  isCorrect: boolean;
  userAnswer: string;
  correctAnswerDisplay: string;
  timestamp: string;
  mode: GameMode;
  pointsAwarded: number;
}

export interface SessionRecord {
  id: string;
  stageId: number;
  stageName: string;
  mode: GameMode;
  startedAt: string;
  completedAt: string;
  durationSec: number;
  totalQuestions: number;
  correctCount: number;
  accuracyPercent: number;
  pointsEarned: number;
}

export interface StageProgressData {
  stageId: number;
  bestAccuracy: number;
  attemptsCount: number;
  completed: boolean;
  completionBonusAwarded: boolean;
  highAccuracyBonusAwarded: boolean;
  finalBonusAwarded: boolean;
  lastPlayedAt?: string;
}

export interface ErrorDiagnosisCase {
  id: string;
  stageId: number;
  stageCode: string;
  title: string;
  topic: string;
  problem: string;
  diagramData?: DiagramData;
  solutionSteps: { stepNum: number; title: string; content: string }[];
  wrongStepNum: number;
  wrongReasonOptions: string[];
  correctReason: string;
  correctionOptions: string[];
  correctCorrection: string;
  correctedSolution: string[];
  lessonLearned: string;
}

export interface StudentRecord {
  id: string;
  fullName: string;
  className: string;
  schoolName: string;
  teamName?: string; // Tên đội/nhóm thi đua (e.g. Đội Tam giác đều, Đội Tam giác vuông...)
  createdAt: string;
  lastActiveAt: string;
  totalPoints: number;
  totalStudySeconds: number;
  /** Tracks which question IDs already awarded base +10 points (prevents duplicate farming) */
  creditedQuestionIds: string[];
  /** Latest attempt per questionId for review & accuracy metrics */
  questionAttempts: Record<string, QuestionAttempt>;
  stageProgress: Record<number, StageProgressData>;
  earnedBadgeIds: string[];
  completedErrorCaseIds?: string[]; // IDs của các tình huống sai lầm đã sửa đúng
  sessions: SessionRecord[];
  certificateIssuedAt?: string;
}

export interface AppSettings {
  unlockThreshold: number; // default 70
  teacherUnlockAll: boolean;
  googleSheetsUrl: string;
  lastSyncAt?: string;
}

export interface ValidationIssue {
  questionId: string;
  stageId: number;
  reason: string;
}

export interface QuestionBankAudit {
  totalChecked: number;
  validCount: number;
  invalidCount: number;
  issues: ValidationIssue[];
}

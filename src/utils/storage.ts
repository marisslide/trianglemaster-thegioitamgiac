import { AppSettings, StageProgressData, StudentRecord } from '../types';
import { STAGES } from '../data/stages';

const STUDENTS_KEY = 'triangle_master_students_v1';
const ACTIVE_STUDENT_KEY = 'triangle_master_active_student_v1';
const SETTINGS_KEY = 'triangle_master_settings_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  unlockThreshold: 70,
  teacherUnlockAll: false,
  googleSheetsUrl: '',
};

export function createEmptyStageProgress(): Record<number, StageProgressData> {
  const progress: Record<number, StageProgressData> = {};
  for (const s of STAGES) {
    progress[s.id] = {
      stageId: s.id,
      bestAccuracy: 0,
      attemptsCount: 0,
      completed: false,
      completionBonusAwarded: false,
      highAccuracyBonusAwarded: false,
      finalBonusAwarded: false,
    };
  }
  return progress;
}

export function loadStudents(): StudentRecord[] {
  try {
    const raw = localStorage.getItem(STUDENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveStudents(students: StudentRecord[]): void {
  try {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
  } catch (err) {
    console.error('Không thể lưu dữ liệu học sinh vào localStorage:', err);
  }
}

export function loadActiveStudentId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_STUDENT_KEY);
  } catch {
    return null;
  }
}

export function saveActiveStudentId(studentId: string | null): void {
  try {
    if (studentId) {
      localStorage.setItem(ACTIVE_STUDENT_KEY, studentId);
    } else {
      localStorage.removeItem(ACTIVE_STUDENT_KEY);
    }
  } catch {
    // ignore storage quota errors
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      unlockThreshold:
        typeof parsed.unlockThreshold === 'number' &&
        parsed.unlockThreshold >= 30 &&
        parsed.unlockThreshold <= 100
          ? parsed.unlockThreshold
          : DEFAULT_SETTINGS.unlockThreshold,
      teacherUnlockAll: Boolean(parsed.teacherUnlockAll),
      googleSheetsUrl: typeof parsed.googleSheetsUrl === 'string' ? parsed.googleSheetsUrl : '',
      lastSyncAt: typeof parsed.lastSyncAt === 'string' ? parsed.lastSyncAt : undefined,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function upsertStudent(
  students: StudentRecord[],
  updated: StudentRecord
): StudentRecord[] {
  const exists = students.some((s) => s.id === updated.id);
  const next = exists
    ? students.map((s) => (s.id === updated.id ? updated : s))
    : [updated, ...students];
  saveStudents(next);
  return next;
}

export function createNewStudent(
  fullName: string,
  className: string,
  schoolName: string,
  teamName?: string
): StudentRecord {
  const now = new Date().toISOString();
  return {
    id: `stu_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    fullName: fullName.trim(),
    className: className.trim(),
    schoolName: schoolName.trim(),
    teamName: teamName ? teamName.trim() : undefined,
    createdAt: now,
    lastActiveAt: now,
    totalPoints: 0,
    totalStudySeconds: 0,
    creditedQuestionIds: [],
    questionAttempts: {},
    stageProgress: createEmptyStageProgress(),
    earnedBadgeIds: [],
    completedErrorCaseIds: [],
    sessions: [],
  };
}

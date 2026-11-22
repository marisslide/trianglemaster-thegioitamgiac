import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  ChevronRight,
  FileSearch,
  Lock,
  PlayCircle,
  Star,
  Unlock,
} from 'lucide-react';
import { AppSettings, StageStatus, StudentRecord } from '../types';
import { STAGES } from '../data/stages';
import { computeStudentStats, getStageStatus, getStudentTitle } from '../utils/scoring';
import { getStageIcon } from './BadgeSystem';

interface JourneyMapProps {
  student: StudentRecord;
  settings: AppSettings;
  onSelectStage: (stageId: number) => void;
  onOpenProfile: () => void;
  onOpenReview: () => void;
  onOpenErrorLab: () => void;
}

const STATUS_META: Record<
  StageStatus,
  { label: string; textClass: string; borderClass: string; bgClass: string }
> = {
  locked: {
    label: 'Chưa mở khóa',
    textClass: 'text-slate-500',
    borderClass: 'border-slate-200',
    bgClass: 'bg-slate-50/90',
  },
  in_progress: {
    label: 'Đang thực hiện',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-300',
    bgClass: 'bg-white',
  },
  completed: {
    label: 'Hoàn thành',
    textClass: 'text-emerald-700',
    borderClass: 'border-emerald-300',
    bgClass: 'bg-white',
  },
};

export const JourneyMap: React.FC<JourneyMapProps> = ({
  student,
  settings,
  onSelectStage,
  onOpenProfile,
  onOpenReview,
  onOpenErrorLab,
}) => {
  const [heroError, setHeroError] = useState(false);
  const [mascotError, setMascotError] = useState(false);

  const stats = computeStudentStats(student);
  const stage6Prog = student.stageProgress[6];
  const titleInfo = getStudentTitle(
    student.totalPoints,
    Boolean(stage6Prog?.completed),
    stage6Prog?.bestAccuracy ?? 0
  );

  // Recommend next unlocked stage to focus
  const nextActiveStage =
    STAGES.find(
      (s) =>
        getStageStatus(student, s.id, settings.unlockThreshold, settings.teacherUnlockAll) ===
        'in_progress'
    ) || STAGES[STAGES.length - 1];

  return (
    <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Adventure World Hero Banner + Mascot Greeting */}
      <section className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="relative h-52 sm:h-64 w-full bg-blue-900 overflow-hidden">
          {!heroError ? (
            <img
              src="/src/assets/images/hero_triangle_world_1795255280225.jpg"
              alt="Bản đồ 6 vùng đất thế giới tam giác"
              referrerPolicy="no-referrer"
              onError={() => setHeroError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-700 via-teal-600 to-blue-800" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/45 to-transparent flex items-end p-5 sm:p-8">
            <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex items-center gap-4">
                {!mascotError && (
                  <img
                    src="/src/assets/images/mascot_tri_guide_1795255171443.jpg"
                    alt="Linh vật hướng dẫn Tri-Bot"
                    referrerPolicy="no-referrer"
                    onError={() => setMascotError(true)}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white/80 shadow-md shrink-0 bg-white"
                  />
                )}
                <div className="text-white space-y-1">
                  <div className="text-xs sm:text-sm font-medium text-blue-200">
                    Chào mừng trở lại, lớp {student.className}
                    {student.schoolName ? ` · ${student.schoolName}` : ''}
                  </div>
                  <h1 className="font-display text-2xl sm:text-3xl font-extrabold leading-tight">
                    Xin chào {student.fullName}!
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-200">
                    “Mỗi tam giác là một thử thách – Mỗi kiến thức là một sức mạnh!”
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectStage(nextActiveStage.id)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-bold text-sm transition-colors shadow-md whitespace-nowrap shrink-0"
              >
                <PlayCircle className="w-5 h-5" />
                Tiếp tục {nextActiveStage.code}
              </button>
            </div>
          </div>
        </div>

        {/* Clean 4-column Student Summary Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 divide-x divide-slate-100">
          <div className="p-4 sm:p-5">
            <div className="text-xs font-medium text-slate-500">Tổng điểm tích lũy</div>
            <div className="font-display text-2xl font-extrabold text-blue-700 tabular-nums mt-0.5 flex items-center gap-1.5">
              <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
              {student.totalPoints}
            </div>
            <div className="text-xs font-semibold text-slate-600 mt-0.5">{titleInfo.title}</div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="text-xs font-medium text-slate-500">Tiến độ chinh phục</div>
            <div className="font-display text-2xl font-extrabold text-slate-900 tabular-nums mt-0.5">
              {stats.completedStages} / 6 chặng
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Ngưỡng mở khóa chặng sau: ≥ {settings.unlockThreshold}%
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="text-xs font-medium text-slate-500">Huy hiệu đạt được</div>
            <div className="font-display text-2xl font-extrabold text-teal-700 tabular-nums mt-0.5">
              {student.earnedBadgeIds.length} / 6
            </div>
            <button
              type="button"
              onClick={onOpenProfile}
              className="text-xs font-semibold text-blue-700 hover:underline mt-0.5"
            >
              Xem Hồ sơ & Chứng nhận →
            </button>
          </div>

          <div className="p-4 sm:p-5">
            <div className="text-xs font-medium text-slate-500">Độ chính xác tổng thể</div>
            <div className="font-display text-2xl font-extrabold text-slate-900 tabular-nums mt-0.5">
              {stats.accuracy}%
            </div>
            <button
              type="button"
              onClick={onOpenReview}
              className="text-xs font-semibold text-blue-700 hover:underline mt-0.5"
            >
              Ôn lại {stats.totalWrong} câu sai →
            </button>
          </div>
        </div>
      </section>

      {/* Teacher Unlock All Notice if active */}
      {settings.teacherUnlockAll && (
        <div className="rounded-2xl bg-violet-50 border border-violet-200 px-5 py-3.5 flex items-center justify-between gap-3 text-sm text-violet-900">
          <div className="flex items-center gap-2.5 font-semibold">
            <Unlock className="w-4 h-4 text-violet-600 shrink-0" />
            Chế độ giáo viên đang bật: Toàn bộ 6 chặng học tập đã được mở khóa phục vụ giảng dạy trên lớp.
          </div>
        </div>
      )}

      {/* Certificate Earned Banner */}
      {stats.canReceiveCertificate && (
        <div className="rounded-2xl bg-amber-50 border-2 border-amber-300 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Award className="w-9 h-9 text-amber-600 shrink-0" />
            <div>
              <div className="font-display text-lg font-extrabold text-slate-900">
                Bạn đã đủ điều kiện nhận Chứng nhận TRIANGLE MASTER!
              </div>
              <p className="text-sm text-slate-700">
                Hoàn thành trọn vẹn cả 6/6 chặng Chương IV – Tam giác bằng nhau.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenProfile}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm whitespace-nowrap shrink-0 shadow-sm"
          >
            Xem & In Chứng nhận
          </button>
        </div>
      )}

      {/* Feature Card: Phòng Chẩn đoán & Sửa lỗi sai hình học (Biện pháp 3 SKKN) */}
      <section className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50/90 via-blue-50/60 to-white p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <FileSearch className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-2">
              <span>Biện pháp 3 SKKN: Phát hiện & Sửa lỗi sai</span>
              <span className="text-amber-800 font-extrabold bg-amber-100 border border-amber-200 px-2 py-0.5 rounded text-[11px]">
                +20 điểm/hồ sơ
              </span>
            </div>
            <h3 className="font-display text-lg sm:text-xl font-extrabold text-slate-900">
              Phòng Chẩn đoán & Sửa lỗi sai hình học
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Trở thành "Thám tử hình học": Soi chiếu từng bước giải mẫu, bóc tách cạm bẫy ngộ nhận (nhầm góc xen giữa c.g.c, nhầm cạnh huyền – cạnh góc vuông, ngộ nhận tam giác cân...) và tự tay hoàn thiện lời giải chuẩn xác.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-slate-500">Đã chẩn đoán</div>
            <div className="font-display text-lg font-extrabold text-indigo-700 tabular-nums">
              {(student.completedErrorCaseIds || []).length} / 7 hồ sơ
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenErrorLab}
            className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm whitespace-nowrap shadow-sm transition-colors flex items-center gap-2"
          >
            <span>Vào chẩn đoán ngay</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 6-Stage Adventure Journey Map */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-slate-900">
              Bản đồ hành trình 6 vùng đất hình học
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              Hoàn thành từng vùng đất với độ chính xác từ {settings.unlockThreshold}% trở lên để mở cánh cổng vào chặng tiếp theo.
            </p>
          </div>
        </div>

        {/* Visual Connected Journey Stepper (Desktop SVG Path) */}
        <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 px-8 py-5">
          <div className="relative flex items-center justify-between">
            {/* Connector track */}
            <div className="absolute left-8 right-8 top-6 h-1.5 bg-slate-100 rounded-full" />
            <div
              className="absolute left-8 top-6 h-1.5 bg-blue-600 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (stats.completedStages / 5) * 100)}%`,
                maxWidth: 'calc(100% - 4rem)',
              }}
            />

            {STAGES.map((stage) => {
              const status = getStageStatus(
                student,
                stage.id,
                settings.unlockThreshold,
                settings.teacherUnlockAll
              );
              const unlocked = status !== 'locked';
              return (
                <button
                  key={stage.id}
                  type="button"
                  disabled={!unlocked}
                  onClick={() => unlocked && onSelectStage(stage.id)}
                  className="relative z-10 flex flex-col items-center gap-2 group disabled:cursor-not-allowed"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-transform ${
                      unlocked ? 'group-hover:scale-105 shadow-sm' : ''
                    }`}
                    style={{
                      backgroundColor:
                        status === 'completed'
                          ? stage.accentColor
                          : status === 'in_progress'
                          ? '#FFFFFF'
                          : '#F1F5F9',
                      borderColor: unlocked ? stage.accentColor : '#CBD5E1',
                      color:
                        status === 'completed'
                          ? '#FFFFFF'
                          : status === 'in_progress'
                          ? stage.accentColor
                          : '#94A3B8',
                    }}
                  >
                    {status === 'locked' ? (
                      <Lock className="w-5 h-5" />
                    ) : status === 'completed' ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      getStageIcon(stage.id, 'w-5 h-5')
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold text-slate-900">{stage.code}</div>
                    <div className="text-[11px] font-medium text-slate-500 max-w-[110px] truncate">
                      {stage.shortName}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 6 Interactive Land Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {STAGES.map((stage) => {
            const status = getStageStatus(
              student,
              stage.id,
              settings.unlockThreshold,
              settings.teacherUnlockAll
            );
            const isLocked = status === 'locked';
            const prog = student.stageProgress[stage.id];
            const bestAccuracy = prog?.bestAccuracy ?? 0;

            // Compute actual points earned in this stage
            const stageQuestionPoints = Object.values(student.questionAttempts)
              .filter((a) => a.stageId === stage.id && a.isCorrect)
              .length * 10;
            const stageBonus =
              (prog?.completionBonusAwarded ? stage.completionBonus : 0) +
              (prog?.highAccuracyBonusAwarded ? stage.highAccuracyBonus : 0) +
              (prog?.finalBonusAwarded && stage.finalStageBonus ? stage.finalStageBonus : 0);
            const stagePoints = stageQuestionPoints + stageBonus;
            const hasBadge = student.earnedBadgeIds.includes(stage.badge.id);
            const meta = STATUS_META[status];

            return (
              <div
                key={stage.id}
                className={`rounded-2xl border-2 p-5 flex flex-col justify-between space-y-5 transition-all ${
                  meta.borderClass
                } ${meta.bgClass} ${
                  isLocked ? 'opacity-80' : 'hover:shadow-md'
                }`}
              >
                <div className="space-y-4">
                  {/* Top Row: Stage Icon + Unboxed Status Text */}
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: isLocked ? '#E2E8F0' : `${stage.accentColor}1A`,
                        color: isLocked ? '#64748B' : stage.accentColor,
                      }}
                    >
                      {isLocked ? (
                        <Lock className="w-5 h-5" />
                      ) : (
                        getStageIcon(stage.id, 'w-6 h-6')
                      )}
                    </div>

                    <div className={`text-xs font-bold flex items-center gap-1 ${meta.textClass}`}>
                      {status === 'completed' && <CheckCircle2 className="w-4 h-4" />}
                      {status === 'locked' && <Lock className="w-3.5 h-3.5" />}
                      <span>{meta.label}</span>
                    </div>
                  </div>

                  {/* Title & Topic */}
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-slate-500">
                      {stage.code} · {stage.topic}
                    </div>
                    <h3 className="font-display text-lg font-extrabold text-slate-900 leading-snug">
                      {stage.name}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {stage.description}
                    </p>
                  </div>

                  {/* Progress Bar & Metrics */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold tabular-nums">
                      <span className="text-slate-600">Tiến độ: {bestAccuracy}%</span>
                      <span className="text-slate-700">{stagePoints} điểm</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${bestAccuracy}%`,
                          backgroundColor: isLocked ? '#CBD5E1' : stage.accentColor,
                        }}
                      />
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-0.5">
                      <Award
                        className="w-3.5 h-3.5 shrink-0"
                        style={{ color: hasBadge ? stage.accentColor : '#94A3B8' }}
                      />
                      <span className={hasBadge ? 'font-semibold text-slate-800' : ''}>
                        Huy hiệu: {stage.badge.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => !isLocked && onSelectStage(stage.id)}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                    isLocked
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      : 'text-white hover:opacity-95 shadow-sm'
                  }`}
                  style={isLocked ? undefined : { backgroundColor: stage.accentColor }}
                >
                  {isLocked ? (
                    <>Cần đạt ≥ {settings.unlockThreshold}% Chặng {stage.id - 1}</>
                  ) : status === 'completed' ? (
                    <>
                      Ôn luyện & Cải thiện điểm
                      <ChevronRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Vào {stage.code}
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

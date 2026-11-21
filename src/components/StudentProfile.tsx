import React from 'react';
import {
  Award,
  BookOpen,
  Clock,
  Printer,
  Star,
  Target,
  Trophy,
} from 'lucide-react';
import { AppSettings, StudentRecord } from '../types';
import { computeStudentStats, formatDuration, getStudentTitle } from '../utils/scoring';
import { BadgeSystem } from './BadgeSystem';
import { StudentProgress } from './StudentProgress';
import { TriangleLogo } from './TriangleLogo';

interface StudentProfileProps {
  student: StudentRecord;
  settings: AppSettings;
  onSelectStage: (stageId: number) => void;
  onOpenReview: () => void;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({
  student,
  settings,
  onSelectStage,
  onOpenReview,
}) => {
  const stats = computeStudentStats(student);
  const stage6Prog = student.stageProgress[6];
  const titleInfo = getStudentTitle(
    student.totalPoints,
    Boolean(stage6Prog?.completed),
    stage6Prog?.bestAccuracy ?? 0
  );

  const issuedDate = student.certificateIssuedAt
    ? new Date(student.certificateIssuedAt).toLocaleDateString('vi-VN')
    : new Date().toLocaleDateString('vi-VN');

  return (
    <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Header Profile Card */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-blue-700">HỒ SƠ CHINH PHỤC</div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
              {student.fullName}
            </h1>
            <div className="text-sm text-slate-600 flex flex-wrap items-center gap-2">
              <span className="font-semibold">Lớp {student.className}</span>
              {student.schoolName && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{student.schoolName}</span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span className="font-bold" style={{ color: titleInfo.color }}>
                Danh hiệu: {titleInfo.title}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenReview}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors shrink-0"
          >
            <BookOpen className="w-4 h-4" />
            Xem lại câu đúng & sai ({stats.totalAnswered})
          </button>
        </div>

        {/* All Required KPI Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <div className="text-xs text-slate-500 font-medium">Tổng điểm tích lũy</div>
            <div className="font-display text-2xl font-extrabold text-blue-700 tabular-nums mt-1 flex items-center gap-1.5">
              <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
              {student.totalPoints}
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <div className="text-xs text-slate-500 font-medium">Câu đã làm (Đúng / Sai)</div>
            <div className="font-display text-2xl font-extrabold text-slate-900 tabular-nums mt-1">
              {stats.totalAnswered}{' '}
              <span className="text-sm font-bold text-emerald-600">({stats.totalCorrect}✓</span>
              <span className="text-sm font-bold text-rose-600"> / {stats.totalWrong}✗)</span>
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <div className="text-xs text-slate-500 font-medium">Tỉ lệ chính xác</div>
            <div className="font-display text-2xl font-extrabold text-teal-700 tabular-nums mt-1 flex items-center gap-1.5">
              <Target className="w-5 h-5 text-teal-600" />
              {stats.accuracy}%
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <div className="text-xs text-slate-500 font-medium">Thời gian học tập</div>
            <div className="font-display text-xl font-extrabold text-slate-900 tabular-nums mt-1.5 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-500" />
              {formatDuration(student.totalStudySeconds)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-sm text-slate-700">
          <div className="rounded-xl bg-blue-50/70 border border-blue-100 p-4 flex items-center justify-between">
            <span className="font-semibold text-slate-800">Số chặng đã hoàn thành</span>
            <span className="font-display text-xl font-extrabold text-blue-700 tabular-nums">
              {stats.completedStages} / 6
            </span>
          </div>
          <div className="rounded-xl bg-amber-50/70 border border-amber-100 p-4 flex items-center justify-between">
            <span className="font-semibold text-slate-800">Số huy hiệu đã nhận</span>
            <span className="font-display text-xl font-extrabold text-amber-700 tabular-nums">
              {student.earnedBadgeIds.length} / 6
            </span>
          </div>
        </div>
      </section>

      {/* Official Certificate Section (Strictly earned only when all 6 stages completed) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4 no-print">
          <h2 className="font-display text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Chứng nhận hoàn thành hành trình
          </h2>
          {stats.canReceiveCertificate && (
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm font-bold hover:bg-slate-50"
            >
              <Printer className="w-4 h-4" />
              In chứng nhận
            </button>
          )}
        </div>

        {stats.canReceiveCertificate ? (
          <div className="print-container bg-white rounded-3xl border-4 border-amber-400 p-8 sm:p-10 text-center space-y-5 shadow-sm relative overflow-hidden">
            <div className="flex justify-center">
              <TriangleLogo size={56} />
            </div>
            <div className="text-xs font-bold tracking-widest text-amber-700 uppercase">
              CHỨNG NHẬN HOÀN THÀNH CHƯƠNG IV – TOÁN 7
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
              TRIANGLE MASTER – CHIẾN BINH CHINH PHỤC THẾ GIỚI TAM GIÁC
            </h3>
            <p className="text-sm text-slate-600">Chứng nhận học sinh:</p>
            <div className="font-display text-3xl sm:text-4xl font-extrabold text-blue-700">
              {student.fullName}
            </div>
            <div className="text-base font-semibold text-slate-700">
              Lớp: {student.className}
              {student.schoolName ? ` · Trường: ${student.schoolName}` : ''}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto pt-3 border-t border-amber-200 text-sm">
              <div>
                <div className="text-slate-500">Tổng điểm đạt được</div>
                <div className="font-display text-xl font-extrabold text-slate-900 tabular-nums">
                  {student.totalPoints} điểm
                </div>
              </div>
              <div>
                <div className="text-slate-500">Số chặng hoàn thành</div>
                <div className="font-display text-xl font-extrabold text-emerald-700 tabular-nums">
                  {stats.completedStages} / 6 chặng
                </div>
              </div>
              <div>
                <div className="text-slate-500">Ngày hoàn thành</div>
                <div className="font-display text-xl font-extrabold text-slate-900 tabular-nums">
                  {issuedDate}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
            <div className="flex items-start gap-3">
              <Award className="w-6 h-6 text-slate-400 shrink-0 mt-0.5" />
              <div className="text-sm text-slate-600">
                <div className="font-bold text-slate-800">Chứng nhận chưa mở khóa</div>
                Bạn cần hoàn thành đủ cả <strong>6/6 chặng</strong> (đạt tối thiểu {settings.unlockThreshold}% mỗi chặng) để được cấp chứng nhận chính thức “TRIANGLE MASTER – CHIẾN BINH CHINH PHỤC THẾ GIỚI TAM GIÁC”. Hiện tại: {stats.completedStages}/6 chặng.
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Weak Topics Advice */}
      {stats.weakTopics.length > 0 && (
        <section className="bg-rose-50/70 rounded-2xl border border-rose-200 p-5 space-y-3 no-print">
          <h2 className="font-display text-lg font-extrabold text-rose-950">
            Nội dung kiến thức bạn nên ôn tập thêm
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.weakTopics.slice(0, 6).map((w) => (
              <div
                key={w.tag}
                className="bg-white rounded-xl border border-rose-200/80 p-3.5 flex items-center justify-between gap-2"
              >
                <span className="text-sm font-semibold text-slate-800">{w.tag}</span>
                <span className="text-xs font-mono font-bold text-rose-700 tabular-nums shrink-0">
                  Sai {w.wrongCount}/{w.totalCount}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Badge Collection */}
      <section className="space-y-4 no-print">
        <h2 className="font-display text-xl font-extrabold text-slate-900">
          Bộ sưu tập 6 Huy hiệu chinh phục
        </h2>
        <BadgeSystem earnedBadgeIds={student.earnedBadgeIds} />
      </section>

      {/* Recharts Chart & 6-Stage Table */}
      <section className="no-print">
        <StudentProgress
          student={student}
          settings={settings}
          onSelectStage={onSelectStage}
        />
      </section>

      {/* Practice / Challenge Session History */}
      <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden no-print">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-display text-lg font-extrabold text-slate-900">
            Lịch sử các lượt luyện tập & thử thách ({student.sessions.length})
          </h2>
        </div>

        {student.sessions.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Chưa có lượt chơi nào được ghi nhận. Hãy chọn một chặng trên bản đồ để bắt đầu!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Chặng học tập</th>
                  <th className="py-3 px-4">Chế độ</th>
                  <th className="py-3 px-4 text-right">Kết quả</th>
                  <th className="py-3 px-4 text-right">Tỉ lệ</th>
                  <th className="py-3 px-4 text-right">Điểm nhận</th>
                  <th className="py-3 px-4 text-right">Thời lượng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {student.sessions.map((ses) => (
                  <tr key={ses.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 text-xs text-slate-500 tabular-nums whitespace-nowrap">
                      {new Date(ses.completedAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      Chặng {ses.stageId}: {ses.stageName}
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold text-slate-600">
                      {ses.mode === 'challenge' ? 'Thử thách' : 'Luyện tập'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      {ses.correctCount}/{ses.totalQuestions}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-blue-700">
                      {ses.accuracyPercent}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-amber-600">
                      +{ses.pointsEarned}
                    </td>
                    <td className="py-3 px-4 text-right text-xs text-slate-600 tabular-nums whitespace-nowrap">
                      {formatDuration(ses.durationSec)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

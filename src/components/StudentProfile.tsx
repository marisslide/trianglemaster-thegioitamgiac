import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  Clock,
  Printer,
  Star,
  Target,
  Trophy,
  Users,
  Flame,
  ShieldCheck,
  CheckCircle2,
  Stethoscope,
} from 'lucide-react';
import { AppSettings, StudentRecord } from '../types';
import { computeStudentStats, formatDuration, getStudentTitle } from '../utils/scoring';
import { BadgeSystem } from './BadgeSystem';
import { StudentProgress } from './StudentProgress';
import { TriangleLogo } from './TriangleLogo';

interface StudentProfileProps {
  student: StudentRecord;
  allStudents?: StudentRecord[];
  settings: AppSettings;
  onSelectStage: (stageId: number) => void;
  onOpenReview: () => void;
  onOpenErrorLab?: () => void;
  onUpdateStudent?: (updated: StudentRecord) => void;
}

const PRESET_TEAMS = [
  'Đội Tam giác đều',
  'Đội Tam giác vuông',
  'Đội Tam giác cân',
  'Đội Đường trung trực',
  'Nhóm 1',
  'Nhóm 2',
  'Nhóm 3',
  'Nhóm 4',
];

export const StudentProfile: React.FC<StudentProfileProps> = ({
  student,
  allStudents = [],
  settings,
  onSelectStage,
  onOpenReview,
  onOpenErrorLab,
  onUpdateStudent,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'leaderboard'>('profile');
  const [leaderboardMode, setLeaderboardMode] = useState<'individual' | 'team'>('individual');
  const [isChangingTeam, setIsChangingTeam] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(student.teamName || PRESET_TEAMS[0]);

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

  // Compute full class student list (including active student if not already present)
  const fullStudentList = React.useMemo(() => {
    const list = [...allStudents];
    if (!list.some((s) => s.id === student.id)) {
      list.push(student);
    }
    return list.map((s) => (s.id === student.id ? student : s));
  }, [allStudents, student]);

  // Individual Leaderboard
  const sortedStudents = React.useMemo(() => {
    return [...fullStudentList].sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      const statsB = computeStudentStats(b);
      const statsA = computeStudentStats(a);
      return statsB.accuracy - statsA.accuracy;
    });
  }, [fullStudentList]);

  // Team Leaderboard
  const teamStats = React.useMemo(() => {
    const map = new Map<
      string,
      { teamName: string; members: StudentRecord[]; totalScore: number; avgAccuracy: number }
    >();

    PRESET_TEAMS.forEach((team) => {
      map.set(team, { teamName: team, members: [], totalScore: 0, avgAccuracy: 0 });
    });

    fullStudentList.forEach((s) => {
      const team = s.teamName || 'Chưa phân đội';
      if (!map.has(team)) {
        map.set(team, { teamName: team, members: [], totalScore: 0, avgAccuracy: 0 });
      }
      const item = map.get(team)!;
      item.members.push(s);
      item.totalScore += s.totalPoints;
    });

    return Array.from(map.values())
      .map((t) => {
        const totalAccuracy = t.members.reduce(
          (sum, m) => sum + computeStudentStats(m).accuracy,
          0
        );
        const avgAccuracy = t.members.length > 0 ? Math.round(totalAccuracy / t.members.length) : 0;
        return {
          ...t,
          avgAccuracy,
          avgScore: t.members.length > 0 ? Math.round(t.totalScore / t.members.length) : 0,
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore);
  }, [fullStudentList]);

  const handleSaveTeam = () => {
    if (onUpdateStudent) {
      onUpdateStudent({
        ...student,
        teamName: selectedTeam,
        lastActiveAt: new Date().toISOString(),
      });
    }
    setIsChangingTeam(false);
  };

  return (
    <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm no-print">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'profile'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Hồ sơ & Thành tích cá nhân
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('leaderboard')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            Bảng xếp hạng & Thi đua nhóm
          </button>
        </div>

        <div className="flex items-center gap-2">
          {onOpenErrorLab && (
            <button
              type="button"
              onClick={onOpenErrorLab}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 text-xs font-bold hover:bg-amber-100 transition-colors"
            >
              <Stethoscope className="w-4 h-4 text-amber-600" />
              Phòng chẩn đoán lỗi sai
            </button>
          )}
          <button
            type="button"
            onClick={onOpenReview}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-slate-600" />
            Xem câu đúng/sai ({stats.totalAnswered})
          </button>
        </div>
      </div>

      {activeTab === 'profile' ? (
        <div className="space-y-8">
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
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-xs border border-blue-200">
                    <Users className="w-3.5 h-3.5" />
                    {student.teamName || 'Chưa vào đội'}
                  </span>
                </div>
              </div>

              {onUpdateStudent && (
                <div>
                  {isChangingTeam ? (
                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <select
                        value={selectedTeam}
                        onChange={(e) => setSelectedTeam(e.target.value)}
                        className="text-xs font-semibold px-2 py-1.5 rounded-lg border border-slate-300 bg-white"
                      >
                        {PRESET_TEAMS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleSaveTeam}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700"
                      >
                        Lưu
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsChangingTeam(false)}
                        className="px-2 py-1.5 text-slate-500 text-xs hover:text-slate-800"
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsChangingTeam(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold hover:bg-slate-100"
                    >
                      <Users className="w-3.5 h-3.5" />
                      Đổi đội thi đua
                    </button>
                  )}
                </div>
              )}
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-sm text-slate-700">
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
              <div className="rounded-xl bg-emerald-50/70 border border-emerald-100 p-4 flex items-center justify-between">
                <span className="font-semibold text-slate-800">Lỗi sai đã chẩn đoán</span>
                <span className="font-display text-xl font-extrabold text-emerald-700 tabular-nums">
                  {student.completedErrorCaseIds?.length || 0} ca
                </span>
              </div>
            </div>
          </section>

          {/* Official Certificate Section */}
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
                    Bạn cần hoàn thành đủ cả <strong>6/6 chặng</strong> (đạt tối thiểu{' '}
                    {settings.unlockThreshold}% mỗi chặng) để được cấp chứng nhận chính thức
                    “TRIANGLE MASTER – CHIẾN BINH CHINH PHỤC THẾ GIỚI TAM GIÁC”. Hiện tại:{' '}
                    {stats.completedStages}/6 chặng.
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
      ) : (
        /* LEADERBOARD & TEAM COMPETITION TAB */
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Flame className="w-6 h-6 text-amber-500" />
                  Bảng thi đua & Bảng vàng Triangle Master
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Khuyến khích học sinh thi đua cá nhân và làm việc nhóm trong các giờ học hình học
                </p>
              </div>

              {/* Mode Switcher */}
              <div className="flex items-center p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setLeaderboardMode('individual')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    leaderboardMode === 'individual'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Thi đua Cá nhân
                </button>
                <button
                  type="button"
                  onClick={() => setLeaderboardMode('team')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    leaderboardMode === 'team'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Thi đua Đội / Nhóm
                </button>
              </div>
            </div>

            {leaderboardMode === 'individual' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                      <th className="py-3 px-3 text-center">Hạng</th>
                      <th className="py-3 px-4">Học sinh</th>
                      <th className="py-3 px-4">Lớp</th>
                      <th className="py-3 px-4">Đội thi đua</th>
                      <th className="py-3 px-4 text-right">Tổng điểm</th>
                      <th className="py-3 px-4 text-right">Độ chính xác</th>
                      <th className="py-3 px-4 text-center">Huy hiệu</th>
                      <th className="py-3 px-4">Danh hiệu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedStudents.map((st, idx) => {
                      const isMe = st.id === student.id;
                      const stStats = computeStudentStats(st);
                      const s6 = st.stageProgress[6];
                      const title = getStudentTitle(
                        st.totalPoints,
                        Boolean(s6?.completed),
                        s6?.bestAccuracy ?? 0
                      );

                      let rankBadge = (
                        <span className="font-bold font-mono text-slate-500">#{idx + 1}</span>
                      );
                      if (idx === 0)
                        rankBadge = (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-700 font-extrabold text-sm shadow-sm">
                            🥇 1
                          </span>
                        );
                      else if (idx === 1)
                        rankBadge = (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-extrabold text-sm shadow-sm">
                            🥈 2
                          </span>
                        );
                      else if (idx === 2)
                        rankBadge = (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700/10 text-amber-800 font-extrabold text-sm shadow-sm">
                            🥉 3
                          </span>
                        );

                      return (
                        <tr
                          key={st.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isMe ? 'bg-blue-50/60 font-semibold' : ''
                          }`}
                        >
                          <td className="py-3 px-3 text-center whitespace-nowrap">{rankBadge}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{st.fullName}</span>
                              {isMe && (
                                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-blue-600 text-white">
                                  BẠN
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-600">{st.className}</td>
                          <td className="py-3 px-4 text-xs font-medium text-slate-700">
                            {st.teamName ? (
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                                {st.teamName}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Chưa vào đội</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-display font-extrabold text-amber-600 tabular-nums">
                            {st.totalPoints}đ
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-teal-700 tabular-nums">
                            {stStats.accuracy}%
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                              {st.earnedBadgeIds.length} / 6
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs font-bold" style={{ color: title.color }}>
                            {title.title}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* TEAM COMPETITION VIEW */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamStats.map((team, idx) => {
                  const isMyTeam = student.teamName === team.teamName;
                  return (
                    <div
                      key={team.teamName}
                      className={`rounded-2xl border p-5 space-y-4 transition-all ${
                        isMyTeam
                          ? 'border-blue-400 bg-blue-50/40 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm ${
                              idx === 0
                                ? 'bg-amber-400 text-amber-950 shadow-sm'
                                : idx === 1
                                ? 'bg-slate-200 text-slate-800'
                                : idx === 2
                                ? 'bg-amber-700/20 text-amber-900'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            #{idx + 1}
                          </div>
                          <div>
                            <h3 className="font-display font-extrabold text-base text-slate-900">
                              {team.teamName}
                            </h3>
                            <div className="text-xs text-slate-500">
                              {team.members.length} thành viên tham gia
                            </div>
                          </div>
                        </div>

                        {isMyTeam && (
                          <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                            ĐỘI CỦA BẠN
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-100">
                        <div className="bg-slate-50 rounded-xl p-2.5">
                          <div className="text-[11px] text-slate-500 font-medium">Tổng điểm</div>
                          <div className="font-display font-extrabold text-base text-blue-700 tabular-nums mt-0.5">
                            {team.totalScore}
                          </div>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-2.5">
                          <div className="text-[11px] text-slate-500 font-medium">Điểm TB/bạn</div>
                          <div className="font-display font-extrabold text-base text-amber-600 tabular-nums mt-0.5">
                            {team.avgScore}
                          </div>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-2.5">
                          <div className="text-[11px] text-slate-500 font-medium">Độ chính xác TB</div>
                          <div className="font-display font-extrabold text-base text-teal-700 tabular-nums mt-0.5">
                            {team.avgAccuracy}%
                          </div>
                        </div>
                      </div>

                      {team.members.length > 0 && (
                        <div className="pt-1">
                          <div className="text-xs font-semibold text-slate-600 mb-1.5">
                            Thành viên:
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {team.members.map((m) => (
                              <span
                                key={m.id}
                                className={`text-xs px-2 py-0.5 rounded-lg border ${
                                  m.id === student.id
                                    ? 'bg-blue-600 text-white border-blue-600 font-bold'
                                    : 'bg-white border-slate-200 text-slate-700'
                                }`}
                              >
                                {m.fullName} ({m.totalPoints}đ)
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

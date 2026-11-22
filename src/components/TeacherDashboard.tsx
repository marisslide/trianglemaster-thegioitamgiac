import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Cloud,
  Copy,
  Download,
  FileJson,
  Flame,
  GraduationCap,
  Lightbulb,
  Printer,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  TrendingUp,
  Unlock,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { AppSettings, StudentRecord } from '../types';
import { STAGES } from '../data/stages';
import { QUESTION_BANK_AUDIT } from '../data/questionBank';
import { computeStudentStats, formatDuration } from '../utils/scoring';
import {
  GOOGLE_APPS_SCRIPT_CODE,
  GoogleSheetsService,
  PAYLOAD_EXAMPLE,
} from '../services/GoogleSheetsService';

interface TeacherDashboardProps {
  students: StudentRecord[];
  settings: AppSettings;
  onUpdateSettings: (next: AppSettings) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  students,
  settings,
  onUpdateSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'pedagogy' | 'settings' | 'sheets'>('analytics');
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'points' | 'accuracy' | 'name'>('points');
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);

  // Google Sheets state
  const [urlInput, setUrlInput] = useState(settings.googleSheetsUrl);
  const [testingConn, setTestingConn] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const uniqueClasses = useMemo(() => {
    const set = new Set(students.map((s) => s.className.trim()).filter(Boolean));
    return Array.from(set).sort();
  }, [students]);

  const computedRows = useMemo(() => {
    return students
      .map((stu) => {
        const allStats = computeStudentStats(stu);
        const attempts = Object.values(stu.questionAttempts);
        const filteredAttempts =
          stageFilter === 0 ? attempts : attempts.filter((a) => a.stageId === stageFilter);
        const answered = filteredAttempts.length;
        const correct = filteredAttempts.filter((a) => a.isCorrect).length;
        const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;

        return {
          student: stu,
          answered,
          correct,
          accuracy,
          totalPoints: stu.totalPoints,
          completedStages: allStats.completedStages,
          weakTopics: allStats.weakTopics,
        };
      })
      .filter((row) => {
        if (
          searchTerm.trim() &&
          !row.student.fullName.toLowerCase().includes(searchTerm.trim().toLowerCase())
        ) {
          return false;
        }
        if (classFilter !== 'all' && row.student.className !== classFilter) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'accuracy') return b.accuracy - a.accuracy || b.totalPoints - a.totalPoints;
        if (sortBy === 'name') return a.student.fullName.localeCompare(b.student.fullName, 'vi');
        return b.totalPoints - a.totalPoints || b.accuracy - a.accuracy;
      });
  }, [students, searchTerm, classFilter, stageFilter, sortBy]);

  // Class-wide aggregate stats (real data only!)
  const classSummary = useMemo(() => {
    const count = computedRows.length;
    if (count === 0) {
      return { avgPoints: 0, avgAccuracy: 0, totalCompletedAll: 0 };
    }
    const avgPoints = Math.round(
      computedRows.reduce((s, r) => s + r.totalPoints, 0) / count
    );
    const avgAccuracy = Math.round(
      computedRows.reduce((s, r) => s + r.accuracy, 0) / count
    );
    const totalCompletedAll = computedRows.filter((r) => r.completedStages === 6).length;
    return { avgPoints, avgAccuracy, totalCompletedAll };
  }, [computedRows]);

  const stageAverageChart = useMemo(() => {
    return STAGES.map((stage) => {
      if (computedRows.length === 0) {
        return { name: `C${stage.id}`, fullName: stage.name, avgAccuracy: 0 };
      }
      const sum = computedRows.reduce(
        (acc, r) => acc + (r.student.stageProgress[stage.id]?.bestAccuracy ?? 0),
        0
      );
      return {
        name: `C${stage.id}`,
        fullName: `${stage.code}: ${stage.name}`,
        avgAccuracy: Math.round(sum / computedRows.length),
      };
    });
  }, [computedRows]);

  // Aggregate class-wide weak topics
  const classWeakTopics = useMemo(() => {
    const map = new Map<string, { tag: string; wrongCount: number; totalCount: number }>();
    computedRows.forEach((r) => {
      Object.values(r.student.questionAttempts).forEach((att) => {
        if (stageFilter !== 0 && att.stageId !== stageFilter) return;
        const entry = map.get(att.knowledgeTag) || { tag: att.knowledgeTag, wrongCount: 0, totalCount: 0 };
        entry.totalCount += 1;
        if (!att.isCorrect) entry.wrongCount += 1;
        map.set(att.knowledgeTag, entry);
      });
    });
    return Array.from(map.values())
      .filter((w) => w.wrongCount > 0)
      .map((w) => ({ ...w, errorRate: Math.round((w.wrongCount / w.totalCount) * 100) }))
      .sort((a, b) => b.wrongCount - a.wrongCount || b.errorRate - a.errorRate)
      .slice(0, 4);
  }, [computedRows, stageFilter]);

  // Pedagogical Differentiation & Action Plans (SKKN Measure 4)
  const pedagogicalAnalysis = useMemo(() => {
    const basicNeedGroup: {
      student: StudentRecord;
      accuracy: number;
      weakTags: string[];
      totalAnswered: number;
    }[] = [];
    const advancedGroup: {
      student: StudentRecord;
      accuracy: number;
      completedStages: number;
      totalPoints: number;
    }[] = [];

    computedRows.forEach((r) => {
      if (r.answered === 0) return;
      if (r.accuracy < 70) {
        basicNeedGroup.push({
          student: r.student,
          accuracy: r.accuracy,
          weakTags: r.weakTopics.slice(0, 3).map((w) => w.tag),
          totalAnswered: r.answered,
        });
      } else {
        advancedGroup.push({
          student: r.student,
          accuracy: r.accuracy,
          completedStages: r.completedStages,
          totalPoints: r.totalPoints,
        });
      }
    });

    // Improvement progress comparing first attempt vs latest attempt
    const progressComparison = students
      .filter((s) => s.sessions && s.sessions.length >= 2)
      .map((s) => {
        const chronological = [...s.sessions].sort(
          (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
        );
        const first = chronological[0];
        const latest = chronological[chronological.length - 1];
        const delta = latest.accuracyPercent - first.accuracyPercent;
        return {
          student: s,
          firstAccuracy: first.accuracyPercent,
          latestAccuracy: latest.accuracyPercent,
          delta,
          totalSessions: s.sessions.length,
          lastPlayedAt: latest.completedAt,
        };
      })
      .sort((a, b) => b.delta - a.delta);

    // Group / Team competition overview
    const teamMap = new Map<
      string,
      { teamName: string; count: number; totalScore: number; accuracies: number[] }
    >();
    students.forEach((s) => {
      const team = s.teamName || 'Chưa vào đội';
      if (!teamMap.has(team)) {
        teamMap.set(team, { teamName: team, count: 0, totalScore: 0, accuracies: [] });
      }
      const item = teamMap.get(team)!;
      item.count += 1;
      item.totalScore += s.totalPoints;
      const stats = computeStudentStats(s);
      if (stats.totalAnswered > 0) {
        item.accuracies.push(stats.accuracy);
      }
    });

    const teamList = Array.from(teamMap.values())
      .map((t) => {
        const avgAcc =
          t.accuracies.length > 0
            ? Math.round(t.accuracies.reduce((a, b) => a + b, 0) / t.accuracies.length)
            : 0;
        return {
          ...t,
          avgAccuracy: avgAcc,
          avgScore: t.count > 0 ? Math.round(t.totalScore / t.count) : 0,
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore);

    return {
      basicNeedGroup: basicNeedGroup.sort((a, b) => a.accuracy - b.accuracy),
      advancedGroup: advancedGroup.sort((a, b) => b.accuracy - a.accuracy),
      progressComparison,
      teamList,
    };
  }, [computedRows, students]);

  // Export UTF-8 BOM CSV compatible with Excel Vietnamese
  const handleExportCSV = () => {
    const headers = [
      'STT',
      'Họ và tên',
      'Lớp',
      'Trường',
      'Số câu đã làm',
      'Số câu đúng',
      'Tỉ lệ đúng (%)',
      'Tổng điểm',
      'Số chặng hoàn thành',
      'Nội dung cần ôn tập',
    ];

    const escapeCsv = (val: string | number) => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const lines = [
      headers.map(escapeCsv).join(','),
      ...computedRows.map((row, idx) =>
        [
          idx + 1,
          row.student.fullName,
          row.student.className,
          row.student.schoolName || '',
          row.answered,
          row.correct,
          row.accuracy,
          row.totalPoints,
          `${row.completedStages}/6`,
          row.weakTopics.slice(0, 3).map((w) => w.tag).join('; ') || 'Tốt',
        ]
          .map(escapeCsv)
          .join(',')
      ),
    ];

    // UTF-8 BOM (\uFEFF) ensures Excel opens Vietnamese characters accurately
    const blob = new Blob(['\uFEFF' + lines.join('\r\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TRIANGLE_MASTER_BaoCao_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const report = {
      app: 'TRIANGLE MASTER – Toán 7 Chương IV',
      exportedAt: new Date().toISOString(),
      filter: {
        classFilter,
        stageFilter: stageFilter === 0 ? 'Tất cả 6 chặng' : `Chặng ${stageFilter}`,
      },
      summary: {
        studentCount: computedRows.length,
        ...classSummary,
      },
      students: computedRows.map((row, idx) => ({
        stt: idx + 1,
        fullName: row.student.fullName,
        className: row.student.className,
        schoolName: row.student.schoolName,
        answered: row.answered,
        correct: row.correct,
        accuracyPercent: row.accuracy,
        totalPoints: row.totalPoints,
        completedStages: row.completedStages,
        weakTopics: row.weakTopics,
        stageProgress: row.student.stageProgress,
        sessions: row.student.sessions,
      })),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TRIANGLE_MASTER_BaoCao_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveSheetsUrl = () => {
    onUpdateSettings({ ...settings, googleSheetsUrl: urlInput.trim() });
    setSyncFeedback({
      ok: true,
      message: 'Đã lưu URL Web App vào cài đặt trình duyệt. Hãy bấm "Kiểm tra kết nối" để xác thực.',
    });
  };

  const handleTestConnection = async () => {
    setTestingConn(true);
    setSyncFeedback(null);
    const trimmed = urlInput.trim();
    onUpdateSettings({ ...settings, googleSheetsUrl: trimmed });
    const res = await GoogleSheetsService.testConnection(trimmed);
    setSyncFeedback({ ok: res.ok, message: res.message });
    setTestingConn(false);
  };

  const handleSyncAll = async () => {
    setSyncingAll(true);
    setSyncFeedback(null);
    const res = await GoogleSheetsService.syncAllStudents(urlInput.trim(), students);
    setSyncFeedback({
      ok: res.failCount === 0 && res.successCount > 0,
      message: res.message,
    });
    if (res.failCount === 0 && res.successCount > 0) {
      onUpdateSettings({
        ...settings,
        googleSheetsUrl: urlInput.trim(),
        lastSyncAt: new Date().toISOString(),
      });
    }
    setSyncingAll(false);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 no-print">
        <div>
          <div className="text-xs font-semibold text-blue-700">KHU VỰC DÀNH CHO GIÁO VIÊN</div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
            TEACHER DASHBOARD – QUẢN LÝ HỌC TẬP
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Theo dõi kết quả học tập, phát hiện kiến thức học sinh còn yếu, điều chỉnh ngưỡng mở khóa và xuất báo cáo.
          </p>
        </div>

        {/* Segmented Dashboard Tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'analytics'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            Thống kê & Báo cáo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pedagogy')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'pedagogy'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Phân tích sư phạm & Đề xuất dạy học
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'settings'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            Cấu hình & Kiểm định
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sheets')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'sheets'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cloud className="w-4 h-4" />
            Kết nối Google Sheets
          </button>
        </div>
      </div>

      {/* TAB 1: ANALYTICS & REPORT TABLE */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Class KPI Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
              <div className="text-xs text-slate-500 font-medium">Học sinh đã ghi nhận</div>
              <div className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums mt-1">
                {computedRows.length}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Lưu trên trình duyệt hiện tại</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
              <div className="text-xs text-slate-500 font-medium">Điểm trung bình lớp</div>
              <div className="font-display text-2xl sm:text-3xl font-extrabold text-blue-700 tabular-nums mt-1">
                {classSummary.avgPoints}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Tổng điểm tích lũy</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
              <div className="text-xs text-slate-500 font-medium">Tỉ lệ đúng trung bình</div>
              <div className="font-display text-2xl sm:text-3xl font-extrabold text-teal-700 tabular-nums mt-1">
                {classSummary.avgAccuracy}%
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {stageFilter === 0 ? 'Toàn bộ 6 chặng' : `Riêng Chặng ${stageFilter}`}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
              <div className="text-xs text-slate-500 font-medium">Hoàn thành đủ 6 chặng</div>
              <div className="font-display text-2xl sm:text-3xl font-extrabold text-amber-600 tabular-nums mt-1">
                {classSummary.totalCompletedAll}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Đủ điều kiện nhận Chứng nhận</div>
            </div>
          </div>

          {/* Class Stage Average Chart & Weak Topics Split on Horizontal */}
          {computedRows.length > 0 && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch no-print">
              <div className="xl:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-3 flex flex-col justify-between">
                <div>
                  <h2 className="font-display text-lg font-extrabold text-slate-900">
                    Mức độ hoàn thành trung bình của lớp theo 6 chặng (%)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Tính từ dữ liệu thực tế của {computedRows.length} học sinh đang lọc.
                  </p>
                </div>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stageAverageChart}
                      margin={{ top: 8, right: 16, left: -12, bottom: 4 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: '#334155', fontSize: 12, fontWeight: 600 }} />
                      <YAxis domain={[0, 100]} unit="%" tick={{ fill: '#64748B', fontSize: 12 }} />
                      <Tooltip
                        formatter={(v) => [`${v}%`, 'Trung bình lớp']}
                        labelFormatter={(_, p) => (p && p[0]?.payload?.fullName) || ''}
                      />
                      <Bar dataKey="avgAccuracy" fill="#2563EB" radius={[8, 8, 0, 0]} maxBarSize={48} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="xl:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-3 flex flex-col justify-between">
                <div>
                  <h2 className="font-display text-lg font-extrabold text-slate-900">
                    Chủ đề kiến thức cần củng cố toàn lớp
                  </h2>
                  <p className="text-xs text-slate-500">
                    Thống kê các dạng bài có tỉ lệ sai nhiều nhất để giáo viên giảng lại trên lớp.
                  </p>
                </div>

                {classWeakTopics.length === 0 ? (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-5 text-center text-xs font-semibold text-emerald-800">
                    Tuyệt vời! Toàn bộ học sinh đều trả lời chính xác, chưa ghi nhận dạng toán nào bị yếu.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {classWeakTopics.map((item) => (
                      <div
                        key={item.tag}
                        className="rounded-xl bg-rose-50/70 border border-rose-200/80 p-3 flex items-center justify-between gap-2"
                      >
                        <span className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                          {item.tag}
                        </span>
                        <span className="font-mono text-xs font-bold text-rose-700 shrink-0 tabular-nums">
                          {item.wrongCount} lỗi ({item.errorRate}%)
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Filter + Export Action Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-3 no-print">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm tên học sinh..."
                  className="pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-800 outline-none focus:border-blue-600 w-52"
                />
              </div>

              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                aria-label="Lọc theo lớp"
                className="px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 bg-white outline-none focus:border-blue-600"
              >
                <option value="all">Tất cả các lớp</option>
                {uniqueClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    Lớp {cls}
                  </option>
                ))}
              </select>

              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(Number(e.target.value))}
                aria-label="Lọc theo chặng"
                className="px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 bg-white outline-none focus:border-blue-600"
              >
                <option value={0}>Tất cả 6 chặng</option>
                {STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code}: {s.shortName}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'points' | 'accuracy' | 'name')}
                aria-label="Sắp xếp"
                className="px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 bg-white outline-none focus:border-blue-600"
              >
                <option value="points">Sắp xếp: Tổng điểm cao nhất</option>
                <option value="accuracy">Sắp xếp: Tỉ lệ đúng cao nhất</option>
                <option value="name">Sắp xếp: Tên A → Z</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleExportCSV}
                disabled={computedRows.length === 0}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-40 whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                Xuất CSV (Excel)
              </button>
              <button
                type="button"
                onClick={handleExportJSON}
                disabled={computedRows.length === 0}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-bold hover:bg-slate-50 disabled:opacity-40 whitespace-nowrap"
              >
                <FileJson className="w-4 h-4" />
                Xuất JSON
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-bold hover:bg-slate-50 whitespace-nowrap"
              >
                <Printer className="w-4 h-4" />
                In báo cáo
              </button>
            </div>
          </div>

          {/* Required Teacher Table */}
          <div className="print-container bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-display text-lg font-extrabold text-slate-900">
                Bảng thống kê kết quả học sinh
              </h2>
              <span className="text-xs text-slate-500">
                Nhấn vào tên học sinh để xem chi tiết từng chặng & kiến thức còn yếu
              </span>
            </div>

            {computedRows.length === 0 ? (
              <div className="p-10 text-center space-y-2 text-sm text-slate-500">
                <p className="font-semibold text-slate-700">
                  Chưa có kết quả học sinh nào khớp với bộ lọc hiện tại.
                </p>
                <p>
                  Khi học sinh đăng nhập và làm bài trên thiết bị này, bảng thống kê sẽ tự động cập nhật dữ liệu thực tế tại đây.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 sticky top-0 z-10">
                      <th className="py-3 px-4">STT</th>
                      <th className="py-3 px-4">Họ và tên</th>
                      <th className="py-3 px-4">Lớp</th>
                      <th className="py-3 px-4 text-right">Số câu đã làm</th>
                      <th className="py-3 px-4 text-right">Số câu đúng</th>
                      <th className="py-3 px-4 text-right">Tỉ lệ đúng</th>
                      <th className="py-3 px-4 text-right">Tổng điểm</th>
                      <th className="py-3 px-4 text-right">Số chặng hoàn thành</th>
                      <th className="py-3 px-4 hidden xl:table-cell">Chủ đề cần củng cố</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {computedRows.map((row, idx) => (
                      <tr
                        key={row.student.id}
                        onClick={() => setSelectedStudent(row.student)}
                        className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                      >
                        <td className="py-3.5 px-4 font-mono tabular-nums text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{row.student.fullName}</div>
                          {row.student.schoolName && (
                            <div className="text-xs text-slate-500">{row.student.schoolName}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                          {row.student.className}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                          {row.answered}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-emerald-700">
                          {row.correct}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-slate-900">
                          {row.accuracy}%
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-blue-700">
                          {row.totalPoints}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-slate-800">
                          {row.completedStages}/6
                        </td>
                        <td className="py-3.5 px-4 hidden xl:table-cell">
                          {row.weakTopics.length > 0 ? (
                            <span className="inline-block max-w-[170px] truncate px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
                              {row.weakTopics[0].tag}
                            </span>
                          ) : (
                            <span className="text-xs text-emerald-600 font-semibold">Vững vàng ✓</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: TEACHING SETTINGS & QUESTION BANK AUDIT */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Teaching Mode Controls */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
            <div>
              <h2 className="font-display text-xl font-extrabold text-slate-900">
                Cấu hình điều kiện mở khóa chặng
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Điều chỉnh linh hoạt cho tiết học trên lớp hoặc hoạt động tự học tại nhà.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="unlock_slider" className="text-sm font-bold text-slate-800">
                  Ngưỡng phần trăm tối thiểu để qua chặng:
                </label>
                <span className="font-mono text-lg font-extrabold text-blue-700 tabular-nums">
                  {settings.unlockThreshold}%
                </span>
              </div>
              <input
                id="unlock_slider"
                type="range"
                min={50}
                max={100}
                step={5}
                value={settings.unlockThreshold}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    unlockThreshold: Number(e.target.value),
                  })
                }
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-500 font-mono">
                <span>50%</span>
                <span>70% (Mặc định)</span>
                <span>100%</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Unlock className="w-4 h-4 text-violet-600" />
                  Mở khóa toàn bộ 6 chặng (Chế độ giáo viên)
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Cho phép truy cập tự do mọi chặng kiến thức để trình chiếu giảng bài hoặc kiểm tra nhanh trên lớp mà không cần hoàn thành tuần tự.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.teacherUnlockAll}
                onClick={() =>
                  onUpdateSettings({
                    ...settings,
                    teacherUnlockAll: !settings.teacherUnlockAll,
                  })
                }
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  settings.teacherUnlockAll ? 'bg-violet-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow transition ${
                    settings.teacherUnlockAll ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Automated Mathematical Question Audit */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-7 h-7 text-emerald-600 shrink-0" />
              <div>
                <h2 className="font-display text-xl font-extrabold text-slate-900">
                  Kiểm định tự động Ngân hàng câu hỏi
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Hệ thống tự động kiểm tra tổng 3 góc = 180°, bất đẳng thức tam giác, kí hiệu góc vuông và cấu trúc đáp án trước mỗi lượt chơi.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5">
                <div className="text-xs text-slate-500">Tổng câu hỏi</div>
                <div className="font-display text-2xl font-extrabold text-slate-900 tabular-nums">
                  {QUESTION_BANK_AUDIT.totalChecked}
                </div>
              </div>
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5">
                <div className="text-xs text-emerald-700 font-semibold">Đạt chuẩn</div>
                <div className="font-display text-2xl font-extrabold text-emerald-700 tabular-nums">
                  {QUESTION_BANK_AUDIT.validCount}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5">
                <div className="text-xs text-slate-500">Bị loại</div>
                <div className="font-display text-2xl font-extrabold text-slate-700 tabular-nums">
                  {QUESTION_BANK_AUDIT.invalidCount}
                </div>
              </div>
            </div>

            {QUESTION_BANK_AUDIT.invalidCount === 0 ? (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-900 font-medium flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                Tất cả {QUESTION_BANK_AUDIT.validCount} câu hỏi (10 câu/chặng cho Chặng 1–5 và 15 câu cho Đấu trường Chặng 6) đều vượt qua 100% quy tắc kiểm định toán học!
              </div>
            ) : (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-900 space-y-1">
                {QUESTION_BANK_AUDIT.issues.map((iss, i) => (
                  <div key={i}>
                    [{iss.questionId}] {iss.reason}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: GOOGLE SHEETS VIA APPS SCRIPT */}
      {activeTab === 'sheets' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-blue-50 border border-blue-200 p-5 text-sm text-blue-950 space-y-1.5">
            <div className="font-bold">Lưu ý quan trọng về lưu trữ dữ liệu:</div>
            <p className="leading-relaxed">
              Mặc định, ứng dụng hoạt động hoàn toàn độc lập ở chế độ lưu cục bộ (<strong>localStorage</strong>) và tổng hợp các lượt học trên trình duyệt hiện tại. Để tổng hợp kết quả học sinh từ nhiều máy tính/điện thoại khác nhau về cùng một bảng tính, giáo viên hãy triển khai <strong>Google Apps Script Web App</strong> dưới đây và dán URL vào ô cấu hình.
            </p>
          </div>

          {/* Connection Configuration Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h2 className="font-display text-lg font-extrabold text-slate-900">
              Cấu hình URL Google Apps Script Web App
            </h2>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono text-slate-900 outline-none focus:border-blue-600"
              />
              <button
                type="button"
                onClick={handleSaveSheetsUrl}
                className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm font-bold hover:bg-slate-50 whitespace-nowrap"
              >
                Lưu URL
              </button>
              <button
                type="button"
                disabled={testingConn}
                onClick={handleTestConnection}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
              >
                <RefreshCw className={`w-4 h-4 ${testingConn ? 'animate-spin' : ''}`} />
                Kiểm tra kết nối
              </button>
              <button
                type="button"
                disabled={syncingAll || students.length === 0 || !urlInput.trim()}
                onClick={handleSyncAll}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-40 whitespace-nowrap"
              >
                <Cloud className="w-4 h-4" />
                {syncingAll ? 'Đang đồng bộ...' : `Đồng bộ (${students.length} HS)`}
              </button>
            </div>

            {syncFeedback && (
              <div
                className={`rounded-xl border p-4 text-sm font-medium flex items-start gap-2.5 ${
                  syncFeedback.ok
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {syncFeedback.ok ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{syncFeedback.message}</span>
              </div>
            )}

            {settings.lastSyncAt && (
              <p className="text-xs text-slate-500">
                Lần đồng bộ được xác nhận gần nhất:{' '}
                <span className="font-mono font-semibold">
                  {new Date(settings.lastSyncAt).toLocaleString('vi-VN')}
                </span>
              </p>
            )}
          </div>

          {/* Step-by-step guide + Apps Script Code + Payload Schema */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <h3 className="font-display text-lg font-extrabold text-slate-900">
                Hướng dẫn triển khai (4 bước)
              </h3>
              <ol className="space-y-3 text-sm text-slate-700 list-decimal list-inside leading-relaxed">
                <li>
                  Tạo một tệp <strong>Google Sheets</strong> mới trong Google Drive của giáo viên.
                </li>
                <li>
                  Trên thanh menu chọn <strong>Tiện ích mở rộng (Extensions) → Apps Script</strong>.
                </li>
                <li>
                  Xóa mã mặc định, dán toàn bộ mã <code>Code.gs</code> ở khung bên phải rồi bấm <strong>Lưu</strong>.
                </li>
                <li>
                  Chọn <strong>Triển khai (Deploy) → Tùy chọn triển khai mới → Ứng dụng web (Web app)</strong>:
                  <ul className="pl-5 mt-1 list-disc text-xs text-slate-600 space-y-1">
                    <li>Thực thi dưới tên: <strong>Tôi (Me)</strong></li>
                    <li>Người có quyền truy cập: <strong>Bất kỳ ai (Anyone)</strong></li>
                  </ul>
                  Sao chép URL kết thúc bằng <code>/exec</code> và dán vào ô phía trên, sau đó bấm <strong>Kiểm tra kết nối</strong>.
                </li>
              </ol>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-xs font-bold text-slate-700">
                  Cấu trúc JSON dữ liệu gửi lên Google Sheets:
                </div>
                <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto leading-relaxed">
                  {PAYLOAD_EXAMPLE}
                </pre>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
              <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-slate-900 font-mono">Code.gs — Google Apps Script</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? 'Đã sao chép!' : 'Sao chép mã'}
                </button>
              </div>
              <pre className="p-4 bg-slate-950 text-slate-100 text-xs font-mono overflow-x-auto flex-1 max-h-[520px] leading-relaxed">
                {GOOGLE_APPS_SCRIPT_CODE}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PEDAGOGICAL ANALYSIS & TEACHING PROPOSALS (SKKN Measure 4) */}
      {activeTab === 'pedagogy' && (
        <div className="space-y-6">
          {/* Header Overview Card */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white space-y-3 shadow-sm">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/80 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Lightbulb className="w-4 h-4" />
              Sáng kiến kinh nghiệm hình học 7
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold">
              Phân tích sư phạm & Đề xuất điều chỉnh dạy học
            </h2>
            <p className="text-sm text-blue-100 max-w-3xl leading-relaxed">
              Dựa trên dữ liệu học tập thực tế của học sinh trên ứng dụng, hệ thống tự động phân loại đối tượng học sinh, phát hiện các ngộ nhận toán học điển hình và đề xuất kế hoạch can thiệp sư phạm phù hợp.
            </p>
          </div>

          {/* Section 1: Two-Tier Student Differentiation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Group 1: Basic Support Needed */}
            <div className="bg-white rounded-3xl border-2 border-rose-200 p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-extrabold text-lg">
                    ⚠️
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-extrabold text-slate-900">
                      Nhóm cần củng cố kiến thức cơ bản
                    </h3>
                    <p className="text-xs text-rose-700 font-semibold">
                      Độ chính xác &lt; 70% ({pedagogicalAnalysis.basicNeedGroup.length} học sinh)
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200">
                  Cần phụ đạo
                </span>
              </div>

              <div className="rounded-xl bg-rose-50/60 p-4 border border-rose-100 text-xs text-rose-950 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-rose-900">
                  <ShieldCheck className="w-4 h-4 text-rose-600" />
                  Định hướng sư phạm của giáo viên:
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  <li>Yêu cầu học sinh mở <strong>Phòng chẩn đoán lỗi sai</strong> để thực hiện các ca sửa sai trực quan.</li>
                  <li>Ôn lại các yếu tố tương ứng trong Chặng 1 & 2 trước khi chuyển sang chứng minh hình.</li>
                  <li>Phân công bạn học kèm theo mô hình đôi bạn cùng tiến trong tổ.</li>
                </ul>
              </div>

              {pedagogicalAnalysis.basicNeedGroup.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-500">
                  Không có học sinh nào dưới 70%. Cả lớp đều nắm vững chuẩn kiến thức!
                </div>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {pedagogicalAnalysis.basicNeedGroup.map((item) => (
                    <div
                      key={item.student.id}
                      onClick={() => setSelectedStudent(item.student)}
                      className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-400 bg-white cursor-pointer transition-all flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          {item.student.fullName}
                        </div>
                        <div className="text-xs text-slate-500 flex flex-wrap gap-1 mt-1">
                          Lớp {item.student.className} ·{' '}
                          <span className="text-rose-600 font-medium">
                            Yếu: {item.weakTags.join(', ') || 'Cần luyện thêm'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-display font-extrabold text-base text-rose-600 tabular-nums">
                          {item.accuracy}%
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {item.totalAnswered} câu đã làm
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Group 2: Advanced Enrichment */}
            <div className="bg-white rounded-3xl border-2 border-emerald-200 p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-lg">
                    🌟
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-extrabold text-slate-900">
                      Nhóm rèn luyện nâng cao & vận dụng
                    </h3>
                    <p className="text-xs text-emerald-700 font-semibold">
                      Độ chính xác ≥ 70% ({pedagogicalAnalysis.advancedGroup.length} học sinh)
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                  Bồi dưỡng HS khá giỏi
                </span>
              </div>

              <div className="rounded-xl bg-emerald-50/60 p-4 border border-emerald-100 text-xs text-emerald-950 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  Định hướng sư phạm của giáo viên:
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  <li>Khuyến khích học sinh chinh phục <strong>Chặng 6 – Đấu trường Triangle Master</strong> để đạt danh hiệu Đại Kiện Tướng.</li>
                  <li>Giao thêm bài tập chứng minh song song và tính số đo góc bằng phương pháp dựng tam giác phụ.</li>
                  <li>Bầu làm Nhóm trưởng phụ trách hướng dẫn các thành viên trong đội thi đua.</li>
                </ul>
              </div>

              {pedagogicalAnalysis.advancedGroup.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-500">
                  Chưa có học sinh nào hoàn thành bài với độ chính xác ≥ 70%.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {pedagogicalAnalysis.advancedGroup.map((item) => (
                    <div
                      key={item.student.id}
                      onClick={() => setSelectedStudent(item.student)}
                      className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-400 bg-white cursor-pointer transition-all flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          {item.student.fullName}
                        </div>
                        <div className="text-xs text-slate-500 flex flex-wrap gap-1 mt-1">
                          Lớp {item.student.className} · {item.completedStages}/6 chặng hoàn thành
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-display font-extrabold text-base text-emerald-600 tabular-nums">
                          {item.accuracy}%
                        </div>
                        <div className="text-[11px] text-amber-600 font-bold">
                          {item.totalPoints} điểm
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Progress Tracking Across Attempts */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Theo dõi tiến bộ qua các lần luyện tập của học sinh
                </h3>
                <p className="text-xs text-slate-500">
                  So sánh tỉ lệ chính xác giữa lần thực hiện đầu tiên và lần luyện tập gần nhất
                </p>
              </div>
            </div>

            {pedagogicalAnalysis.progressComparison.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500">
                Chưa có học sinh nào thực hiện từ 2 lượt luyện tập trở lên để so sánh tiến độ.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                      <th className="py-3 px-4">Học sinh</th>
                      <th className="py-3 px-4">Lớp</th>
                      <th className="py-3 px-4 text-center">Số lượt làm</th>
                      <th className="py-3 px-4 text-right">Lượt đầu</th>
                      <th className="py-3 px-4 text-right">Lượt gần nhất</th>
                      <th className="py-3 px-4 text-right">Mức độ tiến bộ</th>
                      <th className="py-3 px-4">Đánh giá tiến bộ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pedagogicalAnalysis.progressComparison.map((row) => (
                      <tr key={row.student.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-bold text-slate-900">{row.student.fullName}</td>
                        <td className="py-3 px-4 text-xs text-slate-600">{row.student.className}</td>
                        <td className="py-3 px-4 text-center font-mono text-xs">{row.totalSessions} lượt</td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600">
                          {row.firstAccuracy}%
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-blue-700">
                          {row.latestAccuracy}%
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums font-extrabold">
                          {row.delta > 0 ? (
                            <span className="text-emerald-600">+{row.delta}%</span>
                          ) : row.delta < 0 ? (
                            <span className="text-rose-600">{row.delta}%</span>
                          ) : (
                            <span className="text-slate-500">0%</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs">
                          {row.delta >= 20 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                              🚀 Tiến bộ vượt bậc
                            </span>
                          ) : row.delta > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-[11px]">
                              📈 Có tiến bộ
                            </span>
                          ) : row.delta === 0 ? (
                            <span className="text-slate-500 text-[11px]">Duy trì ổn định</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-semibold text-[11px]">
                              ⚠️ Cần chú ý thêm
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 3: Remedial Action Plan for Top Erroneous Topics */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div>
              <h3 className="font-display text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                Kế hoạch can thiệp & Chữa lỗi chung toàn lớp (15 phút đầu giờ)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Đề xuất các hoạt động sư phạm cụ thể cho giáo viên ứng với những chủ đề học sinh mắc lỗi nhiều nhất
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">
                    Lỗi 1: Xác định góc xen giữa trong trường hợp c.g.c
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                    Phổ biến
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Nguyên nhân học sinh mắc phải:</strong> Nhìn thấy có 2 cạnh bằng nhau và 1 góc bằng nhau là vội vàng kết luận c.g.c mà không kiểm tra xem góc đó có nằm giữa 2 cạnh hay không.
                </p>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-blue-900 space-y-1">
                  <strong>Giải pháp can thiệp của GV:</strong>
                  <div>Vẽ hình hai tam giác lên bảng, cho học sinh dùng phấn màu tô viền 2 cạnh, sau đó dùng ngón tay chỉ vào điểm chung của hai cạnh để khẳng định đó mới là góc xen giữa.</div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">
                    Lỗi 2: Nhầm lẫn trường hợp c.c.c và c.g.c
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    Trọng tâm SKKN
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Nguyên nhân học sinh mắc phải:</strong> Đề bài cho 2 cạnh và 1 góc (AB = DE, BC = EF, ∠B = ∠E) nhưng lại kết luận bằng nhau theo trường hợp c.c.c.
                </p>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-blue-900 space-y-1">
                  <strong>Giải pháp can thiệp của GV:</strong>
                  <div>Yêu cầu học sinh vào <em>Phòng chẩn đoán lỗi sai</em> làm Ca chẩn đoán số 1; giải thích rõ c.c.c cần đủ 3 cạnh, nếu chỉ có 2 cạnh và 1 góc xen giữa thì bắt buộc phải là c.g.c.</div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">
                    Lỗi 3: Áp dụng trường hợp tam giác vuông khi chưa có góc vuông
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    Cẩn trọng
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Nguyên nhân học sinh mắc phải:</strong> Quên kiểm tra điều kiện ∠ = 90° trước khi áp dụng trường hợp "cạnh huyền - cạnh góc vuông".
                </p>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-blue-900 space-y-1">
                  <strong>Giải pháp can thiệp của GV:</strong>
                  <div>Nhấn mạnh quy tắc: "Phải vuông thì mới có huyền". Yêu cầu học sinh chỉ ra góc vuông trước khi xét cặp cạnh huyền.</div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">
                    Lỗi 4: Thứ tự các đỉnh tương ứng trong kí hiệu hai tam giác
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                    Kỹ năng cơ bản
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Nguyên nhân học sinh mắc phải:</strong> Viết kí hiệu tự do mà không ghép đúng đỉnh tương ứng, dẫn tới suy ra cặp cạnh và góc tương ứng bị sai lệch.
                </p>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-blue-900 space-y-1">
                  <strong>Giải pháp can thiệp của GV:</strong>
                  <div>Luyện tập kỹ thuật "đối chiếu vạch": Cạnh 1 vạch đối diện đỉnh nào thì đỉnh đó tương ứng với đỉnh đối diện cạnh 1 vạch của tam giác kia.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Class Team Competition Status */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div>
              <h3 className="font-display text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                Tổng hợp tình hình thi đua Đội / Nhóm của lớp
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Theo dõi kết quả học tập hợp tác và tinh thần thi đua giữa các tổ/nhóm trong lớp
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {pedagogicalAnalysis.teamList.map((team, idx) => (
                <div
                  key={team.teamName}
                  className="rounded-2xl border border-slate-200 p-4 bg-slate-50/60 space-y-2 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                      Hạng #{idx + 1}
                    </span>
                    <span className="text-xs text-slate-500">{team.count} học sinh</span>
                  </div>
                  <h4 className="font-display font-extrabold text-base text-slate-900">
                    {team.teamName}
                  </h4>
                  <div className="pt-1 flex items-center justify-between text-xs border-t border-slate-200/80">
                    <span className="text-slate-500">Tổng điểm:</span>
                    <span className="font-bold text-blue-700 font-mono">{team.totalScore}đ</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Độ chính xác TB:</span>
                    <span className="font-bold text-teal-700 font-mono">{team.avgAccuracy}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Individual Student Detail Modal */}
      {selectedStudent && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 no-print"
          onClick={() => setSelectedStudent(null)}
        >
          <div
            className="bg-white rounded-3xl border border-slate-200 max-w-2xl lg:max-w-4xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-blue-700">CHI TIẾT HỌC SINH</div>
                <h3 className="font-display text-2xl font-extrabold text-slate-900">
                  {selectedStudent.fullName}
                </h3>
                <p className="text-sm text-slate-600">
                  Lớp {selectedStudent.className}
                  {selectedStudent.schoolName ? ` · ${selectedStudent.schoolName}` : ''} · Tổng học:{' '}
                  {formatDuration(selectedStudent.totalStudySeconds)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"
                aria-label="Đóng chi tiết"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stage Breakdown */}
            <div className="space-y-2">
              <div className="text-sm font-bold text-slate-900">Kết quả từng chặng</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {STAGES.map((st) => {
                  const p = selectedStudent.stageProgress[st.id];
                  return (
                    <div
                      key={st.id}
                      className="rounded-xl border border-slate-200 p-3 bg-slate-50/70"
                    >
                      <div className="text-xs font-semibold text-slate-500">{st.code}</div>
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {st.shortName}
                      </div>
                      <div className="font-display text-lg font-extrabold text-blue-700 tabular-nums mt-1">
                        {p?.bestAccuracy ?? 0}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Horizontal Split: Weak Topics & Recent Sessions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
              {/* Weak Topics */}
              <div className="space-y-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-200">
                <div className="text-sm font-bold text-slate-900">Nội dung kiến thức còn yếu</div>
                {(() => {
                  const st = computeStudentStats(selectedStudent);
                  if (st.weakTopics.length === 0) {
                    return (
                      <p className="text-sm text-emerald-700 font-medium">
                        Học sinh chưa có nội dung sai nào cần khắc phục.
                      </p>
                    );
                  }
                  return (
                    <div className="space-y-2">
                      {st.weakTopics.map((w) => (
                        <div
                          key={w.tag}
                          className="flex items-center justify-between text-sm rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2"
                        >
                          <span className="font-medium text-rose-950 text-xs sm:text-sm">{w.tag}</span>
                          <span className="font-mono text-xs font-bold text-rose-700 tabular-nums shrink-0">
                            Sai {w.wrongCount}/{w.totalCount} ({w.errorRate}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Recent Sessions */}
              <div className="space-y-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-200">
                <div className="text-sm font-bold text-slate-900">
                  Lịch sử luyện tập gần đây ({selectedStudent.sessions.length})
                </div>
                {selectedStudent.sessions.length === 0 ? (
                  <p className="text-xs text-slate-500">Chưa có lượt hoàn thành nào.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedStudent.sessions.slice(0, 5).map((ses) => (
                      <div
                        key={ses.id}
                        className="flex flex-wrap items-center justify-between gap-2 text-xs rounded-xl bg-white border border-slate-200 px-3 py-2"
                      >
                        <div>
                          <span className="font-bold text-slate-900">
                            Chặng {ses.stageId} ({ses.mode === 'challenge' ? 'Thử thách' : 'Luyện tập'})
                          </span>
                          <span className="text-slate-500 block text-[11px]">
                            {new Date(ses.completedAt).toLocaleString('vi-VN')}
                          </span>
                        </div>
                        <div className="font-mono font-bold text-blue-700 tabular-nums text-right">
                          {ses.correctCount}/{ses.totalQuestions} ({ses.accuracyPercent}%) · +{ses.pointsEarned}đ
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

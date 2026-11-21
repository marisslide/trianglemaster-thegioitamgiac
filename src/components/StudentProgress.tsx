import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CheckCircle2, Lock, PlayCircle } from 'lucide-react';
import { AppSettings, StudentRecord } from '../types';
import { STAGES } from '../data/stages';
import { getValidatedQuestionsForStage } from '../data/questionBank';
import { getStageStatus } from '../utils/scoring';

interface StudentProgressProps {
  student: StudentRecord;
  settings: AppSettings;
  onSelectStage?: (stageId: number) => void;
}

export const StudentProgress: React.FC<StudentProgressProps> = ({
  student,
  settings,
  onSelectStage,
}) => {
  const attempts = Object.values(student.questionAttempts);

  const stageRows = STAGES.map((stage) => {
    const totalStageQ = getValidatedQuestionsForStage(stage.id).questions.length;
    const stageAttempts = attempts.filter((a) => a.stageId === stage.id);
    const answered = stageAttempts.length;
    const correct = stageAttempts.filter((a) => a.isCorrect).length;
    const prog = student.stageProgress[stage.id];
    const bestAccuracy = prog?.bestAccuracy ?? 0;

    const bonus =
      (prog?.completionBonusAwarded ? stage.completionBonus : 0) +
      (prog?.highAccuracyBonusAwarded ? stage.highAccuracyBonus : 0) +
      (prog?.finalBonusAwarded && stage.finalStageBonus ? stage.finalStageBonus : 0);
    const points = correct * 10 + bonus;

    const status = getStageStatus(
      student,
      stage.id,
      settings.unlockThreshold,
      settings.teacherUnlockAll
    );

    return {
      stage,
      totalStageQ,
      answered,
      correct,
      points,
      bestAccuracy,
      status,
      chartName: `C${stage.id}`,
      fullLabel: `${stage.code}: ${stage.shortName}`,
    };
  });

  const hasAnyAttempt = attempts.length > 0;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
      {/* 6-Stage Accuracy Bar Chart (Real Student Data Only) */}
      <div className="xl:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4 flex flex-col justify-between">
        <div>
          <h3 className="font-display text-lg font-extrabold text-slate-900">
            Biểu đồ năng lực theo 6 chặng (%)
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Hiển thị tỉ lệ hoàn thành cao nhất thực tế của bạn ở từng chặng kiến thức Chương IV.
          </p>
        </div>

        {!hasAnyAttempt ? (
          <div className="rounded-xl bg-slate-50 border border-dashed border-slate-300 py-10 px-4 text-center text-sm text-slate-500">
            Bạn chưa hoàn thành câu hỏi nào. Hãy bắt đầu Chặng 1 để biểu đồ năng lực ghi nhận kết quả thực tế của bạn!
          </div>
        ) : (
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stageRows}
                margin={{ top: 10, right: 16, left: -12, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="chartName"
                  tick={{ fill: '#334155', fontSize: 12, fontWeight: 600 }}
                  axisLine={{ stroke: '#CBD5E1' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  unit="%"
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Tỉ lệ hoàn thành']}
                  labelFormatter={(_, payload) =>
                    payload && payload[0]?.payload?.fullLabel
                      ? payload[0].payload.fullLabel
                      : ''
                  }
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontSize: '13px',
                  }}
                />
                <Bar dataKey="bestAccuracy" radius={[8, 8, 0, 0]} maxBarSize={48}>
                  {stageRows.map((row) => (
                    <Cell key={row.stage.id} fill={row.stage.accentColor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Per-Stage Progress Table */}
      <div className="xl:col-span-7 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-display text-lg font-extrabold text-slate-900">
            Bảng tiến độ chi tiết 6 chặng
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">Tên chặng</th>
                <th className="py-3 px-4 text-right">Đã làm</th>
                <th className="py-3 px-4 text-right">Câu đúng</th>
                <th className="py-3 px-4 text-right">Điểm đạt</th>
                <th className="py-3 px-4 text-right">Tỉ lệ hoàn thành</th>
                <th className="py-3 px-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stageRows.map((row) => (
                <tr key={row.stage.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      disabled={row.status === 'locked' || !onSelectStage}
                      onClick={() => onSelectStage && row.status !== 'locked' && onSelectStage(row.stage.id)}
                      className="text-left group disabled:cursor-default"
                    >
                      <div className="font-bold text-slate-900 group-hover:text-blue-700">
                        {row.stage.code}: {row.stage.name}
                      </div>
                      <div className="text-xs text-slate-500">{row.stage.topic}</div>
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700">
                    {row.answered}/{row.totalStageQ}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-emerald-700">
                    {row.correct}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-blue-700">
                    {row.points}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                    {row.bestAccuracy}%
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {row.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" />
                        Hoàn thành
                      </span>
                    ) : row.status === 'in_progress' ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700">
                        <PlayCircle className="w-4 h-4" />
                        Đang thực hiện
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                        <Lock className="w-3.5 h-3.5" />
                        Chưa mở khóa
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

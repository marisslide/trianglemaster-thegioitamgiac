import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Clock, Play, ShieldCheck, Zap } from 'lucide-react';
import { GameMode, StageConfig, StudentRecord } from '../types';
import { getValidatedQuestionsForStage } from '../data/questionBank';
import { KnowledgeCard } from './KnowledgeCard';
import { GameEngine } from './GameEngine';
import { getStageIcon } from './BadgeSystem';

interface StagePageProps {
  stage: StageConfig;
  student: StudentRecord;
  unlockThreshold: number;
  onUpdateStudent: (updated: StudentRecord) => void;
  onBackToMap: () => void;
  onGoToNextStage: (nextStageId: number) => void;
  onGoToReview: () => void;
}

export const StagePage: React.FC<StagePageProps> = ({
  stage,
  student,
  unlockThreshold,
  onUpdateStudent,
  onBackToMap,
  onGoToNextStage,
  onGoToReview,
}) => {
  const [activeMode, setActiveMode] = useState<GameMode | null>(null);
  const [activeTab, setActiveTab] = useState<'knowledge' | 'play'>('knowledge');
  const [bannerError, setBannerError] = useState(false);

  const stageProgress = student.stageProgress[stage.id];
  const { questions } = getValidatedQuestionsForStage(stage.id);
  const challengeMinutes = Math.round(stage.challengeDurationSec / 60);

  if (activeMode) {
    return (
      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <GameEngine
          stage={stage}
          mode={activeMode}
          student={student}
          unlockThreshold={unlockThreshold}
          onUpdateStudent={onUpdateStudent}
          onExit={() => setActiveMode(null)}
          onGoToNextStage={(nextId) => {
            setActiveMode(null);
            onGoToNextStage(nextId);
          }}
          onGoToReview={() => {
            setActiveMode(null);
            onGoToReview();
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <button
        type="button"
        onClick={onBackToMap}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại Bản đồ hành trình
      </button>

      {/* Stage Hero Header */}
      <section className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {stage.id === 6 && !bannerError && (
          <div className="relative h-48 sm:h-60 w-full bg-slate-900 overflow-hidden">
            <img
              src="/src/assets/images/arena_trophy_banner_1795255296071.jpg"
              alt="Đấu trường TRIANGLE MASTER"
              referrerPolicy="no-referrer"
              onError={() => setBannerError(true)}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/35 to-transparent flex items-end p-6">
              <div className="text-white space-y-1">
                <div className="text-xs font-semibold text-amber-300">
                  {stage.code} · {questions.length} câu hỏi tổng hợp · {challengeMinutes} phút
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold">
                  {stage.name}
                </h1>
              </div>
            </div>
          </div>
        )}

        <div className="p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-sm"
              style={{ backgroundColor: stage.accentColor }}
            >
              {getStageIcon(stage.id, 'w-7 h-7')}
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                <span style={{ color: stage.accentColor }}>{stage.code}</span>
                <span aria-hidden="true">·</span>
                <span>{stage.topic}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{questions.length} câu hỏi đã kiểm định</span>
              </div>
              {stage.id !== 6 || bannerError ? (
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {stage.name}
                </h1>
              ) : null}
              <p className="text-sm sm:text-[15px] text-slate-600 max-w-2xl leading-relaxed">
                {stage.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <div className="text-left lg:text-right">
              <div className="text-xs font-medium text-slate-500">Thành tích cao nhất</div>
              <div className="font-display text-2xl font-extrabold text-slate-900 tabular-nums">
                {stageProgress?.bestAccuracy ?? 0}%
              </div>
              <div className="text-xs text-slate-500">
                Điều kiện qua chặng: ≥ {unlockThreshold}%
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveMode('challenge')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-white font-bold text-sm hover:opacity-95 transition-opacity shadow-sm whitespace-nowrap"
              style={{ backgroundColor: stage.accentColor }}
            >
              <Play className="w-4 h-4 fill-current" />
              Vào trò chơi ngay
            </button>
          </div>
        </div>
      </section>

      {/* Segmented View Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('knowledge')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'knowledge'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Kiến thức trọng tâm
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('play')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'play'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Zap className="w-4 h-4" />
          Chọn chế độ chơi ({questions.length} câu)
        </button>
      </div>

      {activeTab === 'knowledge' ? (
        <div className="space-y-5">
          {stage.knowledgeSections.map((section) => (
            <KnowledgeCard key={section.id} section={section} accentColor={stage.accentColor} />
          ))}

          {/* Callout bar moving seamlessly to Game Modes */}
          <div className="rounded-2xl bg-blue-50 border border-blue-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900">
                Sẵn sàng chinh phục trò chơi "{stage.gameTitle}"?
              </h3>
              <p className="text-sm text-slate-600 mt-0.5">
                Chọn chế độ Luyện tập để ôn kỹ từng bước hoặc Thử thách có đồng hồ đếm ngược để mở khóa chặng tiếp theo.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setActiveMode('practice')}
                className="px-4 py-2.5 rounded-xl border border-blue-300 bg-white text-blue-700 font-bold text-sm hover:bg-blue-50 whitespace-nowrap"
              >
                Chế độ Luyện tập
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('challenge')}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 whitespace-nowrap shadow-sm"
              >
                Chế độ Thử thách ({challengeMinutes}p)
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Mode 1: Practice */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-semibold text-teal-700">Chế độ 1</div>
                <h3 className="font-display text-xl font-extrabold text-slate-900 mt-0.5">
                  LUYỆN TẬP TỪNG BƯỚC
                </h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>· Không giới hạn thời gian suy nghĩ.</li>
                <li>· Có nút xem gợi ý kiến thức trước khi trả lời.</li>
                <li>· Hiển thị ngay giải thích chi tiết và cho phép thử lại câu sai.</li>
                <li>· Vẫn tính điểm, lưu tiến độ và mở khóa huy hiệu khi đạt ≥ {unlockThreshold}%.</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setActiveMode('practice')}
              className="w-full py-3.5 px-5 rounded-xl bg-teal-600 text-white font-bold text-sm hover:bg-teal-700 transition-colors"
            >
              Bắt đầu Luyện tập ({questions.length} câu)
            </button>
          </div>

          {/* Mode 2: Challenge */}
          <div className="bg-white rounded-2xl border-2 border-blue-200 p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-semibold text-blue-700">Chế độ 2</div>
                <h3 className="font-display text-xl font-extrabold text-slate-900 mt-0.5">
                  THỬ THÁCH TÍNH GIỜ ({challengeMinutes} PHÚT)
                </h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>· Đồng hồ đếm ngược {challengeMinutes} phút; tự động nộp bài khi hết giờ.</li>
                <li>· Không có nút gợi ý trước khi nộp — rèn phản xạ giải toán chuẩn xác.</li>
                <li>· Cộng điểm thưởng +30 khi vượt chặng và +20 khi đạt từ 90% trở lên.</li>
                {stage.finalStageBonus && (
                  <li className="font-semibold text-amber-700">
                    · Chặng cuối thưởng thêm +{stage.finalStageBonus} điểm và mở khóa Chứng nhận!
                  </li>
                )}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setActiveMode('challenge')}
              className="w-full py-3.5 px-5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm"
            >
              Vào Thử thách {stage.gameTitle}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

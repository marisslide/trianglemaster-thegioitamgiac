/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppSettings, StudentRecord } from './types';
import { STAGE_MAP } from './data/stages';
import {
  createNewStudent,
  loadActiveStudentId,
  loadSettings,
  loadStudents,
  saveActiveStudentId,
  saveSettings,
  upsertStudent,
} from './utils/storage';
import { getStageStatus } from './utils/scoring';
import { GoogleSheetsService } from './services/GoogleSheetsService';
import { AppView, Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { JourneyMap } from './components/JourneyMap';
import { StagePage } from './components/StagePage';
import { StudentProfile } from './components/StudentProfile';
import { ReviewPage } from './components/ReviewPage';
import { TeacherDashboard } from './components/TeacherDashboard';

export default function App() {
  const [students, setStudents] = useState<StudentRecord[]>(() => loadStudents());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [activeStudentId, setActiveStudentId] = useState<string | null>(() => {
    const savedId = loadActiveStudentId();
    const list = loadStudents();
    return savedId && list.some((s) => s.id === savedId) ? savedId : null;
  });

  const [currentView, setCurrentView] = useState<AppView>(() => {
    const savedId = loadActiveStudentId();
    const list = loadStudents();
    return savedId && list.some((s) => s.id === savedId) ? 'map' : 'login';
  });
  const [activeStageId, setActiveStageId] = useState<number>(1);

  const activeStudent = useMemo(
    () => students.find((s) => s.id === activeStudentId) ?? null,
    [students, activeStudentId]
  );

  // Scroll smoothly to top on view switch
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [currentView, activeStageId]);

  const handleUpdateSettings = useCallback((next: AppSettings) => {
    setSettings(next);
    saveSettings(next);
  }, []);

  const handleUpdateStudent = useCallback(
    (updated: StudentRecord) => {
      setStudents((prev) => upsertStudent(prev, updated));

      // Attempt silent real cloud sync ONLY when teacher configured a valid Apps Script URL
      if (settings.googleSheetsUrl.trim()) {
        GoogleSheetsService.syncStudent(settings.googleSheetsUrl, updated).then((res) => {
          if (res.ok && res.syncedAt) {
            setSettings((prev) => {
              const next = { ...prev, lastSyncAt: res.syncedAt };
              saveSettings(next);
              return next;
            });
          }
        });
      }
    },
    [settings.googleSheetsUrl]
  );

  const handleLoginNew = (fullName: string, className: string, schoolName: string) => {
    // Check if same student (same name & class) already exists so they keep progress
    const existing = students.find(
      (s) =>
        s.fullName.toLowerCase() === fullName.toLowerCase() &&
        s.className.toLowerCase() === className.toLowerCase()
    );

    if (existing) {
      const refreshed: StudentRecord = {
        ...existing,
        schoolName: schoolName || existing.schoolName,
        lastActiveAt: new Date().toISOString(),
      };
      setStudents((prev) => upsertStudent(prev, refreshed));
      setActiveStudentId(refreshed.id);
      saveActiveStudentId(refreshed.id);
      setCurrentView('map');
      return;
    }

    const created = createNewStudent(fullName, className, schoolName);
    setStudents((prev) => upsertStudent(prev, created));
    setActiveStudentId(created.id);
    saveActiveStudentId(created.id);
    setCurrentView('map');
  };

  const handleResumeStudent = (studentId: string) => {
    const found = students.find((s) => s.id === studentId);
    if (!found) return;
    const refreshed: StudentRecord = {
      ...found,
      lastActiveAt: new Date().toISOString(),
    };
    setStudents((prev) => upsertStudent(prev, refreshed));
    setActiveStudentId(refreshed.id);
    saveActiveStudentId(refreshed.id);
    setCurrentView('map');
  };

  const handleSwitchStudent = () => {
    setActiveStudentId(null);
    saveActiveStudentId(null);
    setCurrentView('login');
  };

  const handleSelectStage = (stageId: number) => {
    if (!activeStudent) return;
    const status = getStageStatus(
      activeStudent,
      stageId,
      settings.unlockThreshold,
      settings.teacherUnlockAll
    );
    if (status === 'locked') return;
    setActiveStageId(stageId);
    setCurrentView('stage');
  };

  const handleNavigate = (view: AppView) => {
    if ((view === 'map' || view === 'profile' || view === 'review' || view === 'stage') && !activeStudent) {
      setCurrentView('login');
      return;
    }
    setCurrentView(view);
  };

  const activeStage = STAGE_MAP[activeStageId] || STAGE_MAP[1];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      <Header
        currentView={currentView}
        student={activeStudent}
        onNavigate={handleNavigate}
        onSwitchStudent={handleSwitchStudent}
      />

      <main className="flex-1">
        {currentView === 'login' && (
          <HomePage
            existingStudents={students}
            onLoginNew={handleLoginNew}
            onResumeStudent={handleResumeStudent}
            onOpenTeacherDashboard={() => setCurrentView('teacher')}
          />
        )}

        {currentView === 'map' && activeStudent && (
          <JourneyMap
            student={activeStudent}
            settings={settings}
            onSelectStage={handleSelectStage}
            onOpenProfile={() => setCurrentView('profile')}
            onOpenReview={() => setCurrentView('review')}
          />
        )}

        {currentView === 'stage' && activeStudent && (
          <StagePage
            stage={activeStage}
            student={activeStudent}
            unlockThreshold={settings.unlockThreshold}
            onUpdateStudent={handleUpdateStudent}
            onBackToMap={() => setCurrentView('map')}
            onGoToNextStage={(nextId) => {
              setActiveStageId(nextId);
              setCurrentView('stage');
            }}
            onGoToReview={() => setCurrentView('review')}
          />
        )}

        {currentView === 'profile' && activeStudent && (
          <StudentProfile
            student={activeStudent}
            settings={settings}
            onSelectStage={handleSelectStage}
            onOpenReview={() => setCurrentView('review')}
          />
        )}

        {currentView === 'review' && activeStudent && (
          <ReviewPage student={activeStudent} onSelectStage={handleSelectStage} />
        )}

        {currentView === 'teacher' && (
          <TeacherDashboard
            students={students}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-5 px-4 sm:px-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-semibold text-slate-700">
            TRIANGLE MASTER – Chinh Phục Thế Giới Tam Giác
          </span>
          <span>
            Toán 7 · Chương IV: Tam giác bằng nhau (Bộ sách Kết nối tri thức với cuộc sống)
          </span>
        </div>
      </footer>
    </div>
  );
}

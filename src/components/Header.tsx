import React from 'react';
import { LogOut, Menu, X } from 'lucide-react';
import { StudentRecord } from '../types';
import { TriangleLogo } from './TriangleLogo';

export type AppView = 'login' | 'map' | 'stage' | 'error_lab' | 'profile' | 'review' | 'teacher';

interface HeaderProps {
  currentView: AppView;
  student: StudentRecord | null;
  onNavigate: (view: AppView) => void;
  onSwitchStudent: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  student,
  onNavigate,
  onSwitchStudent,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems: { id: AppView; label: string; requiresStudent?: boolean }[] = [
    { id: 'map', label: 'Bản đồ 6 chặng', requiresStudent: true },
    { id: 'error_lab', label: 'Chẩn đoán lỗi sai', requiresStudent: true },
    { id: 'review', label: 'Ôn tập bài sai', requiresStudent: true },
    { id: 'profile', label: 'Hồ sơ & Thi đua', requiresStudent: true },
    { id: 'teacher', label: 'Giáo viên', requiresStudent: false },
  ];

  const handleNav = (id: AppView) => {
    setMobileMenuOpen(false);
    onNavigate(id);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 no-print">
      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleNav(student ? 'map' : 'login')}
          className="flex items-center gap-2.5 whitespace-nowrap shrink-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg"
        >
          <TriangleLogo size={32} />
          <span className="font-display font-extrabold text-lg tracking-tight text-slate-900">
            TRIANGLE MASTER
          </span>
        </button>

        {/* Zone 2: Clean single-line navigation links */}
        <nav
          aria-label="Điều hướng chính"
          className="hidden md:flex items-center gap-6 text-sm font-semibold"
        >
          {navItems.map((item) => {
            if (item.requiresStudent && !student) return null;
            const active =
              currentView === item.id || (item.id === 'map' && currentView === 'stage');
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={`whitespace-nowrap shrink-0 py-1.5 border-b-2 transition-colors ${
                  active
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single primary user/action control */}
        <div className="flex items-center gap-2 shrink-0">
          {student ? (
            <button
              type="button"
              onClick={onSwitchStudent}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap shrink-0"
              title="Đổi học sinh hoặc quay lại màn hình chào mừng"
            >
              <span className="max-w-[140px] truncate">
                {student.fullName} · {student.className}
              </span>
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleNav('login')}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors whitespace-nowrap shrink-0"
            >
              Đăng nhập học tập
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100"
            aria-label="Mở menu điều hướng"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          {navItems.map((item) => {
            if (item.requiresStudent && !student) return null;
            const active =
              currentView === item.id || (item.id === 'map' && currentView === 'stage');
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  active ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
          {student && (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onSwitchStudent();
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 flex items-center justify-between"
            >
              <span>Đổi học sinh ({student.fullName})</span>
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </header>
  );
};

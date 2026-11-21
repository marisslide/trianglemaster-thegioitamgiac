import React, { useState } from 'react';
import { ArrowRight, BookOpen, GraduationCap, ShieldCheck, Trophy, UserCheck } from 'lucide-react';
import { StudentRecord } from '../types';
import { TriangleLogo } from './TriangleLogo';

interface HomePageProps {
  existingStudents: StudentRecord[];
  onLoginNew: (fullName: string, className: string, schoolName: string) => void;
  onResumeStudent: (studentId: string) => void;
  onOpenTeacherDashboard: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  existingStudents,
  onLoginNew,
  onResumeStudent,
  onOpenTeacherDashboard,
}) => {
  const [fullName, setFullName] = useState('');
  const [className, setClassName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [error, setError] = useState('');
  const [mascotError, setMascotError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Vui lòng nhập Họ và tên học sinh.');
      return;
    }
    if (!className.trim()) {
      setError('Vui lòng nhập Lớp (ví dụ: 7A1).');
      return;
    }
    setError('');
    onLoginNew(fullName.trim(), className.trim(), schoolName.trim());
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAFC] py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-6xl xl:max-w-7xl 2xl:max-w-screen-2xl mx-auto space-y-10">
        {/* Main Hero Split */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: Identity & Mascot Guide */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <TriangleLogo size={42} />
                <div className="text-xs font-semibold text-blue-700">
                  Toán 7 · Bộ sách Kết nối tri thức với cuộc sống · Chương IV
                </div>
              </div>

              <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-slate-900 leading-[1.12] tracking-tight">
                TRIANGLE MASTER
                <span className="block text-blue-600 text-2xl sm:text-3xl mt-1.5">
                  CHINH PHỤC THẾ GIỚI TAM GIÁC
                </span>
              </h1>

              <p className="text-base sm:text-lg font-medium text-slate-600 leading-relaxed max-w-xl">
                “Mỗi tam giác là một thử thách – Mỗi kiến thức là một sức mạnh!”
              </p>
            </div>

            {/* Mascot Welcome Box */}
            <div className="rounded-2xl bg-blue-50/70 border border-blue-100 p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-5">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-white border border-blue-100 shrink-0 flex items-center justify-center">
                {!mascotError ? (
                  <img
                    src="/src/assets/images/mascot_tri_guide_1795255171443.jpg"
                    alt="Linh vật tam giác TRIANGLE MASTER"
                    referrerPolicy="no-referrer"
                    onError={() => setMascotError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <TriangleLogo size={72} />
                )}
              </div>
              <div className="space-y-1.5 text-center sm:text-left">
                <div className="font-display font-bold text-slate-900 text-base">
                  Xin chào! Mình là Tri-Bot — người dẫn đường hình học của bạn
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Hãy cùng mình vượt qua 6 vùng đất toán học: từ Vương quốc Góc Tam Giác đến Đấu trường TRIANGLE MASTER với 65 câu hỏi tương tác, hình vẽ SVG chính xác và hệ thống huy hiệu hấp dẫn.
                </p>
              </div>
            </div>

            {/* Highlights strip */}
            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-100 text-center sm:text-left">
              <div>
                <div className="font-display text-2xl font-extrabold text-blue-600 tabular-nums">
                  6 chặng
                </div>
                <div className="text-xs text-slate-500 font-medium">Lộ trình Chương IV</div>
              </div>
              <div>
                <div className="font-display text-2xl font-extrabold text-teal-600 tabular-nums">
                  65 câu hỏi
                </div>
                <div className="text-xs text-slate-500 font-medium">Đã kiểm định toán học</div>
              </div>
              <div>
                <div className="font-display text-2xl font-extrabold text-amber-600 tabular-nums">
                  6 huy hiệu
                </div>
                <div className="text-xs text-slate-500 font-medium">& Chứng nhận hoàn thành</div>
              </div>
            </div>
          </div>

          {/* Right: Student Login Card */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-sm">
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-2xl font-extrabold text-slate-900">
                  Đăng nhập học tập
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Chỉ cần nhập tên và lớp — không yêu cầu email hay số điện thoại. Kết quả được lưu tự động trên thiết bị.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="stu_name" className="block text-sm font-semibold text-slate-800">
                    Họ và tên <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="stu_name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Minh Anh"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 font-medium focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15 outline-none transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="stu_class" className="block text-sm font-semibold text-slate-800">
                    Lớp <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="stu_class"
                    type="text"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="Ví dụ: 7A1"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 font-medium focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15 outline-none transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="stu_school" className="block text-sm font-semibold text-slate-800">
                    Trường <span className="text-slate-400 font-normal">(không bắt buộc)</span>
                  </label>
                  <input
                    id="stu_school"
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="Ví dụ: THCS Chu Văn An"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 font-medium focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15 outline-none transition-all"
                  />
                </div>

                {error && (
                  <p className="text-sm font-semibold text-rose-600" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-blue-600 text-white font-display font-bold text-base hover:bg-blue-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  BẮT ĐẦU CHINH PHỤC
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </div>

            {/* Returning Students Quick Resume */}
            {existingStudents.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-2.5">
                <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-teal-600" />
                  Tiếp tục hành trình đã lưu trên máy này:
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {existingStudents.slice(0, 5).map((stu) => (
                    <button
                      key={stu.id}
                      type="button"
                      onClick={() => onResumeStudent(stu.id)}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-colors flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-900 truncate">
                          {stu.fullName}
                        </div>
                        <div className="text-xs text-slate-500">
                          Lớp {stu.className} · {stu.totalPoints} điểm · {stu.earnedBadgeIds.length}/6 huy hiệu
                        </div>
                      </div>
                      <span className="text-xs font-bold text-blue-600 shrink-0">Tiếp tục →</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Dành cho giáo viên giảng dạy?</span>
              <button
                type="button"
                onClick={onOpenTeacherDashboard}
                className="font-bold text-blue-700 hover:underline inline-flex items-center gap-1"
              >
                <GraduationCap className="w-4 h-4" />
                Vào Teacher Dashboard
              </button>
            </div>
          </div>
        </section>

        {/* Feature Pillar Row */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <h3 className="font-display font-bold text-slate-900">Chuẩn Toán 7 – Kết nối tri thức</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Bao phủ trọn vẹn Chương IV: Tổng ba góc, c.c.c, c.g.c, g.c.g, 4 trường hợp tam giác vuông, tam giác cân và đường trung trực.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
            <ShieldCheck className="w-6 h-6 text-teal-600" />
            <h3 className="font-display font-bold text-slate-900">Hình vẽ SVG chuẩn xác & Kiểm định</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Kí hiệu góc vuông, vạch cạnh bằng nhau và cung góc đồng nhất tuyệt đối; bộ lọc toán học tự động kiểm tra mọi câu hỏi trước giờ chơi.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
            <Trophy className="w-6 h-6 text-amber-600" />
            <h3 className="font-display font-bold text-slate-900">Luyện tập, Thử thách & Báo cáo lớp</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Học sinh nhận huy hiệu, xem biểu đồ năng lực và ôn câu sai; giáo viên theo dõi lớp học, xuất CSV/JSON và đồng bộ Google Sheets.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

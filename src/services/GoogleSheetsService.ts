import { StudentRecord } from '../types';
import { computeStudentStats } from '../utils/scoring';

export interface SyncPayload {
  action: 'sync_student' | 'ping';
  timestamp: string;
  student?: {
    id: string;
    fullName: string;
    className: string;
    schoolName: string;
    totalAnswered: number;
    totalCorrect: number;
    accuracyPercent: number;
    totalPoints: number;
    completedStages: number;
    earnedBadges: number;
    totalStudySeconds: number;
    weakTopics: string;
    stageSummary: string;
    lastActiveAt: string;
  };
}

export interface SyncResponse {
  ok: boolean;
  message: string;
  syncedAt?: string;
}

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * TRIANGLE MASTER – Google Apps Script Web App
 * Dán mã này vào Extensions -> Apps Script trên Google Sheets của giáo viên.
 * Sau đó chọn Deploy -> New deployment -> Web app:
 *   - Execute as: Me
 *   - Who has access: Anyone
 * Dán URL Web App nhận được vào phần Cài đặt của Teacher Dashboard.
 */

const SHEET_NAME = 'KetQuaHocTap';

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      'Thời gian đồng bộ',
      'Mã học sinh',
      'Họ và tên',
      'Lớp',
      'Trường',
      'Số câu đã làm',
      'Số câu đúng',
      'Tỉ lệ đúng (%)',
      'Tổng điểm',
      'Số chặng hoàn thành',
      'Số huy hiệu',
      'Thời gian học (giây)',
      'Nội dung cần ôn tập',
      'Chi tiết 6 chặng'
    ]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'ping';
  return ContentService.createTextOutput(
    JSON.stringify({
      status: 'ok',
      service: 'TRIANGLE_MASTER_SHEETS',
      action: action,
      timestamp: new Date().toISOString()
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const data = JSON.parse(raw);

    if (data.action === 'ping') {
      return ContentService.createTextOutput(
        JSON.stringify({ status: 'ok', message: 'Kết nối thành công tới Google Sheets!' })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === 'sync_student' && data.student) {
      const s = data.student;
      const sheet = getOrCreateSheet();
      const rows = sheet.getDataRange().getValues();
      let existingRow = -1;

      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][1]) === String(s.id)) {
          existingRow = i + 1;
          break;
        }
      }

      const rowValues = [
        new Date().toLocaleString('vi-VN'),
        s.id,
        s.fullName,
        s.className,
        s.schoolName || '',
        s.totalAnswered,
        s.totalCorrect,
        s.accuracyPercent,
        s.totalPoints,
        s.completedStages,
        s.earnedBadges,
        s.totalStudySeconds,
        s.weakTopics || 'Không có',
        s.stageSummary || ''
      ];

      if (existingRow > 0) {
        sheet.getRange(existingRow, 1, 1, rowValues.length).setValues([rowValues]);
      } else {
        sheet.appendRow(rowValues);
      }

      return ContentService.createTextOutput(
        JSON.stringify({
          status: 'ok',
          message: 'Đã ghi nhận kết quả học sinh thành công.',
          syncedAt: new Date().toISOString()
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: 'Yêu cầu không hợp lệ.' })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}`;

export const PAYLOAD_EXAMPLE = `{
  "action": "sync_student",
  "timestamp": "2026-11-21T08:30:00.000Z",
  "student": {
    "id": "stu_1732177800_abc12",
    "fullName": "Nguyễn Minh Anh",
    "className": "7A1",
    "schoolName": "THCS Chu Văn An",
    "totalAnswered": 45,
    "totalCorrect": 41,
    "accuracyPercent": 91,
    "totalPoints": 560,
    "completedStages": 5,
    "earnedBadges": 5,
    "totalStudySeconds": 1420,
    "weakTopics": "Tam giác vuông - Cạnh huyền góc nhọn",
    "stageSummary": "C1:100% | C2:90% | C3:90% | C4:80% | C5:90% | C6:0%"
  }
}`;

export function buildStudentSyncPayload(student: StudentRecord): SyncPayload {
  const stats = computeStudentStats(student);
  const stageSummary = [1, 2, 3, 4, 5, 6]
    .map((id) => `C${id}:${student.stageProgress[id]?.bestAccuracy ?? 0}%`)
    .join(' | ');

  return {
    action: 'sync_student',
    timestamp: new Date().toISOString(),
    student: {
      id: student.id,
      fullName: student.fullName,
      className: student.className,
      schoolName: student.schoolName,
      totalAnswered: stats.totalAnswered,
      totalCorrect: stats.totalCorrect,
      accuracyPercent: stats.accuracy,
      totalPoints: student.totalPoints,
      completedStages: stats.completedStages,
      earnedBadges: student.earnedBadgeIds.length,
      totalStudySeconds: student.totalStudySeconds,
      weakTopics: stats.weakTopics.slice(0, 3).map((w) => w.tag).join(', '),
      stageSummary,
      lastActiveAt: student.lastActiveAt,
    },
  };
}

function isValidAppsScriptUrl(url: string): boolean {
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'https:' && parsed.hostname.includes('script.google.com');
  } catch {
    return false;
  }
}

export class GoogleSheetsService {
  static async testConnection(url: string): Promise<SyncResponse> {
    const trimmed = url.trim();
    if (!trimmed) {
      return { ok: false, message: 'Vui lòng nhập URL Google Apps Script Web App trước khi kiểm tra.' };
    }
    if (!isValidAppsScriptUrl(trimmed)) {
      return {
        ok: false,
        message: 'URL không hợp lệ. URL cần bắt đầu bằng https://script.google.com/macros/s/.../exec',
      };
    }

    try {
      const testUrl = `${trimmed}${trimmed.includes('?') ? '&' : '?'}action=ping`;
      const res = await fetch(testUrl, {
        method: 'GET',
        mode: 'cors',
        redirect: 'follow',
      });

      if (!res.ok) {
        return {
          ok: false,
          message: `Máy chủ phản hồi lỗi HTTP ${res.status}. Kiểm tra lại quyền truy cập Web App (Anyone).`,
        };
      }

      const json = await res.json();
      if (json && json.status === 'ok') {
        return {
          ok: true,
          message: 'Kết nối thành công và đã nhận xác thực từ Google Apps Script!',
          syncedAt: json.timestamp || new Date().toISOString(),
        };
      }

      return {
        ok: false,
        message: 'Phản hồi từ dịch vụ không đúng định dạng xác thực { status: "ok" }.',
      };
    } catch {
      return {
        ok: false,
        message:
          'Không thể xác thực kết nối (lỗi mạng hoặc CORS). Kiểm tra lại URL Web App đã triển khai chế độ "Anyone" chưa. Ứng dụng vẫn tiếp tục lưu cục bộ an toàn.',
      };
    }
  }

  static async syncStudent(url: string, student: StudentRecord): Promise<SyncResponse> {
    const trimmed = url.trim();
    if (!trimmed || !isValidAppsScriptUrl(trimmed)) {
      return {
        ok: false,
        message: 'Chưa cấu hình URL Google Apps Script hợp lệ. Dữ liệu chỉ đang lưu trên trình duyệt.',
      };
    }

    const payload = buildStudentSyncPayload(student);

    try {
      const res = await fetch(trimmed, {
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        return {
          ok: false,
          message: `Đồng bộ thất bại (HTTP ${res.status}). Dữ liệu vẫn được giữ nguyên cục bộ.`,
        };
      }

      const json = await res.json();
      if (json && json.status === 'ok') {
        return {
          ok: true,
          message: json.message || 'Đã đồng bộ dữ liệu lên Google Sheets thành công.',
          syncedAt: json.syncedAt || new Date().toISOString(),
        };
      }

      return {
        ok: false,
        message: json?.message || 'Google Sheets chưa xác nhận ghi nhận dữ liệu.',
      };
    } catch {
      return {
        ok: false,
        message:
          'Không nhận được xác nhận từ Google Sheets (mất kết nối hoặc bị chặn CORS). Không báo đồng bộ giả; dữ liệu vẫn an toàn trên máy.',
      };
    }
  }

  static async syncAllStudents(
    url: string,
    students: StudentRecord[]
  ): Promise<{ successCount: number; failCount: number; message: string }> {
    if (students.length === 0) {
      return { successCount: 0, failCount: 0, message: 'Chưa có dữ liệu học sinh để đồng bộ.' };
    }
    let successCount = 0;
    let failCount = 0;
    let lastError = '';

    for (const student of students) {
      const res = await this.syncStudent(url, student);
      if (res.ok) {
        successCount += 1;
      } else {
        failCount += 1;
        lastError = res.message;
      }
    }

    if (successCount === students.length) {
      return {
        successCount,
        failCount,
        message: `Đã đồng bộ thành công ${successCount}/${students.length} hồ sơ học sinh lên Google Sheets.`,
      };
    }

    return {
      successCount,
      failCount,
      message: `Đồng bộ thành công ${successCount}/${students.length}. Lỗi: ${lastError}`,
    };
  }
}

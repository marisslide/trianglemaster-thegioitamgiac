import { Question, QuestionBankAudit, ValidationIssue } from '../types';

const FORBIDDEN_CONGRUENCE_PROOFS = [
  'trường hợp g.g.g',
  '(g.g.g)',
  'trường hợp c.c.g',
  '(c.c.g)',
];

function checkTriangleInequality(sides: number[]): boolean {
  if (sides.length !== 3) return false;
  const [a, b, c] = sides;
  if (a <= 0 || b <= 0 || c <= 0) return false;
  return a + b > c && b + c > a && a + c > b;
}

function checkAngleSum(angles: number[]): boolean {
  if (angles.length !== 3) return false;
  if (angles.some((deg) => deg <= 0 || deg >= 180)) return false;
  const sum = angles.reduce((acc, val) => acc + val, 0);
  return Math.abs(sum - 180) < 1e-6;
}

export function validateQuestion(q: Question): string[] {
  const errors: string[] = [];

  if (!q.id || !q.id.trim()) errors.push('Thiếu mã câu hỏi (id).');
  if (!q.stageId || q.stageId < 1 || q.stageId > 6) errors.push('stageId không hợp lệ (1-6).');
  if (!q.question || !q.question.trim()) errors.push('Nội dung câu hỏi rỗng.');
  if (!q.explanation || !q.explanation.trim()) errors.push('Thiếu lời giải thích.');
  if (!q.hint || !q.hint.trim()) errors.push('Thiếu gợi ý kiến thức.');
  if (!q.knowledgeTag || !q.knowledgeTag.trim()) errors.push('Thiếu nhãn kiến thức.');
  if (typeof q.score !== 'number' || q.score <= 0) errors.push('Điểm số câu hỏi phải > 0.');

  // Check question-type specific structural integrity
  if (q.questionType === 'multiple_choice' || q.questionType === 'true_false') {
    if (!q.options || q.options.length < 2) {
      errors.push('Câu trắc nghiệm phải có ít nhất 2 lựa chọn.');
    } else {
      const uniqueOptions = new Set(q.options);
      if (uniqueOptions.size !== q.options.length) {
        errors.push('Có đáp án bị trùng lặp trong danh sách lựa chọn.');
      }
      if (typeof q.correctAnswer !== 'string' || !q.options.includes(q.correctAnswer)) {
        errors.push('Đáp án đúng không khớp duy nhất một lựa chọn trong options.');
      }
    }
  } else if (q.questionType === 'fill_blank') {
    if (typeof q.correctAnswer !== 'number' || !Number.isFinite(q.correctAnswer)) {
      errors.push('Câu điền số phải có đáp án số xác định (finite number).');
    }
  } else if (q.questionType === 'matching') {
    if (!q.matchingPairs || q.matchingPairs.length < 2) {
      errors.push('Câu ghép cặp phải có ít nhất 2 cặp.');
    } else {
      const leftSet = new Set(q.matchingPairs.map((p) => p.left));
      const rightSet = new Set(q.matchingPairs.map((p) => p.right));
      if (leftSet.size !== q.matchingPairs.length || rightSet.size !== q.matchingPairs.length) {
        errors.push('Các phần tử ghép cặp phải duy nhất.');
      }
    }
  } else if (q.questionType === 'ordering') {
    if (!q.orderingSteps || q.orderingSteps.length < 3) {
      errors.push('Câu sắp xếp chứng minh phải có ít nhất 3 bước.');
    }
    if (!Array.isArray(q.correctAnswer)) {
      errors.push('Đáp án câu sắp xếp phải là mảng thứ tự ID.');
    } else if (q.orderingSteps) {
      const stepIds = new Set(q.orderingSteps.map((s) => s.id));
      const ansSet = new Set(q.correctAnswer);
      if (
        q.correctAnswer.length !== q.orderingSteps.length ||
        ansSet.size !== stepIds.size ||
        !q.correctAnswer.every((id) => stepIds.has(id))
      ) {
        errors.push('Thứ tự đáp án sắp xếp không khớp tập ID các bước.');
      }
    }
  }

  // Mathematical correctness guardrails
  if (q.mathCheck?.triangleAngles) {
    for (const tri of q.mathCheck.triangleAngles) {
      if (!checkAngleSum(tri)) {
        errors.push(`Tổng ba góc [${tri.join(', ')}] không bằng 180° hoặc chứa góc không hợp lệ.`);
      }
    }
  }

  if (q.mathCheck?.triangleSides) {
    for (const sides of q.mathCheck.triangleSides) {
      if (!checkTriangleInequality(sides)) {
        errors.push(`Độ dài ba cạnh [${sides.join(', ')}] vi phạm bất đẳng thức tam giác.`);
      }
    }
  }

  if (q.mathCheck?.requiresRightAngleMarker && q.diagramData) {
    const hasRightAngle = (q.diagramData.angles ?? []).some((a) => a.isRightAngle);
    if (!hasRightAngle) {
      errors.push('Hình tam giác vuông bắt buộc phải có kí hiệu góc vuông trên SVG.');
    }
  }

  // Verify diagram references point IDs that actually exist
  if (q.diagramData) {
    const pointIds = new Set(q.diagramData.points.map((p) => p.id));
    for (const seg of q.diagramData.segments) {
      if (!pointIds.has(seg.from) || !pointIds.has(seg.to)) {
        errors.push(`Đoạn thẳng (${seg.from}-${seg.to}) tham chiếu đỉnh không tồn tại.`);
      }
    }
    for (const ang of q.diagramData.angles ?? []) {
      if (!pointIds.has(ang.vertex) || !pointIds.has(ang.from) || !pointIds.has(ang.to)) {
        errors.push(`Góc tại đỉnh ${ang.vertex} tham chiếu đỉnh không tồn tại.`);
      }
    }
  }

  // Guard against false congruence rules appearing as the accepted correctAnswer
  if (typeof q.correctAnswer === 'string') {
    const lowerAns = q.correctAnswer.toLowerCase();
    for (const forbidden of FORBIDDEN_CONGRUENCE_PROOFS) {
      if (lowerAns.includes(forbidden) && !lowerAns.includes('không') && !lowerAns.includes('sai')) {
        errors.push(`Đáp án chứa quy tắc bằng nhau không hợp lệ: ${forbidden}`);
      }
    }
  }

  return errors;
}

export function validateQuestionBank(questions: Question[]): {
  validQuestions: Question[];
  audit: QuestionBankAudit;
} {
  const seenIds = new Set<string>();
  const validQuestions: Question[] = [];
  const issues: ValidationIssue[] = [];

  for (const q of questions) {
    const qErrors = validateQuestion(q);
    if (seenIds.has(q.id)) {
      qErrors.push(`Trùng mã câu hỏi: ${q.id}`);
    }
    seenIds.add(q.id);

    if (qErrors.length > 0) {
      for (const reason of qErrors) {
        issues.push({ questionId: q.id, stageId: q.stageId, reason });
      }
    } else {
      validQuestions.push(q);
    }
  }

  return {
    validQuestions,
    audit: {
      totalChecked: questions.length,
      validCount: validQuestions.length,
      invalidCount: questions.length - validQuestions.length,
      issues,
    },
  };
}

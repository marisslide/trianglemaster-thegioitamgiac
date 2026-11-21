import { Question, QuestionBankAudit } from '../../types';
import { validateQuestionBank } from '../../utils/questionValidator';
import { STAGE1_QUESTIONS } from './stage1Questions';
import { STAGE2_QUESTIONS } from './stage2Questions';
import { STAGE3_QUESTIONS } from './stage3Questions';
import { STAGE4_QUESTIONS } from './stage4Questions';
import { STAGE5_QUESTIONS } from './stage5Questions';
import { STAGE6_QUESTIONS } from './stage6Questions';

export const RAW_QUESTION_BANK: Question[] = [
  ...STAGE1_QUESTIONS,
  ...STAGE2_QUESTIONS,
  ...STAGE3_QUESTIONS,
  ...STAGE4_QUESTIONS,
  ...STAGE5_QUESTIONS,
  ...STAGE6_QUESTIONS,
];

const validationResult = validateQuestionBank(RAW_QUESTION_BANK);

export const VALIDATED_QUESTIONS: Question[] = validationResult.validQuestions;
export const QUESTION_BANK_AUDIT: QuestionBankAudit = validationResult.audit;

export function getValidatedQuestionsForStage(stageId: number): {
  questions: Question[];
  audit: QuestionBankAudit;
} {
  const stageRaw = RAW_QUESTION_BANK.filter((q) => q.stageId === stageId);
  const res = validateQuestionBank(stageRaw);
  return {
    questions: res.validQuestions,
    audit: res.audit,
  };
}

export function getQuestionById(id: string): Question | undefined {
  return VALIDATED_QUESTIONS.find((q) => q.id === id);
}

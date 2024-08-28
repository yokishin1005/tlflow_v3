import { z } from 'zod';

// カスタムエラーメッセージ
const errorMessages = {
  required: '必須項目です',
  invalidDate: '無効な日付です',
  invalidEmail: '有効なメールアドレスを入力してください',
  minLength: (field, length) => `${field}は${length}文字以上で入力してください`,
  maxLength: (field, length) => `${field}は${length}文字以下で入力してください`,
  numberRange: (field, min, max) => `${field}は${min}から${max}の間で入力してください`,
};

// 日付が現在より前かチェックする関数
const isPastDate = (date) => {
  return date <= new Date();
};

export const employeeSchema = z.object({
  employee_name: z.string()
    .min(1, { message: errorMessages.required })
    .max(50, { message: errorMessages.maxLength('氏名', 50) }),

  birthdate: z.date()
    .refine(isPastDate, { message: '生年月日は現在より前の日付である必要があります' }),

  gender: z.enum(['男性', '女性', 'その他'], {
    errorMap: () => ({ message: '性別を選択してください' }),
  }),

  academic_background: z.string()
    .min(1, { message: errorMessages.required })
    .max(100, { message: errorMessages.maxLength('学歴', 100) }),

  hire_date: z.date()
    .refine(date => date >= new Date(), { message: '入社日は現在以降の日付である必要があります' }),

  recruitment_type: z.enum(['新卒', '中途'], {
    errorMap: () => ({ message: '採用区分を選択してください' }),
  }),

  grade_id: z.number().positive({ message: 'グレードを選択してください' }),

  department_id: z.number().positive({ message: '部署を選択してください' }),
  
  jobpost_id: z.number().positive({ message: 'ポジションを選択してください' }),

  neuroticism_score: z.number()
    .min(0, { message: errorMessages.numberRange('神経症傾向スコア', 0, 100) })
    .max(100, { message: errorMessages.numberRange('神経症傾向スコア', 0, 100) }),

  extraversion_score: z.number()
    .min(0, { message: errorMessages.numberRange('外向性スコア', 0, 100) })
    .max(100, { message: errorMessages.numberRange('外向性スコア', 0, 100) }),

  openness_score: z.number()
    .min(0, { message: errorMessages.numberRange('開放性スコア', 0, 100) })
    .max(100, { message: errorMessages.numberRange('開放性スコア', 0, 100) }),

  agreeableness_score: z.number()
    .min(0, { message: errorMessages.numberRange('協調性スコア', 0, 100) })
    .max(100, { message: errorMessages.numberRange('協調性スコア', 0, 100) }),

  conscientiousness_score: z.number()
    .min(0, { message: errorMessages.numberRange('誠実性スコア', 0, 100) })
    .max(100, { message: errorMessages.numberRange('誠実性スコア', 0, 100) }),

  password: z.string()
    .min(8, { message: errorMessages.minLength('パスワード', 8) })
    .max(100, { message: errorMessages.maxLength('パスワード', 100) })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
      message: 'パスワードは少なくとも1つの大文字、小文字、数字、特殊文字を含む必要があります',
    }),

});
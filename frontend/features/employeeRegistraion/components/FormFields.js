import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import InputField from '../../../common/components/InputField';
import SelectField from '../../../common/components/SelectField';
import FileUpload from '../../../common/components/FileUpload';

const FormFields = ({
  grades,
  departments,
  jobPosts,
  fileStatus,
  onDrop
}) => {
  const { control, formState: { errors } } = useFormContext();

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <Controller
          name="employee_name"
          control={control}
          render={({ field }) => (
            <InputField
              label="氏名"
              {...field}
              error={errors.employee_name?.message}
            />
          )}
        />

        <Controller
          name="birthdate"
          control={control}
          render={({ field }) => (
            <div>
              <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700">
                生年月日
              </label>
              <DatePicker
                selected={field.value}
                onChange={(date) => field.onChange(date)}
                dateFormat="yyyy/MM/dd"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
              {errors.birthdate && <p className="mt-2 text-sm text-red-600">{errors.birthdate.message}</p>}
            </div>
          )}
        />

        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <SelectField
              label="性別"
              {...field}
              options={[
                { value: "", label: "選択してください" },
                { value: "男性", label: "男性" },
                { value: "女性", label: "女性" },
                { value: "その他", label: "その他" },
              ]}
              error={errors.gender?.message}
            />
          )}
        />

        <Controller
          name="academic_background"
          control={control}
          render={({ field }) => (
            <InputField
              label="学歴"
              {...field}
              error={errors.academic_background?.message}
            />
          )}
        />

        <Controller
          name="hire_date"
          control={control}
          render={({ field }) => (
            <div>
              <label htmlFor="hire_date" className="block text-sm font-medium text-gray-700">
                入社日
              </label>
              <DatePicker
                selected={field.value}
                onChange={(date) => field.onChange(date)}
                dateFormat="yyyy/MM/dd"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
              {errors.hire_date && <p className="mt-2 text-sm text-red-600">{errors.hire_date.message}</p>}
            </div>
          )}
        />

        <Controller
          name="recruitment_type"
          control={control}
          render={({ field }) => (
            <SelectField
              label="採用区分"
              {...field}
              options={[
                { value: "", label: "選択してください" },
                { value: "新卒", label: "新卒" },
                { value: "中途", label: "中途" },
              ]}
              error={errors.recruitment_type?.message}
            />
          )}
        />

        <Controller
          name="grade_name"
          control={control}
          render={({ field }) => (
            <SelectField
              label="グレード"
              {...field}
              options={[
                { value: "", label: "選択してください" },
                ...grades.map((grade) => ({
                  value: grade.grade_name,
                  label: grade.grade_name,
                })),
              ]}
              error={errors.grade_name?.message}
            />
          )}
        />

        <Controller
          name="department_name"
          control={control}
          render={({ field }) => (
            <SelectField
              label="部署"
              {...field}
              options={[
                { value: "", label: "選択してください" },
                ...departments.map((department) => ({
                  value: department.department_name,
                  label: department.department_name,
                })),
              ]}
              error={errors.department_name?.message}
            />
          )}
        />

        <Controller
          name="job_title"
          control={control}
          render={({ field }) => (
            <SelectField
              label="ポジション"
              {...field}
              options={[
                { value: "", label: "選択してください" },
                ...(jobPosts ? jobPosts.map((jobPost) => ({
                  value: jobPost.job_title,
                  label: jobPost.job_title,
                })) : [])
              ]}
              error={errors.job_title?.message}
            />
          )}
        />

        <Controller
          name="neuroticism_score"
          control={control}
          render={({ field }) => (
            <InputField
              label="神経症傾向スコア"
              type="number"
              {...field}
              error={errors.neuroticism_score?.message}
            />
          )}
        />

        <Controller
          name="extraversion_score"
          control={control}
          render={({ field }) => (
            <InputField
              label="外向性スコア"
              type="number"
              {...field}
              error={errors.extraversion_score?.message}
            />
          )}
        />

        <Controller
          name="openness_score"
          control={control}
          render={({ field }) => (
            <InputField
              label="経験への開放性スコア"
              type="number"
              {...field}
              error={errors.openness_score?.message}
            />
          )}
        />

        <Controller
          name="agreeableness_score"
          control={control}
          render={({ field }) => (
            <InputField
              label="協調性スコア"
              type="number"
              {...field}
              error={errors.agreeableness_score?.message}
            />
          )}
        />

        <Controller
          name="conscientiousness_score"
          control={control}
          render={({ field }) => (
            <InputField
              label="誠実性スコア"
              type="number"
              {...field}
              error={errors.conscientiousness_score?.message}
            />
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <InputField
              label="パスワード"
              type="password"
              {...field}
              error={errors.password?.message}
            />
          )}
        />
      </div>

      <div className="space-y-6">
        <FileUpload
          label="履歴書"
          fileType="rirekisho"
          onDrop={onDrop}
          fileStatus={fileStatus.rirekisho}
          acceptedFileTypes={{
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/plain': ['.txt']
          }}
        />

        <FileUpload
          label="職務経歴書"
          fileType="resume"
          onDrop={onDrop}
          fileStatus={fileStatus.resume}
          acceptedFileTypes={{
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/plain': ['.txt']
          }}
        />

        <FileUpload
          label="性格診断結果"
          fileType="bigfive"
          onDrop={onDrop}
          fileStatus={fileStatus.bigfive}
          acceptedFileTypes={{
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/plain': ['.txt']
          }}
        />

        <FileUpload
          label="プロフィール写真"
          fileType="picture"
          onDrop={onDrop}
          fileStatus={fileStatus.picture}
          acceptedFileTypes={{
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'image/gif': ['.gif']
          }}
        />
      </div>
    </div>
  );
};

export default FormFields;
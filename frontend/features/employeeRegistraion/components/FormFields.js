import React, { useState, useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import BirthdayPicker from '../../../common/components/BirthdayPicker'
import "react-datepicker/dist/react-datepicker.css";
import InputField from '../../../common/components/InputField';
import SelectField from '../../../common/components/SelectField';
import FileUpload from '../../../common/components/FileUpload';
import { getDepartments, getJobPostsByDepartment } from '../../../utils/api';
import HiredatePicker from '../../../common/components/HiredatePicker';
import 'react-datepicker/dist/react-datepicker.css';

const FormFields = ({
  grades,
  fileStatus,
  onDrop
}) => {
  const { control, formState: { errors }, watch, setValue } = useFormContext();
  const [departments, setDepartments] = useState([]);
  const [jobPosts, setJobPosts] = useState([]);

  const selectedDepartmentId = watch('department_id');

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const fetchedDepartments = await getDepartments();
        setDepartments(fetchedDepartments);
      } catch (error) {
        console.error('Failed to fetch departments:', error);
        // ここでエラー処理を行う（例：トースト通知を表示する）
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchJobPosts = async () => {
      if (selectedDepartmentId) {
        try {
          const fetchedJobPosts = await getJobPostsByDepartment(selectedDepartmentId);
          setJobPosts(fetchedJobPosts);
        } catch (error) {
          console.error('Failed to fetch job posts:', error);
          // ここでエラー処理を行う（例：トースト通知を表示する）
        }
      } else {
        setJobPosts([]);
      }
    };
    fetchJobPosts();
  }, [selectedDepartmentId]);

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
            <BirthdayPicker
              value={field.value}
              onChange={(date) => field.onChange(date)}
              error={errors.birthdate?.message}
            />
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
            <HiredatePicker
              value={field.value}
              onChange={(date) => field.onChange(date)}
              error={errors.hire_date?.message}
            />
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
          name="grade_id"
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
          name="department_id"
          control={control}
          render={({ field }) => (
            <SelectField
              label="部署"
              {...field}
              options={[
                { value: "", label: "選択してください" },
                ...departments.map((department) => ({
                  value: department.department_id,
                  label: department.department_name,
                })),
              ]}
              error={errors.department_id?.message}
            />
          )}
        />

        <Controller
          name="jobpost_id"
          control={control}
          render={({ field }) => (
            <SelectField
              label="ポジション"
              {...field}
              options={[
                { value: "", label: "選択してください" },
                ...jobPosts.map((jobPost) => ({
                  value: jobPost.jobpost_id,
                  label: jobPost.job_title,
                }))
              ]}
              error={errors.jobpost_id?.message}
              disabled={!selectedDepartmentId}
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
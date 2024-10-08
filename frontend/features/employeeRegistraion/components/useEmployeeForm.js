import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getGrades, getDepartments, processResume, processBigFive, getJobPostsByDepartment } from '../../../utils/api';
import { useDropzone } from 'react-dropzone';

// Zodスキーマの定義
const schema = z.object({
  employee_name: z.string().min(1, { message: "名前は必須です" }),
  birthdate: z.date().nullable(),
  gender: z.string().min(1, { message: "性別を選択してください" }),
  academic_background: z.string().min(1, { message: "学歴は必須です" }),
  hire_date: z.date().nullable(),
  recruitment_type: z.string().min(1, { message: "採用区分を選択してください" }),
  grade_name: z.string().min(1, { message: "等級を選択してください" }),
  department_id: z.string().min(1, { message: "部門を選択してください" }),
  job_title: z.string().min(1, { message: "ポジションを選択してください" }),
  password: z.string().min(8, { message: "パスワードは8文字以上である必要があります" }),
});

const useEmployeeForm = (onSubmit) => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      hire_date: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    }
  });

  const [grades, setGrades] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [jobPosts, setJobPosts] = useState([]);
  const [fileStatus, setFileStatus] = useState({
    resume: { status: '未アップロード', data: null },
    bigfive: { status: '未アップロード', data: null },
    picture: { status: '未アップロード', data: null },
  });

  const selectedDepartmentId = watch('department_id');

  useEffect(() => {
    async function fetchData() {
      try {
        const [gradesData, departmentsData] = await Promise.all([
          getGrades(),
          getDepartments(),
        ]);
        setGrades(gradesData);
        setDepartments(departmentsData);
      } catch (error) {
        console.error('データの取得に失敗しました。', error);
        toast.error('データの取得に失敗しました。');
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchJobPosts() {
      if (selectedDepartmentId) {
        try {
          const jobPostsData = await getJobPostsByDepartment(selectedDepartmentId);
          setJobPosts(jobPostsData);
        } catch (error) {
          console.error('ジョブポストの取得に失敗しました。', error);
          toast.error('ジョブポストの取得に失敗しました。');
        }
      } else {
        setJobPosts([]);
      }
    }
    fetchJobPosts();
  }, [selectedDepartmentId]);

  const processFile = async (file, fileType) => {
    try {
      let processedData;
      switch (fileType) {
        case 'resume':
          processedData = await processResume(file);
          break;
        case 'bigfive':
          processedData = await processBigFive(file);
          break;
        default:
          return null;
      }
      return processedData;
    } catch (error) {
      console.error(`Error processing ${fileType}:`, error);
      return null;
    }
  };

  const onDrop = useCallback(async (acceptedFiles, fileType) => {
    const file = acceptedFiles[0];
    setValue(fileType, file);
    setFileStatus(prevStatus => ({
      ...prevStatus,
      [fileType]: { status: '処理中', data: null }
    }));

    if (['resume', 'bigfive'].includes(fileType)) {
      const processedData = await processFile(file, fileType);
      if (processedData) {
        setFileStatus(prevStatus => ({
          ...prevStatus,
          [fileType]: { status: '完了', data: processedData }
        }));
      } else {
        setFileStatus(prevStatus => ({
          ...prevStatus,
          [fileType]: { status: 'エラー', data: null }
        }));
      }
    } else {
      setFileStatus(prevStatus => ({
        ...prevStatus,
        [fileType]: { status: '完了', data: null }
      }));
    }
  }, [setValue]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => onDrop(acceptedFiles, 'picture'),
    accept: 'image/*',
    maxFiles: 1,
  });

  const onSubmitForm = async (data) => {
    try {
      await onSubmit(data);
      toast.success('従業員情報が正常に登録されました。');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('従業員情報の登録に失敗しました。');
    }
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmitForm),
    errors,
    watch,
    setValue,
    grades,
    departments,
    jobPosts,
    fileStatus,
    onDrop,
    getRootProps,
    getInputProps,
  };
};

export default useEmployeeForm;
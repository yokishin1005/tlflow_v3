import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { getGrades, getDepartments, processRirekisho, processResume, processBigFive, registerEmployee } from '../utils/api';
import { FiUpload, FiCheck, FiX } from 'react-icons/fi';

export default function EmployeeForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    employee_name: '',
    birthdate: null,
    gender: '',
    academic_background: '',
    hire_date: null,
    recruitment_type: '',
    grade_name: '',
    grade_id: null,
    department_name: '',
    department_id: null,
    rirekisho: null,
    resume: null,
    bigfive: null,
    neuroticism_score: 0,
    extraversion_score: 0,
    openness_score: 0,
    agreeableness_score: 0,
    conscientiousness_score: 0,
    password: '',
    picture: null,
  });

  const [grades, setGrades] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [fileStatus, setFileStatus] = useState({
    rirekisho: { status: '未アップロード', data: null },
    resume: { status: '未アップロード', data: null },
    bigfive: { status: '未アップロード', data: null },
    picture: { status: '未アップロード', data: null },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [gradesData, departmentsData] = await Promise.all([
          getGrades(),
          getDepartments()
        ]);
        setGrades(gradesData);
        setDepartments(departmentsData);

        const today = new Date();
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        setFormData(prevData => ({ ...prevData, hire_date: nextMonth }));
      } catch (error) {
        setError('データの取得に失敗しました。');
      }
    }
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['neuroticism_score', 'extraversion_score', 'openness_score', 'agreeableness_score', 'conscientiousness_score'].includes(name)) {
      setFormData(prevData => ({ ...prevData, [name]: parseInt(value, 10) }));
    } else {
      setFormData(prevData => ({ ...prevData, [name]: value }));
    }
  };

  const handleDateChange = (date, name) => {
    setFormData(prevData => ({ ...prevData, [name]: date }));
  };

  const handleGradeChange = (e) => {
    const selectedGrade = grades.find(grade => grade.grade_name === e.target.value);
    setFormData(prevData => ({
      ...prevData,
      grade_name: e.target.value,
      grade_id: selectedGrade ? selectedGrade.grade_id : null
    }));
  };

  const handleDepartmentChange = (e) => {
    const selectedDepartment = departments.find(department => department.department_name === e.target.value);
    setFormData(prevData => ({
      ...prevData,
      department_name: e.target.value,
      department_id: selectedDepartment ? selectedDepartment.department_id : null
    }));
  };

  const processFile = async (file, fileType) => {
    let processedData;
    try {
      switch (fileType) {
        case 'rirekisho':
          processedData = await processRirekisho(file);
          break;
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
      setError(`${fileType}の処理中にエラーが発生しました。`);
      return null;
    }
  };

  const onDrop = useCallback(async (acceptedFiles, fileType) => {
    const file = acceptedFiles[0];
    setFormData(prevData => ({ ...prevData, [fileType]: file }));
    setFileStatus(prevStatus => ({
      ...prevStatus,
      [fileType]: { status: '処理中', data: null }
    }));

    if (['rirekisho', 'resume', 'bigfive'].includes(fileType)) {
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
  }, []);

  const { getRootProps: getRirekishoProps, getInputProps: getRirekishoInputProps } = useDropzone({
    onDrop: files => onDrop(files, 'rirekisho'),
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1
  });

  const { getRootProps: getResumeProps, getInputProps: getResumeInputProps } = useDropzone({
    onDrop: files => onDrop(files, 'resume'),
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1
  });

  const { getRootProps: getBigFiveProps, getInputProps: getBigFiveInputProps } = useDropzone({
    onDrop: files => onDrop(files, 'bigfive'),
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1
  });

  const { getRootProps: getPictureProps, getInputProps: getPictureInputProps } = useDropzone({
    onDrop: files => onDrop(files, 'picture'),
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif']
    },
    maxFiles: 1
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await registerEmployee(formData);
      onSubmit(response);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error.response?.data?.detail || '社員登録に失敗しました。再度お試しください。';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderFileUpload = (type, getRootProps, getInputProps, label) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div
        {...getRootProps()}
        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-gray-400 transition duration-150 ease-in-out ${
          fileStatus[type].status === '完了' ? 'bg-green-50' : fileStatus[type].status === 'エラー' ? 'bg-red-50' : ''
        }`}
      >
        <div className="space-y-1 text-center">
          {fileStatus[type].status === '未アップロード' && <FiUpload className="mx-auto h-12 w-12 text-gray-400" />}
          {fileStatus[type].status === '完了' && <FiCheck className="mx-auto h-12 w-12 text-green-500" />}
          {fileStatus[type].status === 'エラー' && <FiX className="mx-auto h-12 w-12 text-red-500" />}
          <div className="flex text-sm text-gray-600">
            <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
              <span>{fileStatus[type].status === '未アップロード' ? 'ファイルを選択' : 'ファイルを変更'}</span>
              <input {...getInputProps()} className="sr-only" />
            </label>
            <p className="pl-1">またはドラッグ＆ドロップ</p>
          </div>
          <p className="text-xs text-gray-500">
            {type === 'picture' ? 'PNG, JPG, GIF up to 10MB' : 'PDF, DOC, DOCX, TXT up to 10MB'}
          </p>
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-500">ステータス: {fileStatus[type].status}</p>
      {fileStatus[type].data && (
        <div className="mt-2 p-2 bg-gray-100 rounded-md">
          <h4 className="text-sm font-medium text-gray-700">ファイル内容:</h4>
          <pre className="text-xs text-gray-600 whitespace-pre-wrap">{JSON.stringify(fileStatus[type].data, null, 2)}</pre>
        </div>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200">
      <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            従業員情報
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            新規従業員の基本情報を入力してください。
          </p>
        </div>

        <div className="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
          <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
            <label htmlFor="employee_name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              氏名
            </label>
            <div className="mt-1 sm:mt-0 sm:col-span-2">
              <input
                type="text"
                name="employee_name"
                id="employee_name"
                value={formData.employee_name}
                onChange={handleChange}
                required
                className="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
            <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              生年月日
            </label>
            <div className="mt-1 sm:mt-0 sm:col-span-2">
              <DatePicker
                selected={formData.birthdate}
                onChange={(date) => handleDateChange(date, 'birthdate')}
                dateFormat="yyyy/MM/dd"
                className="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                required
              />
            </div>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              性別
            </label>
            <div className="mt-1 sm:mt-0 sm:col-span-2">
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="max-w-lg block focus:ring-indigo-500 focus:border-indigo-500 w-full shadow-sm sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
              >
                <option value="">選択してください</option>
                <option value="男性">男性</option>
                <option value="女性">女性</option>
                <option value="その他">その他</option>
              </select>
            </div>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
            <label htmlFor="academic_background" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              学歴
            </label>
            <div className="mt-1 sm:mt-0 sm:col-span-2">
              <input
                type="text"
                name="academic_background"
                id="academic_background"
                value={formData.academic_background}
                onChange={handleChange}
                required
                className="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
            <label htmlFor="hire_date" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              入社日
            </label>
            <div className="mt-1 sm:mt-0 sm:col-span-2">
              <DatePicker
                selected={formData.hire_date}
                onChange={(date) => handleDateChange(date, 'hire_date')}
                dateFormat="yyyy/MM/dd"
                filterDate={(date) => date.getDate() === 1}
                className="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                required
              />
            </div>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
            <label htmlFor="recruitment_type" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              採用区分
            </label>
            <div className="mt-1 sm:mt-0 sm:col-span-2">
              <select
                id="recruitment_type"
                name="recruitment_type"
                value={formData.recruitment_type}
                onChange={handleChange}
                required
                className="max-w-lg block focus:ring-indigo-500 focus:border-indigo-500 w-full shadow-sm sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
              >
                <option value="">選択してください</option>
                <option value="新卒">新卒</option>
                <option value="中途">中途</option>
              </select>
            </div>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
            <label htmlFor="grade_name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              グレード
            </label>
            <div className="mt-1 sm:mt-0 sm:col-span-2">
              <select
                id="grade_name"
                name="grade_name"
                value={formData.grade_name}
                onChange={handleGradeChange}
                required
                className="max-w-lg block focus:ring-indigo-500 focus:border-indigo-500 w-full shadow-sm sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
              >
                <option value="">選択してください</option>
                {grades.map((grade) => (
                  <option key={grade.grade_id} value={grade.grade_name}>
                    {grade.grade_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
            <label htmlFor="department_name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              部署
            </label>
            <div className="mt-1 sm:mt-0 sm:col-span-2">
              <select
                id="department_name"
                name="department_name"
                value={formData.department_name}
                onChange={handleDepartmentChange}
                required
                className="max-w-lg block focus:ring-indigo-500 focus:border-indigo-500 w-full shadow-sm sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
              >
                <option value="">選択してください</option>
                {departments.map((department) => (
                  <option key={department.department_id} value={department.department_name}>
                    {department.department_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
            <label htmlFor="neuroticism_score" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              神経症傾向スコア
            </label>
            <div className="mt-1 sm:mt-0 sm:col-span-2">
              <input
                type="number"
                name="neuroticism_score"
                id="neuroticism_score"
                value={formData.neuroticism_score}
                onChange={handleChange}
                required
                className="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
            <label htmlFor="extraversion_score" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              外向性スコア
            </label>
            <div className="mt-1 sm:mt-0 sm:col-span-2">
              <input
                type="number"
                name="extraversion_score"
                id="extraversion_score"
                value={formData.extraversion_score}
                onChange={handleChange}
                required
                className="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
            <label htmlFor="openness_score" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              経験への開放性スコア
            </label>
            <div className="mt-1 sm:mt-0 sm:col-span-2">
              <input
                type="number"
                name="openness_score"
                id="openness_score"
                value={formData.openness_score}
                onChange={handleChange}
                required
                className="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
            <label htmlFor="agreeableness_score" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              協調性スコア
            </label>
            <div className="mt-1 sm:mt-0 sm:col-span-2">
              <input
                type="number"
                name="agreeableness_score"
                id="agreeableness_score"
                value={formData.agreeableness_score}
                onChange={handleChange}
                required
                className="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
            <label htmlFor="conscientiousness_score" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              誠実性スコア
            </label>
            <div className="mt-1 sm:mt-0 sm:col-span-2">
              <input
                type="number"
                name="conscientiousness_score"
                id="conscientiousness_score"
                value={formData.conscientiousness_score}
                onChange={handleChange}
                required
                className="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              パスワード
            </label>
            <div className="mt-1 sm:mt-0 sm:col-span-2">
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          {renderFileUpload('rirekisho', getRirekishoProps, getRirekishoInputProps, '履歴書')}
          {renderFileUpload('resume', getResumeProps, getResumeInputProps, '職務経歴書')}
          {renderFileUpload('bigfive', getBigFiveProps, getBigFiveInputProps, '性格診断結果')}
          {renderFileUpload('picture', getPictureProps, getPictureInputProps, 'プロフィール写真')}
        </div>
      </div>

      <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="button"
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? '処理中...' : '登録'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">エラー:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
    </form>
  );
}

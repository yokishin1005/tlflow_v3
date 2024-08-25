import { useState } from 'react';
import Layout from '../common/components/Layout';
import EmployeeForm from '../features/employeeRegistraion/components/EmployeeForm.js';
import { registerEmployee } from '../utils/api';

export default function Register() {
  const [message, setMessage] = useState('');

  const handleSubmit = async (employeeData) => {
    try {
      const response = await registerEmployee(employeeData);
      setMessage('従業員が正常に登録されました。');
    } catch (error) {
      setMessage('従業員の登録中にエラーが発生しました。');
      console.error('Error details:', error);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold leading-tight text-gray-900 mb-4">新規従業員登録</h1>
        <EmployeeForm onSubmit={handleSubmit} />
        {message && (
          <div className={`mt-4 p-4 rounded ${message.includes('エラー') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}
      </div>
    </Layout>
  );
}
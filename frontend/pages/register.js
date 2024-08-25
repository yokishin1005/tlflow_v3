import { useState } from 'react';
import Layout from '../components/Layout';
import EmployeeForm from '../components/EmployeeForm';
import { registerEmployee } from '../utils/api';

export default function Register() {
  const [message, setMessage] = useState('');

  const handleSubmit = async (employeeData) => {
    try {
      const response = await registerEmployee(employeeData);
      setMessage('従業員が正常に登録されました。');
    } catch (error) {
      setMessage('従業員の登録中にエラーが発生しました。');
    }
  };

  return (
    <Layout>
      <h1>新規従業員登録</h1>
      <EmployeeForm onSubmit={handleSubmit} />
      {message && <p>{message}</p>}
    </Layout>
  );
}
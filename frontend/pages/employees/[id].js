import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { getEmployee } from '../../utils/api';

export default function EmployeeDetail() {
  const [employee, setEmployee] = useState(null);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      async function fetchEmployee() {
        const data = await getEmployee(id);
        setEmployee(data);
      }
      fetchEmployee();
    }
  }, [id]);

  if (!employee) {
    return <Layout><p>Loading...</p></Layout>;
  }

  return (
    <Layout>
      <h1>{employee.employee_name}の詳細情報</h1>
      <p>従業員ID: {employee.employee_id}</p>
      <p>生年月日: {new Date(employee.birthdate).toLocaleDateString()}</p>
      <p>性別: {employee.gender}</p>
      <p>学歴: {employee.academic_background}</p>
      <p>入社日: {new Date(employee.hire_date).toLocaleDateString()}</p>
      <p>採用区分: {employee.recruitment_type}</p>
      <p>キャリア情報: {employee.career_info_detail}</p>
    </Layout>
  );
}
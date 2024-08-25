import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import EmployeeList from '../../components/EmployeeList';
import { getEmployees } from '../../utils/api';

export default function Employees() {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    async function fetchEmployees() {
      const data = await getEmployees();
      setEmployees(data);
    }
    fetchEmployees();
  }, []);

  return (
    <Layout>
      <h1>従業員一覧</h1>
      <EmployeeList employees={employees} />
    </Layout>
  );
}
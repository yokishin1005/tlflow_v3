import Link from 'next/link';

export default function EmployeeList({ employees }) {
  return (
    <ul>
      {employees.map((employee) => (
        <li key={employee.employee_id}>
          <Link href={`/employees/${employee.employee_id}`}>
            <a>{employee.employee_name}</a>
          </Link>
          {' - '}
          {employee.department_name}
        </li>
      ))}
    </ul>
  );
}
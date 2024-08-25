import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FormAnimation from './FormAnimation';
import FormLayout from './FormLayout';
import FormFields from './FormFields';
import useEmployeeForm from './useEmployeeForm';
import { employeeSchema } from './validationSchema';

export default function EmployeeForm({ onSubmit }) {
  const methods = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      employee_name: '',
      birthdate: null,
      gender: '',
      academic_background: '',
      hire_date: new Date(),
      recruitment_type: '',
      grade_name: '',
      department_name: '',
      neuroticism_score: '',
      extraversion_score: '',
      openness_score: '',
      agreeableness_score: '',
      conscientiousness_score: '',
      password: '',
    }
  });

  const { handleSubmit } = methods;

  const {
    grades,
    departments,
    fileStatus,
    onDrop,
    processForm
  } = useEmployeeForm(onSubmit);

  const onSubmitForm = async (data) => {
    try {
      await processForm(data);
      toast.success('従業員情報が正常に登録されました。');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('従業員情報の登録に失敗しました。');
    }
  };

  return (
    <FormProvider {...methods}>
      <FormAnimation>
        <FormLayout title="新規従業員登録">
          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-8">
            <FormFields
              grades={grades}
              departments={departments}
              fileStatus={fileStatus}
              onDrop={onDrop}
            />
            <div className="pt-5">
              <div className="flex justify-end">
                <FormAnimation.Button type="submit">
                  登録
                </FormAnimation.Button>
              </div>
            </div>
          </form>
        </FormLayout>
        <ToastContainer position="bottom-right" />
      </FormAnimation>
    </FormProvider>
  );
}

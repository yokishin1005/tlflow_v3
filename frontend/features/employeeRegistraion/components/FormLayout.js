import React from 'react';

const FormLayout = ({ title, children }) => (
  <div className="bg-white shadow-lg rounded-lg overflow-hidden">
    <div className="px-4 py-5 sm:p-6">
      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
        {title}
      </h3>
      {children}
    </div>
  </div>
);

export default FormLayout;
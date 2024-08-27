import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, subYears, addYears, setDate } from 'date-fns';
import { ja } from 'date-fns/locale';

const HiredatePicker = ({ value, onChange, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value || setDate(new Date(), 1));

  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i);

  const handleYearChange = (year) => {
    const newDate = setDate(new Date(year, viewDate.getMonth(), 1), 1);
    setViewDate(newDate);
    onChange(newDate);
  };

  const handleMonthChange = (month) => {
    const newDate = setDate(new Date(viewDate.getFullYear(), month, 1), 1);
    setViewDate(newDate);
    onChange(newDate);
  };

  return (
    <div className="relative">
      <label htmlFor="hire_date" className="block text-sm font-medium text-gray-700">
        入社日
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <input
          type="text"
          id="hire_date"
          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-md"
          placeholder="yyyy/MM/01"
          value={value ? format(value, 'yyyy/MM/01') : ''}
          onClick={() => setIsOpen(!isOpen)}
          readOnly
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Calendar className="h-5 w-5 text-gray-400" />
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-72 bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-2 bg-gray-100 flex justify-between items-center">
            <button onClick={() => handleYearChange(viewDate.getFullYear() - 1)} className="p-1">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <select
              value={viewDate.getFullYear()}
              onChange={(e) => handleYearChange(parseInt(e.target.value))}
              className="mx-1 p-1 rounded"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <button onClick={() => handleYearChange(viewDate.getFullYear() + 1)} className="p-1">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="p-2">
            <div className="grid grid-cols-3 gap-2">
              {months.map(month => (
                <button
                  key={month}
                  onClick={() => handleMonthChange(month)}
                  className={`p-2 text-center text-sm rounded-full hover:bg-indigo-100 ${
                    viewDate.getMonth() === month ? 'bg-indigo-500 text-white' : 'text-gray-700'
                  }`}
                >
                  {format(new Date(2000, month, 1), 'MMM', { locale: ja })}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HiredatePicker;
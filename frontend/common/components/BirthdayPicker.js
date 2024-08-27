import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, subYears, addYears, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ja } from 'date-fns/locale';

const BirthdayPicker = ({ value, onChange, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value || new Date());

  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i);

  const handleYearChange = (year) => {
    setViewDate(date => new Date(year, date.getMonth(), 1));
  };

  const handleMonthChange = (month) => {
    setViewDate(date => new Date(date.getFullYear(), month, 1));
  };

  const handleDateSelect = (day) => {
    onChange(day);
    setIsOpen(false);
  };

  const getDaysInMonth = (date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return eachDayOfInterval({ start, end });
  };

  return (
    <div className="relative">
      <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700">
        生年月日
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <input
          type="text"
          id="birthdate"
          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-md"
          placeholder="yyyy/MM/dd"
          value={value ? format(value, 'yyyy/MM/dd') : ''}
          onClick={() => setIsOpen(true)}
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
            <button onClick={() => setViewDate(date => subYears(date, 1))} className="p-1">
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
            <select
              value={viewDate.getMonth()}
              onChange={(e) => handleMonthChange(parseInt(e.target.value))}
              className="mx-1 p-1 rounded"
            >
              {months.map(month => (
                <option key={month} value={month}>
                  {format(new Date(2000, month, 1), 'MMMM', { locale: ja })}
                </option>
              ))}
            </select>
            <button onClick={() => setViewDate(date => addYears(date, 1))} className="p-1">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="p-2">
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(viewDate).map((day, index) => (
                <button
                  key={index}
                  onClick={() => handleDateSelect(day)}
                  className={`p-2 text-center text-sm rounded-full hover:bg-indigo-100 ${
                    value && day.toDateString() === value.toDateString() ? 'bg-indigo-500 text-white' : 'text-gray-700'
                  }`}
                >
                  {format(day, 'd')}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BirthdayPicker;
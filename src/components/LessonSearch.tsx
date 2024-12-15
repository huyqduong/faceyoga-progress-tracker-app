import React from 'react';
import { Search } from 'lucide-react';

interface LessonSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function LessonSearch({ value, onChange, placeholder = "Search lessons..." }: LessonSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-500 dark:focus:ring-mint-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
      />
    </div>
  );
}

export default LessonSearch;
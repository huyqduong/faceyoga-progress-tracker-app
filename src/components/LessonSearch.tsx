import React from 'react';
import { Search } from 'lucide-react';

interface LessonSearchProps {
  value: string;
  onChange: (value: string) => void;
}

function LessonSearch({ value, onChange }: LessonSearchProps) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-500 focus:border-transparent"
        placeholder="Search lessons..."
      />
    </div>
  );
}

export default LessonSearch;
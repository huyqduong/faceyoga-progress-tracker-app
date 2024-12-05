import React from 'react';
import { Search, X } from 'lucide-react';

interface ExerciseSearchProps {
  value: string;
  onChange: (value: string) => void;
}

function ExerciseSearch({ value, onChange }: ExerciseSearchProps) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search exercises..."
        className="block w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg 
          placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mint-500 
          focus:border-transparent transition-all bg-gray-50 hover:bg-white
          text-gray-900"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

export default ExerciseSearch;
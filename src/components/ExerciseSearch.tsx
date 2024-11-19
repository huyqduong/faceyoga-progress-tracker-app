import React from 'react';
import { Search } from 'lucide-react';

interface ExerciseSearchProps {
  value: string;
  onChange: (value: string) => void;
}

function ExerciseSearch({ value, onChange }: ExerciseSearchProps) {
  return (
    <div className="relative">
      <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
      <input
        type="text"
        placeholder="Search exercises..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-mint-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-500"
      />
    </div>
  );
}

export default ExerciseSearch;
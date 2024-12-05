import React from 'react';
import { Target } from 'lucide-react';

interface ExerciseFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const categories = [
  { id: 'all', name: 'All Areas' },
  { id: 'eyes', name: 'Eyes & Forehead' },
  { id: 'cheeks', name: 'Cheeks & Smile Lines' },
  { id: 'jawline', name: 'Jawline & Neck' },
  { id: 'lips', name: 'Lips & Mouth' },
  { id: 'face', name: 'Full Face' },
];

function ExerciseFilter({ selectedCategory, onSelectCategory }: ExerciseFilterProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Target className="w-4 h-4" />
        <span>Target Area</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${
                selectedCategory === category.id
                  ? 'bg-mint-500 text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }
            `}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ExerciseFilter;
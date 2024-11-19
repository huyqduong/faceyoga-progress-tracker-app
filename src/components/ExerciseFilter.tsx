import React from 'react';
import { Filter } from 'lucide-react';

export const categories = [
  { id: 'all', name: 'All Exercises' },
  { id: 'face', name: 'Face Muscles' },
  { id: 'neck', name: 'Neck & Jawline' },
  { id: 'eyes', name: 'Eye Area' },
  { id: 'forehead', name: 'Forehead' },
  { id: 'cheeks', name: 'Cheeks & Smile' },
];

interface ExerciseFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

function ExerciseFilter({ selectedCategory, onSelectCategory }: ExerciseFilterProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 bg-mint-50 text-mint-600 rounded-lg hover:bg-mint-100 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5" />
          <span>Filter by Category</span>
        </div>
        <span className="text-sm font-medium">
          {selectedCategory === 'all' ? 'All Exercises' : categories.find(c => c.id === selectedCategory)?.name}
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-full bg-white rounded-lg shadow-lg border border-mint-100 py-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                onSelectCategory(category.id);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-mint-50 transition-colors
                ${selectedCategory === category.id ? 'bg-mint-50 text-mint-600 font-medium' : 'text-gray-700'}`}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ExerciseFilter;
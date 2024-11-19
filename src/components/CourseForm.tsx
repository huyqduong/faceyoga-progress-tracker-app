import React, { useState, useEffect } from 'react';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import { useCourseStore } from '../store/courseStore';
import type { Course } from '../lib/supabase-types';
import ExerciseSelector from './ExerciseSelector';
import toast from 'react-hot-toast';

interface CourseFormProps {
  initialData?: Course;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

interface CourseSection {
  title: string;
  description: string;
  exercises: string[];
}

function CourseForm({ initialData, onSubmit, onCancel, isSubmitting }: CourseFormProps) {
  const { sections: courseSections, exercises: sectionExercises, fetchCourseSections, fetchSectionExercises } = useCourseStore();
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    difficulty: initialData?.difficulty || 'Beginner',
    duration: initialData?.duration || '',
    image_url: initialData?.image_url || ''
  });

  const [sections, setSections] = useState<CourseSection[]>([
    { title: '', description: '', exercises: [] }
  ]);

  const [isLoadingSections, setIsLoadingSections] = useState(false);

  // Load existing sections and exercises when editing
  useEffect(() => {
    const loadSectionData = async () => {
      if (initialData?.id) {
        setIsLoadingSections(true);
        try {
          // Fetch sections
          await fetchCourseSections(initialData.id);
          const currentSections = courseSections[initialData.id] || [];
          
          // Fetch exercises for each section
          const sectionsWithExercises = await Promise.all(
            currentSections.map(async (section) => {
              await fetchSectionExercises(section.id);
              const sectionExerciseList = sectionExercises[section.id] || [];
              return {
                title: section.title,
                description: section.description,
                exercises: sectionExerciseList.map(e => e.exercise_id)
              };
            })
          );

          if (sectionsWithExercises.length > 0) {
            setSections(sectionsWithExercises);
          }
        } catch (error) {
          console.error('Error loading section data:', error);
          toast.error('Failed to load section data');
        } finally {
          setIsLoadingSections(false);
        }
      }
    };

    loadSectionData();
  }, [initialData?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty sections
    const validSections = sections.filter(section => 
      section.title.trim() && section.description.trim()
    );
    
    await onSubmit({
      ...formData,
      sections: validSections
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSectionChange = (index: number, field: keyof CourseSection, value: string | string[]) => {
    const newSections = [...sections];
    newSections[index] = {
      ...newSections[index],
      [field]: value
    };
    setSections(newSections);
  };

  const addSection = () => {
    setSections([...sections, { title: '', description: '', exercises: [] }]);
  };

  const removeSection = (index: number) => {
    const newSections = sections.filter((_, i) => i !== index);
    setSections(newSections);
  };

  if (isLoadingSections) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mint-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading course sections...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Course Details */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Course Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty
            </label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg"
              required
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration
            </label>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg"
              required
              placeholder="e.g., 4 weeks"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg"
              placeholder="https://..."
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg"
              rows={4}
              required
            />
          </div>
        </div>
      </div>

      {/* Course Sections */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Course Sections</h3>
          <button
            type="button"
            onClick={addSection}
            className="px-3 py-1 bg-mint-500 text-white rounded-lg hover:bg-mint-600 transition-colors text-sm"
          >
            <Plus className="w-4 h-4 inline-block mr-1" />
            Add Section
          </button>
        </div>

        <div className="space-y-6">
          {sections.map((section, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-medium text-gray-700">Section {index + 1}</h4>
                {sections.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSection(index)}
                    className="p-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => handleSectionChange(index, 'title', e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={section.description}
                  onChange={(e) => handleSectionChange(index, 'description', e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  rows={2}
                  required
                />
              </div>

              <ExerciseSelector
                selectedExercises={section.exercises}
                onChange={(exercises) => handleSectionChange(index, 'exercises', exercises)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-mint-500 text-white rounded-lg hover:bg-mint-600 transition-colors disabled:opacity-50"
        >
          <Save className="w-5 h-5 inline-block mr-2" />
          {initialData ? 'Update Course' : 'Create Course'}
        </button>
      </div>
    </form>
  );
}

export default CourseForm;
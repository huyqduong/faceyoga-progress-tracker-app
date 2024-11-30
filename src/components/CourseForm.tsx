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
    image_url: initialData?.image_url || '',
    welcome_video: initialData?.welcome_video || '',
    price: initialData?.price || 0,
    is_published: initialData?.is_published || false,
    access_type: initialData?.access_type || 'lifetime',
    trial_duration_days: initialData?.trial_duration_days || 0,
    subscription_duration_months: initialData?.subscription_duration_months || 0,
    rating: initialData?.rating || 0
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
          // Only fetch sections if we don't have them
          if (!courseSections[initialData.id]) {
            await fetchCourseSections(initialData.id);
          }
          const currentSections = courseSections[initialData.id] || [];
          
          // Fetch exercises for sections we don't have
          const sectionsWithExercises = await Promise.all(
            currentSections.map(async (section) => {
              try {
                if (!sectionExercises[section.id]) {
                  await fetchSectionExercises(section.id);
                }
                const sectionExerciseList = sectionExercises[section.id] || [];
                return {
                  title: section.title,
                  description: section.description,
                  exercises: sectionExerciseList.map(e => e.exercise_id)
                };
              } catch (error) {
                console.error(`Error loading exercises for section ${section.id}:`, error);
                toast.error(`Failed to load exercises for section "${section.title}"`);
                return {
                  title: section.title,
                  description: section.description,
                  exercises: []
                };
              }
            })
          );

          if (sectionsWithExercises.length > 0) {
            setSections(sectionsWithExercises);
          }
        } catch (error) {
          console.error('Error loading course sections:', error);
          toast.error('Failed to load course sections');
        } finally {
          setIsLoadingSections(false);
        }
      }
    };

    loadSectionData();
  }, [initialData?.id, fetchCourseSections, fetchSectionExercises, courseSections, sectionExercises]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty sections
    const validSections = sections.filter(section => 
      section.title.trim() && section.description.trim()
    );

    // Validate welcome video URL if provided
    if (formData.welcome_video && !isValidVideoUrl(formData.welcome_video)) {
      toast.error('Invalid welcome video URL');
      return;
    }

    // Validate price
    if (formData.price < 0) {
      toast.error('Price cannot be negative');
      return;
    }

    // Validate trial duration
    if (formData.trial_duration_days < 0) {
      toast.error('Trial duration cannot be negative');
      return;
    }

    // Validate subscription duration
    if (formData.subscription_duration_months < 0) {
      toast.error('Subscription duration cannot be negative');
      return;
    }

    // Validate rating
    if (formData.rating < 0 || formData.rating > 5) {
      toast.error('Rating must be between 0 and 5');
      return;
    }
    
    await onSubmit({
      ...formData,
      sections: validSections
    });
  };

  const isValidVideoUrl = (url: string): boolean => {
    if (!url) return true; // Empty URL is valid (video is optional)
    try {
      const videoUrl = new URL(url);
      return videoUrl.protocol === 'http:' || videoUrl.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked
      : e.target.type === 'number'
      ? parseFloat(e.target.value)
      : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Welcome Video URL
            </label>
            <input
              type="url"
              name="welcome_video"
              value={formData.welcome_video}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rating (0-5)
            </label>
            <input
              type="number"
              name="rating"
              value={formData.rating}
              onChange={handleInputChange}
              min="0"
              max="5"
              step="0.1"
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </div>

        <div>
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

      {/* Access and Pricing */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Access and Pricing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price ($)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Access Type
            </label>
            <select
              name="access_type"
              value={formData.access_type}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg"
            >
              <option value="lifetime">Lifetime</option>
              <option value="subscription">Subscription</option>
              <option value="trial">Trial</option>
            </select>
          </div>

          {formData.access_type === 'trial' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trial Duration (days)
              </label>
              <input
                type="number"
                name="trial_duration_days"
                value={formData.trial_duration_days}
                onChange={handleInputChange}
                min="0"
                className="w-full p-2 border rounded-lg"
              />
            </div>
          )}

          {formData.access_type === 'subscription' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subscription Duration (months)
              </label>
              <input
                type="number"
                name="subscription_duration_months"
                value={formData.subscription_duration_months}
                onChange={handleInputChange}
                min="0"
                className="w-full p-2 border rounded-lg"
              />
            </div>
          )}

          <div className="col-span-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="is_published"
                checked={formData.is_published}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-mint-600 focus:ring-mint-500"
              />
              <span className="text-sm text-gray-700">Publish course (make it visible to users)</span>
            </label>
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
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-mint-700 bg-mint-100 hover:bg-mint-200"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Section
          </button>
        </div>

        {sections.map((section, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section Title
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
                    Section Description
                  </label>
                  <textarea
                    value={section.description}
                    onChange={(e) => handleSectionChange(index, 'description', e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    rows={2}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exercises
                  </label>
                  <ExerciseSelector
                    selectedExercises={section.exercises}
                    onChange={(exercises) => handleSectionChange(index, 'exercises', exercises)}
                  />
                </div>
              </div>

              {sections.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSection(index)}
                  className="ml-4 p-1 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 hover:text-gray-900"
        >
          <X className="w-5 h-5 inline-block mr-2" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-mint-500 text-white rounded-lg hover:bg-mint-600 transition-colors disabled:opacity-50"
        >
          <Save className="w-5 h-5 inline-block mr-2" />
          {isSubmitting ? 'Saving...' : 'Save Course'}
        </button>
      </div>
    </form>
  );
}

export default CourseForm;

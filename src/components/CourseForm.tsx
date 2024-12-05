import React, { useState, useEffect, useRef } from 'react';
import { Save, X, Plus, Trash2, Upload, Image } from 'lucide-react';
import { useCourseStore } from '../store/courseStore';
import type { Course } from '../lib/supabase-types';
import ExerciseSelector from './ExerciseSelector';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

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

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(formData.image_url || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error('Please select an image file');
      }
    }
  };

  const deleteOldImage = async (imageUrl: string) => {
    try {
      // Extract the filename from the URL
      const url = new URL(imageUrl);
      const filePath = url.pathname.split('/').pop();
      
      if (filePath) {
        const { error } = await supabase.storage
          .from('course-images')
          .remove([filePath]);
          
        if (error) {
          console.error('Error deleting old image:', error);
        }
      }
    } catch (error) {
      console.error('Error parsing old image URL:', error);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;
    
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      setIsUploading(true);
      console.log('Uploading image:', { fileName, filePath, fileSize: imageFile.size });
      
      // Check file size
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (imageFile.size > maxSize) {
        throw new Error('File size must be less than 5MB');
      }

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('course-images')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful:', uploadData);

      const { data: { publicUrl }, error: urlError } = supabase.storage
        .from('course-images')
        .getPublicUrl(filePath);

      if (urlError) {
        console.error('Error getting public URL:', urlError);
        throw urlError;
      }

      // If this is an update and we have an old image URL, delete the old image
      if (initialData?.image_url) {
        await deleteOldImage(initialData.image_url);
      }

      console.log('Got public URL:', publicUrl);
      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      toast.error(error.message || 'Failed to upload image');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

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

    // Upload image if selected
    let imageUrl = formData.image_url;
    if (imageFile) {
      const uploadedUrl = await uploadImage();
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      }
    }

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
      image_url: imageUrl,
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
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <h3 className="text-xl font-semibold text-gray-900 pb-4 border-b">Course Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-500"
                placeholder="Enter course title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-500 resize-none"
                placeholder="Enter course description"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Image
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-mint-500 transition-colors">
                <div className="space-y-2 text-center">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Course preview"
                        className="mx-auto h-32 w-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                          setFormData(prev => ({ ...prev, image_url: '' }));
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Image className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="image-upload"
                          className="relative cursor-pointer rounded-md font-medium text-mint-600 hover:text-mint-500 focus-within:outline-none"
                        >
                          <span>Upload a file</span>
                          <input
                            id="image-upload"
                            name="image-upload"
                            type="file"
                            ref={fileInputRef}
                            className="sr-only"
                            accept="image/*"
                            onChange={handleImageSelect}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  )}
                </div>
              </div>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-500"
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (hours)
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-500"
                  placeholder="e.g., 2.5"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4 pt-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="is_published"
              checked={formData.is_published}
              onChange={handleInputChange}
              className="rounded border-gray-300 text-mint-600 focus:ring-mint-500"
            />
            <span className="text-sm text-gray-700">Publish course</span>
          </label>
        </div>
      </div>

      {/* Access and Pricing */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <h3 className="text-xl font-semibold text-gray-900 pb-4 border-b">Access and Pricing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Access Type
            </label>
            <select
              name="access_type"
              value={formData.access_type}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-500"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-500"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Course Sections */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b">
          <h3 className="text-xl font-semibold text-gray-900">Course Sections</h3>
          <button
            type="button"
            onClick={addSection}
            className="flex items-center space-x-2 px-4 py-2 bg-mint-100 text-mint-700 rounded-lg hover:bg-mint-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Section</span>
          </button>
        </div>

        <div className="space-y-6">
          {sections.map((section, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="text-lg font-medium text-gray-900">Section {index + 1}</h4>
                {sections.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSection(index)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section Title
                  </label>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => handleSectionChange(index, 'title', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-500"
                    placeholder="Enter section title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section Description
                  </label>
                  <input
                    type="text"
                    value={section.description}
                    onChange={(e) => handleSectionChange(index, 'description', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-500"
                    placeholder="Enter section description"
                  />
                </div>
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
          ))}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-mint-600 text-white rounded-lg hover:bg-mint-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
          disabled={isSubmitting || isUploading}
        >
          {isSubmitting || isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white" />
              <span>{isUploading ? 'Uploading...' : 'Saving...'}</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Course</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default CourseForm;

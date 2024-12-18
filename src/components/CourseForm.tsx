import React, { useState, useEffect, useRef } from 'react';
import { Save, X, Plus, Trash2, Upload, Image } from 'lucide-react';
import { useCourseStore } from '../store/courseStore';
import type { Course } from '../lib/supabase-types';
import LessonSelector from './LessonSelector';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface CourseFormProps {
  initialData?: Course;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  sections?: CourseSection[];
  loading?: boolean;
}

interface CourseSection {
  title: string;
  description: string;
  exercises: string[];
}

function CourseForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isSubmitting, 
  sections: initialSections,
  loading = false
}: CourseFormProps) {
  const { sections: courseSections, exercises: sectionExercises, fetchCourseSections, fetchSectionExercises } = useCourseStore();
  
  const [formData, setFormData] = useState<Partial<Course>>(() => ({
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
  }));

  const [sections, setSections] = useState<CourseSection[]>(() => 
    initialSections?.length ? initialSections : [{ title: '', description: '', exercises: [] }]
  );

  // Update sections when initialSections changes
  useEffect(() => {
    if (initialSections?.length) {
      setSections(initialSections);
    }
  }, [initialSections]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || loading) return;

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
    
    const data = {
      ...formData,
      image_url: imageUrl,
      sections: validSections
    };

    await onSubmit(data);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mint-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 p-6">
      <div className="space-y-8 divide-y divide-gray-200">
        {/* Basic Information */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Course Information
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Basic information about the course.
            </p>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-mint-500 focus:ring-mint-500 sm:text-sm"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-mint-500 focus:ring-mint-500 sm:text-sm"
              required
            />
          </div>

          {/* Difficulty */}
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

          {/* Welcome Video URL */}
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

          {/* Price */}
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

          {/* Duration */}
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

          {/* Published */}
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
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Access and Pricing
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Access and pricing information for the course.
            </p>
          </div>

          {/* Access Type */}
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

        {/* Course Sections */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-medium text-gray-900">Course Sections</h4>
            <button
              type="button"
              onClick={() => setSections([...sections, { title: '', description: '', exercises: [] }])}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-mint-700 bg-mint-100 hover:bg-mint-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mint-500"
            >
              Add Section
            </button>
          </div>

          {sections.map((section, index) => (
            <div key={index} className="space-y-4 p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Section Title
                    </label>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => {
                        const newSections = [...sections];
                        newSections[index].title = e.target.value;
                        setSections(newSections);
                      }}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-mint-500 focus:ring-mint-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Section Description
                    </label>
                    <textarea
                      value={section.description}
                      onChange={(e) => {
                        const newSections = [...sections];
                        newSections[index].description = e.target.value;
                        setSections(newSections);
                      }}
                      rows={2}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-mint-500 focus:ring-mint-500 sm:text-sm"
                    />
                  </div>
                  <LessonSelector
                    selectedLessons={section.exercises || []}
                    onChange={(lessons) => {
                      const newSections = [...sections];
                      newSections[index].exercises = lessons;
                      setSections(newSections);
                    }}
                  />
                </div>
                {sections.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newSections = [...sections];
                      newSections.splice(index, 1);
                      setSections(newSections);
                    }}
                    className="ml-4 p-1 text-gray-400 hover:text-gray-500"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mint-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || loading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-mint-600 hover:bg-mint-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mint-500"
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin mr-2">⌛</span>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Course
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default CourseForm;

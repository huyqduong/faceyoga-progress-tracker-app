import React, { useState, useEffect, useRef } from 'react';
import { Edit2, Plus, X } from 'lucide-react';
import { useLessonStore } from '../../store/lessonStore';
import { Lesson } from '../../types';
import { supabaseApi } from '../../lib/supabaseApi';
import toast from 'react-hot-toast';
import LessonList from './LessonList';

const emptyLesson: Omit<Lesson, 'id'> = {
  title: '',
  description: '',
  duration: '',
  difficulty: '',
  image_url: '',
  video_url: '',
  category: '',
  target_area: '',
  instructions: [''],
  benefits: [''],
  is_premium: false,
};

type LessonFormData = Omit<Lesson, 'id'> & { id?: string };

function LessonManager() {
  const { lessons, loading, error: storeError, fetchLessons, createLesson, updateLesson, deleteLesson } = useLessonStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<LessonFormData>(emptyLesson);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const validateForm = (data: LessonFormData): string | null => {
    if (!data.title.trim()) return 'Title is required';
    if (!data.duration.trim()) return 'Duration is required';
    if (!data.description.trim()) return 'Description is required';
    if (!data.category) return 'Category is required';
    if (!data.target_area) return 'Target area is required';
    if (!data.difficulty) return 'Difficulty is required';
    if (!data.instructions?.length || !data.instructions.some(i => i.trim())) return 'At least one instruction is required';
    if (!data.benefits?.length || !data.benefits.some(b => b.trim())) return 'At least one benefit is required';
    if (!imageFile && !data.image_url) return 'Image is required';
    if (data.video_url && !isValidVideoUrl(data.video_url)) return 'Invalid video URL';
    return null;
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm(formData);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    try {
      setIsSubmitting(true);

      let imageUrl = formData.image_url;

      if (imageFile) {
        imageUrl = await supabaseApi.uploadFile(imageFile, 'lessons');
      }

      const cleanedData = {
        ...formData,
        instructions: formData.instructions?.filter(i => i.trim()) || [],
        benefits: formData.benefits?.filter(b => b.trim()) || [],
        image_url: imageUrl,
        video_url: formData.video_url?.trim() || null,
      };

      if (formData.id) {
        await updateLesson(formData.id, cleanedData);
        toast.success('Lesson updated successfully');
      } else {
        await createLesson(cleanedData);
        toast.success('Lesson created successfully');
      }

      setIsEditing(false);
      setFormData(emptyLesson);
      setImageFile(null);
      setImagePreview('');
      fetchLessons();
    } catch (error) {
      console.error('Error saving lesson:', error);
      setError(error instanceof Error ? error.message : 'Failed to save lesson');
      toast.error('Failed to save lesson');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (lesson: Lesson) => {
    setFormData({
      id: lesson.id,
      title: lesson.title,
      duration: lesson.duration,
      description: lesson.description,
      image_url: lesson.image_url,
      video_url: lesson.video_url || '',
      category: lesson.category,
      target_area: lesson.target_area,
      difficulty: lesson.difficulty,
      instructions: lesson.instructions || [''],
      benefits: lesson.benefits || [''],
      is_premium: lesson.is_premium,
    });
    setImagePreview(lesson.image_url);
    setIsEditing(true);
    setError(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) {
      return;
    }

    try {
      setIsSubmitting(true);
      await deleteLesson(id);
      toast.success('Lesson deleted successfully');
      fetchLessons();
    } catch (err) {
      console.error('Error deleting lesson:', err);
      toast.error('Failed to delete lesson');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArrayInput = (
    field: 'instructions' | 'benefits',
    index: number,
    value: string
  ) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field: 'instructions' | 'benefits') => {
    setFormData({
      ...formData,
      [field]: [...formData[field], ''],
    });
  };

  const removeArrayItem = (field: 'instructions' | 'benefits', index: number) => {
    const newArray = [...formData[field]];
    newArray.splice(index, 1);
    setFormData({ ...formData, [field]: newArray });
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 dark:bg-gray-900">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Lesson Management</h2>
        <button
          onClick={() => setIsEditing(true)}
          className="px-4 py-2 bg-mint-500 hover:bg-mint-600 dark:bg-mint-600 dark:hover:bg-mint-700 text-white rounded-lg transition-colors"
          disabled={isEditing}
        >
          <Plus className="w-5 h-5 inline-block mr-2" />
          New Lesson
        </button>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg dark:bg-red-900 dark:text-red-100">
          {error}
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                placeholder="Enter lesson title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duration (minutes)
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                placeholder="e.g., 10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <option value="">Select category</option>
                <option value="eyes">Eyes & Forehead</option>
                <option value="cheeks">Cheeks & Smile Lines</option>
                <option value="jawline">Jawline & Neck</option>
                <option value="lips">Lips & Mouth</option>
                <option value="face">Full Face</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Area
              </label>
              <input
                type="text"
                value={formData.target_area}
                onChange={(e) =>
                  setFormData({ ...formData, target_area: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                placeholder="Enter target area"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({ ...formData, difficulty: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <option value="">Select difficulty</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-2 border rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              placeholder="Enter lesson description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Instructions
            </label>
            {formData.instructions.map((instruction, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={instruction}
                  onChange={(e) =>
                    handleArrayInput('instructions', index, e.target.value)
                  }
                  className="flex-1 px-4 py-2 border rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  placeholder={`Step ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('instructions', index)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('instructions')}
              className="text-mint-600 dark:text-mint-400 hover:text-mint-700 dark:hover:text-mint-500"
            >
              + Add Step
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Benefits
            </label>
            {formData.benefits.map((benefit, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={benefit}
                  onChange={(e) =>
                    handleArrayInput('benefits', index, e.target.value)
                  }
                  className="flex-1 px-4 py-2 border rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  placeholder={`Benefit ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('benefits', index)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('benefits')}
              className="text-mint-600 dark:text-mint-400 hover:text-mint-700 dark:hover:text-mint-500"
            >
              + Add Benefit
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Video URL (optional)
            </label>
            <input
              type="text"
              value={formData.video_url}
              onChange={(e) =>
                setFormData({ ...formData, video_url: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              placeholder="Enter video URL (YouTube or Vimeo)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Image
            </label>
            <div className="flex items-center gap-4">
              {(imagePreview || formData.image_url) && (
                <img
                  src={imagePreview || formData.image_url}
                  alt="Preview"
                  className="w-24 h-24 rounded-lg object-cover"
                />
              )}
              <div>
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  Choose Image
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_premium}
              onChange={(e) =>
                setFormData({ ...formData, is_premium: e.target.checked })
              }
              className="rounded border-gray-300 dark:border-gray-700 text-mint-600 dark:text-mint-400 focus:ring-mint-500 dark:focus:ring-mint-400"
            />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Premium Lesson
            </label>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setFormData(emptyLesson);
                setImageFile(null);
                setImagePreview('');
                setError(null);
              }}
              className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-mint-500 dark:bg-mint-600 hover:bg-mint-600 dark:hover:bg-mint-700 text-white rounded-lg transition-colors"
            >
              {isSubmitting ? 'Saving...' : formData.id ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Lessons</h2>
              {lessons.length > 0 && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}
                </span>
              )}
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-500 dark:border-mint-400 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading lessons...</p>
              </div>
            ) : lessons.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">No lessons found.</p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Click the "New Lesson" button to create one.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={lesson.image_url}
                        alt={lesson.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {lesson.title}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                          <span>{lesson.duration} min</span>
                          <span>•</span>
                          <span>{lesson.difficulty}</span>
                          {lesson.is_premium && (
                            <>
                              <span>•</span>
                              <span className="text-amber-600 dark:text-amber-400">Premium</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(lesson)}
                        className="p-2 text-mint-600 dark:text-mint-400 hover:bg-mint-50 dark:hover:bg-mint-900 rounded-lg"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(lesson.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LessonManager;

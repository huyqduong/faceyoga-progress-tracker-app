import React, { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, Save, X, Upload, Image } from 'lucide-react';
import { useExerciseStore } from '../../store/exerciseStore';
import { supabaseApi } from '../../lib/supabase';
import type { Exercise } from '../../lib/supabase-types';
import toast from 'react-hot-toast';

interface ExerciseFormData {
  id?: string;
  title: string;
  duration: string;
  target_area: string;
  description: string;
  image_url: string;
  video_url: string;
  category: string;
  difficulty: string;
  instructions: string[];
  benefits: string[];
}

const emptyExercise: ExerciseFormData = {
  title: '',
  duration: '',
  target_area: '',
  description: '',
  image_url: '',
  video_url: '',
  category: 'face',
  difficulty: 'Beginner',
  instructions: [''],
  benefits: [''],
};

const categories = [
  { id: 'face', name: 'Face Muscles' },
  { id: 'neck', name: 'Neck & Jawline' },
  { id: 'eyes', name: 'Eye Area' },
  { id: 'forehead', name: 'Forehead' },
  { id: 'cheeks', name: 'Cheeks & Smile' },
];

const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

function ExerciseManager() {
  const { exercises, loading, error: storeError, fetchExercises, createExercise, updateExercise, deleteExercise } = useExerciseStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ExerciseFormData>(emptyExercise);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const validateForm = (data: ExerciseFormData): string | null => {
    if (!data.title.trim()) return 'Title is required';
    if (!data.duration.trim()) return 'Duration is required';
    if (!data.target_area.trim()) return 'Target area is required';
    if (!data.description.trim()) return 'Description is required';
    if (!data.category) return 'Category is required';
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
        imageUrl = await supabaseApi.uploadFile(imageFile, 'exercises');
      }

      const cleanedData = {
        ...formData,
        instructions: formData.instructions?.filter(i => i.trim()) || [],
        benefits: formData.benefits?.filter(b => b.trim()) || [],
        image_url: imageUrl,
        video_url: formData.video_url?.trim() || null,
      };

      if (formData.id) {
        await updateExercise(formData.id, cleanedData);
        toast.success('Exercise updated successfully');
      } else {
        await createExercise(cleanedData);
        toast.success('Exercise created successfully');
      }

      setIsEditing(false);
      setFormData(emptyExercise);
      setImageFile(null);
      setImagePreview('');
      fetchExercises();
    } catch (err) {
      console.error('Error saving exercise:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save exercise';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (exercise: Exercise) => {
    setFormData({
      id: exercise.id,
      title: exercise.title,
      duration: exercise.duration,
      target_area: exercise.target_area,
      description: exercise.description,
      image_url: exercise.image_url,
      video_url: exercise.video_url || '',
      category: exercise.category,
      difficulty: exercise.difficulty,
      instructions: exercise.instructions || [''],
      benefits: exercise.benefits || [''],
    });
    setImagePreview(exercise.image_url);
    setIsEditing(true);
    setError(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this exercise?')) {
      return;
    }

    try {
      setIsSubmitting(true);
      await deleteExercise(id);
      toast.success('Exercise deleted successfully');
      fetchExercises();
    } catch (err) {
      console.error('Error deleting exercise:', err);
      toast.error('Failed to delete exercise');
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
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(emptyExercise);
    setError(null);
    setImageFile(null);
    setImagePreview('');
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading exercises...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Exercise Management</h2>
        <button
          onClick={() => setIsEditing(true)}
          className="px-4 py-2 bg-mint-500 text-white rounded-lg hover:bg-mint-600 transition-colors"
        >
          <Plus className="w-5 h-5 inline-block mr-2" />
          New Exercise
        </button>
      </header>

      {(error || storeError) && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          {error || storeError}
        </div>
      )}

      {isEditing ? (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {formData.id ? 'Edit Exercise' : 'New Exercise'}
            </h2>
            <button
              onClick={handleCancel}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                  placeholder="e.g., 2 minutes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Area
                </label>
                <input
                  type="text"
                  value={formData.target_area}
                  onChange={(e) => setFormData({ ...formData, target_area: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                >
                  {categories.map(({ id, name }) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                >
                  {difficulties.map((difficulty) => (
                    <option key={difficulty} value={difficulty}>{difficulty}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  placeholder="https://..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exercise Image
                </label>
                <div className="space-y-2">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Image className="w-5 h-5 mr-2" />
                    {imageFile ? 'Change Image' : 'Upload Image'}
                  </button>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructions
              </label>
              {formData.instructions.map((instruction, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={instruction}
                    onChange={(e) => handleArrayInput('instructions', index, e.target.value)}
                    className="flex-1 p-2 border rounded-lg"
                    placeholder={`Step ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('instructions', index)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('instructions')}
                className="text-mint-600 hover:text-mint-700 text-sm font-medium"
              >
                + Add Step
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Benefits
              </label>
              {formData.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={benefit}
                    onChange={(e) => handleArrayInput('benefits', index, e.target.value)}
                    className="flex-1 p-2 border rounded-lg"
                    placeholder={`Benefit ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('benefits', index)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('benefits')}
                className="text-mint-600 hover:text-mint-700 text-sm font-medium"
              >
                + Add Benefit
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-mint-500 text-white rounded-lg hover:bg-mint-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5 inline-block mr-2" />
                {isSubmitting ? 'Saving...' : 'Save Exercise'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Exercise
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Difficulty
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {exercises.map((exercise) => (
                    <tr key={exercise.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={exercise.image_url}
                            alt={exercise.title}
                            className="w-10 h-10 rounded-lg object-cover mr-3"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {exercise.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {exercise.target_area}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {categories.find(c => c.id === exercise.category)?.name || exercise.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {exercise.duration}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full
                          ${exercise.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                            exercise.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'}`} >
                          {exercise.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(exercise)}
                          disabled={isSubmitting}
                          className="text-mint-600 hover:text-mint-900 mr-3 disabled:opacity-50"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => exercise.id && handleDelete(exercise.id)}
                          disabled={isSubmitting}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExerciseManager;

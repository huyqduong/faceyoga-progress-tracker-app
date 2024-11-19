import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Save, X, MoveUp, MoveDown, ChevronDown, ChevronUp } from 'lucide-react';
import { useCourseStore } from '../../store/courseStore';
import { useExerciseStore } from '../../store/exerciseStore';
import type { CourseSection, Exercise } from '../../lib/supabase-types';
import SectionExerciseManager from './SectionExerciseManager';

interface CourseSectionManagerProps {
  courseId: string;
}

function CourseSectionManager({ courseId }: CourseSectionManagerProps) {
  const { 
    sections, 
    loading, 
    error, 
    fetchCourseSections, 
    createSection, 
    updateSection, 
    deleteSection 
  } = useCourseStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSection, setSelectedSection] = useState<CourseSection | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order_index: 0
  });

  useEffect(() => {
    fetchCourseSections(courseId);
  }, [courseId, fetchCourseSections]);

  const courseSections = sections[courseId] || [];

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSection({
        ...formData,
        course_id: courseId,
        order_index: courseSections.length
      });
      setIsEditing(false);
      setFormData({
        title: '',
        description: '',
        order_index: 0
      });
    } catch (err) {
      console.error('Error creating section:', err);
    }
  };

  const handleEditSection = (section: CourseSection) => {
    setSelectedSection(section);
    setFormData({
      title: section.title,
      description: section.description,
      order_index: section.order_index
    });
    setIsEditing(true);
  };

  const handleUpdateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSection) return;

    try {
      await updateSection(selectedSection.id, formData);
      setIsEditing(false);
      setSelectedSection(null);
      setFormData({
        title: '',
        description: '',
        order_index: 0
      });
    } catch (err) {
      console.error('Error updating section:', err);
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this section?')) return;
    try {
      await deleteSection(id);
    } catch (err) {
      console.error('Error deleting section:', err);
    }
  };

  const toggleSectionExpansion = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  if (loading) {
    return (
      <div className="text-center py-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mint-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading sections...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Course Sections</h3>
        <button
          onClick={() => setIsEditing(true)}
          className="px-4 py-2 bg-mint-500 text-white rounded-lg hover:bg-mint-600 transition-colors"
        >
          <Plus className="w-5 h-5 inline-block mr-2" />
          Add Section
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {isEditing ? (
        <div className="bg-gray-50 rounded-lg p-6">
          <form onSubmit={selectedSection ? handleUpdateSection : handleCreateSection} className="space-y-6">
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

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setSelectedSection(null);
                  setFormData({
                    title: '',
                    description: '',
                    order_index: 0
                  });
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-mint-500 text-white rounded-lg hover:bg-mint-600 transition-colors"
              >
                <Save className="w-5 h-5 inline-block mr-2" />
                {selectedSection ? 'Update Section' : 'Create Section'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          {courseSections.map((section, index) => (
            <div key={section.id} className="bg-gray-50 rounded-lg overflow-hidden">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{section.title}</h4>
                    <p className="text-gray-600 mt-1">{section.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditSection(section)}
                      className="p-2 text-mint-600 hover:text-mint-700"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      className="p-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    {index > 0 && (
                      <button
                        onClick={() => {/* TODO: Implement move up */}}
                        className="p-2 text-gray-600 hover:text-gray-700"
                      >
                        <MoveUp className="w-5 h-5" />
                      </button>
                    )}
                    {index < courseSections.length - 1 && (
                      <button
                        onClick={() => {/* TODO: Implement move down */}}
                        className="p-2 text-gray-600 hover:text-gray-700"
                      >
                        <MoveDown className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => toggleSectionExpansion(section.id)}
                      className="p-2 text-gray-600 hover:text-gray-700"
                    >
                      {expandedSection === section.id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {expandedSection === section.id && (
                <div className="border-t border-gray-200 p-4 bg-white">
                  <SectionExerciseManager sectionId={section.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CourseSectionManager;
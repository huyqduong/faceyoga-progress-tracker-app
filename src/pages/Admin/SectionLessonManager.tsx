import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useLessonStore } from '../../store/lessonStore';
import { Lesson } from '../../types';
import LessonList from './LessonList';
import { supabaseApi } from '../../lib/supabaseApi';
import toast from 'react-hot-toast';

function SectionLessonManager() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const { lessons, loading, error, fetchLessons } = useLessonStore();
  const [sectionLessons, setSectionLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        await fetchLessons();
        const sectionData = await supabaseApi.getSectionLessons(sectionId!);
        setSectionLessons(sectionData);
      } catch (error) {
        console.error('Error loading section lessons:', error);
        toast.error('Failed to load section lessons');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [sectionId, fetchLessons]);

  const handleAddLesson = async (lessonId: string) => {
    try {
      await supabaseApi.addLessonToSection(sectionId!, lessonId);
      const updatedSectionLessons = await supabaseApi.getSectionLessons(sectionId!);
      setSectionLessons(updatedSectionLessons);
      toast.success('Lesson added to section');
    } catch (error) {
      console.error('Error adding lesson to section:', error);
      toast.error('Failed to add lesson to section');
    }
  };

  const handleRemoveLesson = async (lessonId: string) => {
    try {
      await supabaseApi.removeLessonFromSection(sectionId!, lessonId);
      const updatedSectionLessons = await supabaseApi.getSectionLessons(sectionId!);
      setSectionLessons(updatedSectionLessons);
      toast.success('Lesson removed from section');
    } catch (error) {
      console.error('Error removing lesson from section:', error);
      toast.error('Failed to remove lesson from section');
    }
  };

  const handleReorderLessons = async (reorderedLessons: Lesson[]) => {
    try {
      await supabaseApi.reorderSectionLessons(
        sectionId!,
        reorderedLessons.map((lesson) => lesson.id)
      );
      setSectionLessons(reorderedLessons);
      toast.success('Lessons reordered successfully');
    } catch (error) {
      console.error('Error reordering lessons:', error);
      toast.error('Failed to reorder lessons');
    }
  };

  const availableLessons = lessons.filter(
    (lesson) => !sectionLessons.some((sl) => sl.id === lesson.id)
  );

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4">
        Error loading lessons: {error.message}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Section Lessons</h2>
        {sectionLessons.length === 0 ? (
          <p className="text-gray-500">No lessons in this section yet.</p>
        ) : (
          <LessonList
            lessons={sectionLessons}
            onSelect={handleRemoveLesson}
            actionLabel="Remove"
            draggable
            onReorder={handleReorderLessons}
          />
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Available Lessons</h2>
        {availableLessons.length === 0 ? (
          <p className="text-gray-500">No available lessons to add.</p>
        ) : (
          <LessonList
            lessons={availableLessons}
            onSelect={handleAddLesson}
            actionLabel="Add"
          />
        )}
      </div>
    </div>
  );
}

export default SectionLessonManager;

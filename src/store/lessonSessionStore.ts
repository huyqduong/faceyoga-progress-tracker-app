import { create } from 'zustand';
import type { Lesson } from '../lib/supabase-types';

interface LessonSessionState {
  currentLesson: Lesson | null;
  isActive: boolean;
  startLesson: (lesson: Lesson) => void;
  endLesson: () => void;
}

export const useLessonSessionStore = create<LessonSessionState>((set) => ({
  currentLesson: null,
  isActive: false,

  startLesson: (lesson) => {
    set({ currentLesson: lesson, isActive: true });
  },

  endLesson: () => {
    set({ currentLesson: null, isActive: false });
  },
}));

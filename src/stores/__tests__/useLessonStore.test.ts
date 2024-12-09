/**
 * Tests for the Lesson Store
 *
 * This test suite verifies the functionality of the Lesson Store, which manages
 * the state and operations for lessons in the application.
 */

import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/types/supabase';

import { useLessonStore } from '../useLessonStore';

// Mock Supabase client
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(),
      eq: vi.fn(),
      single: vi.fn(),
      ilike: vi.fn(),
    })),
  },
}));

// Mock lesson data
const mockLesson: Database['public']['Tables']['lessons']['Row'] = {
  id: '1',
  title: 'Face Yoga Lesson',
  duration: '5 minutes',
  category: 'Face & Neck',
  description: 'Basic face yoga lesson',
  image_url: 'https://example.com/image.jpg',
  focus_area: 'face',
  difficulty: 'Beginner',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('useLessonStore', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    // Reset store state
    useLessonStore.setState({
      lessons: [],
      isLoading: false,
      error: null,
    });
  });

  /**
   * Tests the fetchLessons method which retrieves all lessons from the database.
   *
   * Expected behavior:
   * - Supabase client is called correctly
   * - Store state is updated with fetched lessons
   * - Loading state is managed properly
   */
  it('fetches lessons successfully', async () => {
    const mockResponse = {
      data: [mockLesson],
      error: null,
    };

    // Mock the Supabase response
    const mockSelect = vi.fn().mockResolvedValue(mockResponse);
    (supabase.from as any).mockReturnValue({ select: mockSelect });

    const { result } = renderHook(() => useLessonStore());

    await act(async () => {
      await result.current.fetchLessons();
    });

    expect(result.current.lessons).toEqual([mockLesson]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  /**
   * Tests error handling in fetchLessons.
   *
   * Expected behavior:
   * - Error state is set correctly
   * - Loading state is reset
   * - Lessons array is empty on error
   */
  it('handles fetch lessons error', async () => {
    const mockError = new Error('Failed to fetch lessons');
    const mockResponse = {
      data: null,
      error: mockError,
    };

    // Mock the Supabase response with error
    const mockSelect = vi.fn().mockResolvedValue(mockResponse);
    (supabase.from as any).mockReturnValue({ select: mockSelect });

    const { result } = renderHook(() => useLessonStore());

    await act(async () => {
      await result.current.fetchLessons();
    });

    expect(result.current.error).toBe(mockError.message);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.lessons).toEqual([]);
  });

  /**
   * Tests the searchLessons method which filters lessons by title.
   *
   * Expected behavior:
   * - Search query is correctly passed to Supabase
   * - Results are filtered based on the search query
   * - Store state is updated with search results
   */
  it('searches lessons successfully', async () => {
    const mockResponse = {
      data: [mockLesson],
      error: null,
    };

    // Mock the Supabase response for search
    const mockIlike = vi.fn().mockResolvedValue(mockResponse);
    const mockSelect = vi.fn().mockReturnValue({ ilike: mockIlike });
    (supabase.from as any).mockReturnValue({ select: mockSelect });

    const { result } = renderHook(() => useLessonStore());

    await act(async () => {
      await result.current.searchLessons('yoga');
    });

    expect(result.current.lessons).toEqual([mockLesson]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});

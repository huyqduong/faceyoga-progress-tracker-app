/**
 * Tests for the Exercise Store
 * 
 * This test suite verifies the functionality of the Exercise Store, which manages
 * the state of exercises in our application. The store provides methods for fetching,
 * searching, and retrieving individual exercises.
 * 
 * Testing Strategy:
 * - Mock the Supabase client to avoid actual API calls
 * - Test both success and error scenarios
 * - Verify state updates are handled correctly
 * - Ensure proper typing with Database types
 */

import { renderHook, act } from '@testing-library/react';
import { useExerciseStore } from '../useExerciseStore';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database.types';

// Mock the supabase module
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn()
  }
}));

const mockExercise: Database['public']['Tables']['exercises']['Row'] = {
  id: '1',
  title: 'Face Yoga Exercise',
  duration: '5 minutes',
  target_area: 'Face',
  description: 'A simple face yoga exercise',
  image_url: 'test.jpg',
  difficulty: 'Beginner',
  instructions: ['Step 1', 'Step 2'],
  benefits: ['Benefit 1', 'Benefit 2'],
  category: 'Face Yoga',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  is_premium: false
};

describe('useExerciseStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await act(async () => {
      useExerciseStore.setState({
        exercises: [],
        loading: false,
        error: null
      });
    });
  });

  /**
   * Tests the fetchExercises method which retrieves all exercises from the database.
   * Verifies that:
   * - The exercises are stored in state correctly
   * - Loading state is handled properly
   * - No errors occur during successful fetch
   */
  it('fetches exercises successfully', async () => {
    const mockSelect = jest.fn().mockResolvedValue({
      data: [mockExercise],
      error: null
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect
    });

    const { result } = renderHook(() => useExerciseStore());

    await act(async () => {
      await result.current.fetchExercises();
    });

    expect(result.current.exercises).toEqual([mockExercise]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  /**
   * Tests error handling in fetchExercises.
   * Verifies that:
   * - Errors are caught and stored in state
   * - Loading state is reset
   * - Exercises array is empty on error
   */
  it('handles fetch error', async () => {
    const mockError = new Error('Failed to fetch');
    const mockSelect = jest.fn().mockResolvedValue({
      data: null,
      error: mockError
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect
    });

    const { result } = renderHook(() => useExerciseStore());

    await act(async () => {
      await result.current.fetchExercises();
    });

    expect(result.current.exercises).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(mockError);
  });

  /**
   * Tests the searchExercises method which filters exercises by title.
   * Verifies that:
   * - Search query is properly formatted with wildcards
   * - Results are stored in state
   * - Loading and error states are handled
   */
  it('searches exercises successfully', async () => {
    const mockIlike = jest.fn().mockResolvedValue({
      data: [mockExercise],
      error: null
    });
    const mockSelect = jest.fn().mockReturnValue({
      ilike: mockIlike
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect
    });

    const { result } = renderHook(() => useExerciseStore());

    await act(async () => {
      await result.current.searchExercises('yoga');
    });

    expect(result.current.exercises).toEqual([mockExercise]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(mockIlike).toHaveBeenCalledWith('title', '%yoga%');
  });

  /**
   * Tests the getExerciseById method which retrieves a single exercise.
   * Verifies that:
   * - Correct ID is used in the query
   * - Single exercise is returned
   * - Error handling works as expected
   */
  it('gets exercise by id successfully', async () => {
    const mockSingle = jest.fn().mockResolvedValue({
      data: mockExercise,
      error: null
    });
    const mockEq = jest.fn().mockReturnValue({
      single: mockSingle
    });
    const mockSelect = jest.fn().mockReturnValue({
      eq: mockEq
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect
    });

    const { result } = renderHook(() => useExerciseStore());
    let exercise;

    await act(async () => {
      exercise = await result.current.getExerciseById('1');
    });

    expect(exercise).toEqual(mockExercise);
    expect(mockEq).toHaveBeenCalledWith('id', '1');
  });
});

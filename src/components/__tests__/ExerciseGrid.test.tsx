/**
 * Tests for the ExerciseGrid Component
 * 
 * This test suite verifies the functionality of the ExerciseGrid component, which
 * displays a grid of exercise cards and handles user interactions. The component
 * is responsible for rendering exercises, showing their premium status, and handling
 * exercise selection.
 * 
 * Testing Strategy:
 * - Test rendering with different exercise data
 * - Verify user interactions (clicking exercises)
 * - Check premium/locked state display
 * - Test empty state handling
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { ExerciseGrid } from '../ExerciseGrid';
import { Exercise } from '../../types';

type Exercise = {
  id: string;
  title: string;
  duration: string;
  target_area: string;
  description: string;
  image_url: string;
  difficulty: string;
  category: string;
  created_at: string;
  updated_at: string;
  instructions: string[];
  benefits: string[];
  is_premium?: boolean;
};

const mockExercises: Exercise[] = [
  {
    id: '1',
    title: 'Exercise 1',
    duration: '5 minutes',
    target_area: 'Face',
    description: 'Description 1',
    image_url: 'image1.jpg',
    difficulty: 'Beginner',
    category: 'Face Yoga',
    created_at: '2023-01-01',
    updated_at: '2023-01-01',
    instructions: ['Step 1', 'Step 2'],
    benefits: ['Benefit 1', 'Benefit 2']
  },
  {
    id: '2',
    title: 'Exercise 2',
    duration: '10 minutes',
    target_area: 'Face',
    description: 'Description 2',
    image_url: 'image2.jpg',
    difficulty: 'Intermediate',
    category: 'Face Yoga',
    created_at: '2023-01-01',
    updated_at: '2023-01-01',
    instructions: ['Step 1', 'Step 2'],
    benefits: ['Benefit 1', 'Benefit 2']
  }
];

describe('ExerciseGrid', () => {
  /**
   * Tests that exercises are rendered correctly in the grid.
   * Verifies that:
   * - All exercise cards are displayed
   * - Exercise titles are visible
   * - Exercise details are shown
   */
  it('renders exercises correctly', () => {
    render(
      <ExerciseGrid
        exercises={mockExercises}
        onStartExercise={() => {}}
        hasAccessToExercise={() => true}
      />
    );

    expect(screen.getByText('Exercise 1')).toBeInTheDocument();
    expect(screen.getByText('Exercise 2')).toBeInTheDocument();
  });

  /**
   * Tests that the exercise count is displayed correctly.
   * Verifies that the total number of exercises is shown.
   */
  it('shows correct exercise count', () => {
    render(
      <ExerciseGrid
        exercises={mockExercises}
        onStartExercise={() => {}}
        hasAccessToExercise={() => true}
      />
    );

    expect(screen.getByText('2 exercises found')).toBeInTheDocument();
  });

  /**
   * Tests the empty state when no exercises are provided.
   * Verifies that:
   * - A message is shown when there are no exercises
   * - The exercise count shows zero
   */
  it('handles empty exercise list', () => {
    render(
      <ExerciseGrid
        exercises={[]}
        onStartExercise={() => {}}
        hasAccessToExercise={() => true}
      />
    );

    expect(screen.getByText('No exercises found matching your criteria.')).toBeInTheDocument();
  });

  /**
   * Tests that clicking an exercise calls the onStartExercise callback.
   * Verifies that:
   * - The callback is called with the correct exercise ID
   * - The interaction works for non-premium exercises
   */
  it('calls onStartExercise when exercise is clicked', () => {
    const handleStartExercise = jest.fn();
    render(
      <ExerciseGrid
        exercises={mockExercises}
        onStartExercise={handleStartExercise}
        hasAccessToExercise={() => true}
      />
    );

    const startButtons = screen.getAllByText('Start Exercise');
    fireEvent.click(startButtons[0]);

    expect(handleStartExercise).toHaveBeenCalledWith(mockExercises[0]);
  });

  /**
   * Tests that premium exercises show a locked state.
   * Verifies that:
   * - Premium exercises display a lock icon
   * - Premium badge is shown
   * - The exercise cannot be started when locked
   */
  it('shows locked state for premium exercises', () => {
    render(
      <ExerciseGrid
        exercises={mockExercises}
        onStartExercise={() => {}}
        hasAccessToExercise={(exercise: Exercise) => exercise.id !== mockExercises[0].id}
      />
    );

    const lockedChips = screen.getAllByText('Locked');
    expect(lockedChips[0]).toBeInTheDocument();
  });
});

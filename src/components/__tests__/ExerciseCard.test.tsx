import { render, screen, fireEvent } from '../../utils/test-utils';
import ExerciseCard from '../ExerciseCard';

const mockExercise = {
  id: '1',
  title: 'Test Exercise',
  duration: '5',
  target_area: 'Face',
  description: 'Test Description',
  image_url: 'test.jpg',
  difficulty: 'Beginner',
  instructions: ['Step 1'],
  benefits: ['Benefit 1'],
  category: 'Face Yoga',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

describe('ExerciseCard', () => {
  it('renders exercise details correctly', () => {
    const handleStartExercise = jest.fn();

    render(
      <ExerciseCard
        exercise={mockExercise}
        onStartExercise={handleStartExercise}
      />
    );

    expect(screen.getByText(mockExercise.title)).toBeInTheDocument();
    expect(screen.getByText(mockExercise.description)).toBeInTheDocument();
    expect(screen.getByText(`${mockExercise.duration} min`)).toBeInTheDocument();
    expect(screen.getByText(mockExercise.target_area)).toBeInTheDocument();
    expect(screen.getByText(mockExercise.difficulty)).toBeInTheDocument();
  });

  it('calls onStartExercise when start button is clicked', () => {
    const handleStartExercise = jest.fn();

    render(
      <ExerciseCard
        exercise={mockExercise}
        onStartExercise={handleStartExercise}
      />
    );

    fireEvent.click(screen.getByText('Start Exercise'));
    expect(handleStartExercise).toHaveBeenCalledWith(mockExercise);
  });

  it('shows locked state when exercise is locked', () => {
    const handleStartExercise = jest.fn();

    render(
      <ExerciseCard
        exercise={mockExercise}
        onStartExercise={handleStartExercise}
        isLocked={true}
        courseTitle="Premium Course"
      />
    );

    expect(screen.getByText('Premium Course')).toBeInTheDocument();
    expect(screen.getByText('Locked')).toBeInTheDocument();
    expect(screen.getByText('Unlock Exercise')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('displays benefits correctly', () => {
    render(
      <ExerciseCard
        exercise={{
          ...mockExercise,
          benefits: ['Improves circulation', 'Reduces wrinkles']
        }}
        onStartExercise={() => {}}
        isLocked={false}
        courseTitle={undefined}
      />
    );

    expect(screen.getByText('Benefits:')).toBeInTheDocument();
    expect(screen.getByText('Improves circulation')).toBeInTheDocument();
    expect(screen.getByText('Reduces wrinkles')).toBeInTheDocument();
  });

  it('shows difficulty badge', () => {
    render(
      <ExerciseCard
        exercise={mockExercise}
        onStartExercise={() => {}}
        isLocked={false}
      />
    );

    expect(screen.getByText('Beginner')).toBeInTheDocument();
  });
});

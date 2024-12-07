import { Grid, Typography } from '@mui/material';
import ExerciseCard from './ExerciseCard';
import { Exercise } from '../types';

interface ExerciseGridProps {
  exercises: Exercise[];
  onStartExercise: (exercise: Exercise) => void;
  hasAccessToExercise: (exercise: Exercise) => boolean;
}

const ExerciseGrid: React.FC<ExerciseGridProps> = ({
  exercises,
  onStartExercise,
  hasAccessToExercise
}) => {
  if (exercises.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary" align="center">
        No exercises found matching your criteria.
      </Typography>
    );
  }

  return (
    <div>
      <Typography variant="body1" color="text.secondary" mb={2}>
        {exercises.length} exercises found
      </Typography>
      <Grid container spacing={3}>
        {exercises.map((exercise) => (
          <Grid item xs={12} sm={6} md={4} key={exercise.id}>
            <ExerciseCard
              exercise={exercise}
              onStartExercise={onStartExercise}
              isLocked={!hasAccessToExercise(exercise)}
              courseTitle={undefined}
            />
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default ExerciseGrid;
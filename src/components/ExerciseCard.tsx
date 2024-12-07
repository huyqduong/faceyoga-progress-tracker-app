import { Card, CardContent, CardMedia, Typography, Button, Chip, Stack } from '@mui/material';
import { Exercise } from '../types';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import TargetIcon from '@mui/icons-material/GpsFixed';

interface ExerciseCardProps {
  exercise: Exercise;
  onStartExercise: (exercise: Exercise) => void;
  isLocked?: boolean;
  courseTitle?: string;
}

export default function ExerciseCard({ exercise, onStartExercise, isLocked, courseTitle }: ExerciseCardProps) {
  const { title, duration, target_area, difficulty, description, image_url } = exercise;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="140"
        image={image_url}
        alt={title}
        sx={isLocked ? { filter: 'grayscale(100%)' } : undefined}
      />
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography gutterBottom variant="h6" component="div">
          {title}
          {isLocked && (
            <Chip
              label="Locked"
              color="warning"
              size="small"
              sx={{ ml: 1 }}
            />
          )}
          {courseTitle && (
            <Typography variant="caption" color="text.secondary" display="block">
              {courseTitle}
            </Typography>
          )}
        </Typography>
        
        <Stack direction="row" spacing={1} mb={2}>
          <Chip
            icon={<AccessTimeIcon />}
            label={`${duration} min`}
            size="small"
            variant="outlined"
          />
          <Chip
            icon={<TargetIcon />}
            label={target_area}
            size="small"
            variant="outlined"
          />
          <Chip
            icon={<FitnessCenterIcon />}
            label={difficulty}
            size="small"
            variant="outlined"
          />
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>

        {exercise.benefits && exercise.benefits.length > 0 && (
          <div className="mt-2">
            <p className="font-semibold">Benefits:</p>
            <ul className="list-disc pl-5">
              {exercise.benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={() => onStartExercise(exercise)}
          disabled={isLocked}
          sx={{ mt: 'auto' }}
        >
          {isLocked ? 'Unlock Exercise' : 'Start Exercise'}
        </Button>
      </CardContent>
    </Card>
  );
}
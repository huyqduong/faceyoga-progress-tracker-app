import { Card, CardContent, CardMedia, Typography, Button, Chip, Stack } from '@mui/material';
import { Lesson } from '../types';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import TargetIcon from '@mui/icons-material/GpsFixed';
import { stripHtml } from '../utils/sanitize';

interface LessonCardProps {
  lesson: Lesson;
  onStartLesson: (lesson: Lesson) => void;
  isLocked?: boolean;
  courseTitle?: string;
}

export default function LessonCard({ lesson, onStartLesson, isLocked, courseTitle }: LessonCardProps) {
  const { title, duration, target_area, difficulty, description, image_url } = lesson;

  return (
    <div 
      className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="aspect-video relative">
        <CardMedia
          component="img"
          height="140"
          image={image_url}
          alt={title}
          sx={isLocked ? { filter: 'grayscale(100%)' } : undefined}
          className="w-full h-full object-cover"
        />
        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs text-white">
          {duration} min
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <Typography gutterBottom variant="h6" component="div" className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {stripHtml(title)}
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
              {stripHtml(courseTitle)}
            </Typography>
          )}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" className="mb-4 line-clamp-2 dark:text-gray-400">
          {stripHtml(description)}
        </Typography>

        <Stack direction="row" spacing={1} mb={2} className="flex items-center justify-between">
          <Chip
            icon={<AccessTimeIcon />}
            label={`${duration} min`}
            size="small"
            variant="outlined"
            className="text-sm text-gray-500 dark:text-gray-400"
          />
          <Chip
            icon={<TargetIcon />}
            label={target_area}
            size="small"
            variant="outlined"
            className="text-sm text-gray-500 dark:text-gray-400"
          />
          <Chip
            icon={<FitnessCenterIcon />}
            label={difficulty}
            size="small"
            variant="outlined"
            className="text-sm text-gray-500 dark:text-gray-400"
          />
        </Stack>

        {lesson.benefits && lesson.benefits.length > 0 && (
          <div className="mt-2">
            <p className="font-semibold">Benefits:</p>
            <ul className="list-disc pl-5">
              {lesson.benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={() => onStartLesson(lesson)}
          disabled={isLocked}
          sx={{ mt: 'auto' }}
          className="w-full"
        >
          {isLocked ? 'Unlock Lesson' : 'Start Lesson'}
        </Button>
      </CardContent>
    </div>
  );
}
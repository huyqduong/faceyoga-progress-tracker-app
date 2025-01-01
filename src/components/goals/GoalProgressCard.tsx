import React, { useState, useEffect } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Trophy, Clock, Target, Calendar, Play, Loader2 } from 'lucide-react';
import { GoalWithProgress, GoalStatus } from '../../types/goal';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { courseApi } from '../../lib/courses';

interface GoalProgressCardProps {
  goal: GoalWithProgress;
  onStatusChange?: (status: GoalStatus) => void;
}

interface RelatedLesson {
  id: string;
  title: string;
  image_url: string;
  contribution_weight: number;
}

const statusColors = {
  not_started: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
  in_progress: 'bg-mint-100 dark:bg-mint-900/30 text-mint-600 dark:text-mint-400',
  completed: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  paused: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
};

const statusLabels = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
  paused: 'Paused',
};

export default function GoalProgressCard({ goal, onStatusChange }: GoalProgressCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [relatedLessons, setRelatedLessons] = useState<RelatedLesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [showLessons, setShowLessons] = useState(false);

  const progress = goal.progress?.progress_value || 0;
  const status = goal.progress?.status || 'not_started';
  const milestoneCount = goal.milestones?.filter(milestone => milestone.target_value > 0).length || 0;
  const milestonesReached = goal.progress?.milestone_reached || 0;
  
  // Calculate total points needed for completion
  const totalPointsNeeded = goal.milestones?.length > 0
    ? Math.max(...goal.milestones.map(m => m.target_value))
    : 100; // Default to 100 if no milestones
  
  // Calculate percentage for circular progress based on points
  const percentage = Math.min((progress / totalPointsNeeded) * 100, 100);

  useEffect(() => {
    const fetchRelatedLessons = async () => {
      if (!showLessons) return;
      
      setLoadingLessons(true);
      try {
        const { data, error } = await supabase
          .from('lesson_goal_mapping')
          .select(`
            lesson_id,
            contribution_weight,
            lessons!inner (
              id,
              title,
              image_url
            )
          `)
          .eq('goal_id', goal.id)
          .order('contribution_weight', { ascending: false })
          .limit(3);

        if (error) throw error;

        const lessons = data
          .map(item => ({
            id: item.lessons.id,
            title: item.lessons.title,
            image_url: item.lessons.image_url,
            contribution_weight: item.contribution_weight
          }))
          .filter(lesson => lesson.id && lesson.title);

        setRelatedLessons(lessons);
      } catch (err) {
        console.error('Error fetching related lessons:', err);
      } finally {
        setLoadingLessons(false);
      }
    };

    fetchRelatedLessons();
  }, [goal.id, showLessons]);

  const handleLessonClick = async (lessonId: string) => {
    try {
      // Get lesson details from section_lessons, taking the first section if multiple exist
      const { data: sectionLessons, error: sectionError } = await supabase
        .from('section_lessons')
        .select(`
          lesson_id,
          section:course_sections(
            course_id
          )
        `)
        .eq('lesson_id', lessonId)
        .limit(1); // Get only the first section

      if (sectionError) {
        console.error('Error checking section lesson:', sectionError);
        // Try standalone lessons table
        const { data: lesson, error: lessonError } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', lessonId)
          .single();

        if (lessonError) {
          console.error('Error checking standalone lesson:', lessonError);
          navigate(`/courses/free/lessons/${lessonId}`); // Fallback to free lesson route
          return;
        }

        // If found in standalone lessons, use free route
        navigate(`/courses/free/lessons/${lessonId}`);
        return;
      }

      // If lesson belongs to a course section, check access before navigating
      if (sectionLessons?.[0]?.section?.course_id) {
        const courseId = sectionLessons[0].section.course_id;
        
        // Check if course is free
        const { data: course, error: courseError } = await supabase
          .from('courses')
          .select('price')
          .eq('id', courseId)
          .single();

        if (courseError) {
          console.error('Error checking course:', courseError);
          navigate(`/courses/free/lessons/${lessonId}`); // Fallback to free lesson route
          return;
        }

        // If course has no price or price is 0, it's free
        if (!course?.price || course.price === 0) {
          navigate(`/courses/${courseId}/lessons/${lessonId}`);
          return;
        }

        // For paid courses, check if user has access
        const hasAccess = await courseApi.checkCourseAccess(user.id, courseId);
        if (!hasAccess) {
          // If no access, redirect to course page instead of showing error
          navigate(`/courses/${courseId}`);
          return;
        }

        navigate(`/courses/${courseId}/lessons/${lessonId}`);
      } else {
        // If not found in any course section, use free route
        navigate(`/courses/free/lessons/${lessonId}`);
      }
    } catch (error) {
      console.error('Error checking lesson course:', error);
      navigate(`/courses/free/lessons/${lessonId}`); // Fallback to free lesson route
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-4 sm:p-6 border-2 
      ${status === 'in_progress' 
        ? 'border-mint-500 shadow-mint-100 dark:shadow-mint-900/20' 
        : 'border-gray-100 dark:border-gray-700'}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">{goal.label}</h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{goal.description}</p>
        </div>
        <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0">
          <CircularProgressbar
            value={percentage}
            text={`${Math.round(percentage)}%`}
            styles={buildStyles({
              pathColor: status === 'in_progress' ? '#3a9e95' : '#16A34A',
              textColor: status === 'in_progress' ? '#3a9e95' : '#16A34A',
              trailColor: '#E5E7EB',
            })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 my-4 sm:my-6">
        <div className="flex items-center gap-2">
          <div className="p-1.5 sm:p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Milestones</p>
            <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{milestonesReached} / {milestoneCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Progress</p>
            <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{progress} points</p>
          </div>
        </div>

        {goal.estimated_duration && (
          <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 rounded-lg bg-mint-100 dark:bg-mint-900/30">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-mint-600 dark:text-mint-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Est. Duration</p>
              <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{goal.estimated_duration}</p>
            </div>
          </div>
        )}

        {goal.progress?.last_updated && (
          <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
              <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                {format(new Date(goal.progress.last_updated), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 sm:mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div>
          <select
            value={status}
            onChange={(e) => onStatusChange?.(e.target.value as GoalStatus)}
            className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${statusColors[status]} 
              border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mint-500 dark:focus:ring-offset-gray-800`}
          >
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        
        {goal.difficulty && (
          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium 
            ${goal.difficulty === 'beginner' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
              goal.difficulty === 'intermediate' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
              'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}
          >
            {goal.difficulty.charAt(0).toUpperCase() + goal.difficulty.slice(1)}
          </span>
        )}
      </div>

      {/* Related Lessons Section */}
      <div className="mt-4 sm:mt-6">
        <button
          onClick={() => setShowLessons(!showLessons)}
          className="flex items-center gap-2 text-mint-600 dark:text-mint-400 hover:text-mint-700 dark:hover:text-mint-300 font-medium"
        >
          {showLessons ? 'Hide Related Lessons' : 'Show Related Lessons'}
        </button>

        {showLessons && (
          <div className="mt-4 space-y-4">
            {loadingLessons ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 text-mint-500 dark:text-mint-400 animate-spin" />
              </div>
            ) : relatedLessons.length > 0 ? (
              <div className="space-y-3">
                {relatedLessons.map(lesson => (
                  <div 
                    key={lesson.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={lesson.image_url} 
                        alt={lesson.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{lesson.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Contributes {lesson.contribution_weight} points
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleLessonClick(lesson.id)}
                      className="p-2 text-mint-600 dark:text-mint-400 hover:text-mint-700 dark:hover:text-mint-300 rounded-lg hover:bg-mint-50 dark:hover:bg-mint-900/20 transition-colors"
                    >
                      <Play className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                No related lessons found for this goal.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

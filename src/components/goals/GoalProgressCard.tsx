import React, { useState, useEffect } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Trophy, Clock, Target, Calendar, Play, Loader2 } from 'lucide-react';
import { GoalWithProgress, GoalStatus } from '../../types/goal';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

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
  not_started: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-mint-100 text-mint-600',
  completed: 'bg-green-100 text-green-600',
  paused: 'bg-yellow-100 text-yellow-600',
};

const statusLabels = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
  paused: 'Paused',
};

export default function GoalProgressCard({ goal, onStatusChange }: GoalProgressCardProps) {
  const navigate = useNavigate();
  const [relatedLessons, setRelatedLessons] = useState<RelatedLesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [showLessons, setShowLessons] = useState(false);

  const progress = goal.progress?.progress_value || 0;
  const status = goal.progress?.status || 'not_started';
  const milestoneCount = goal.milestones?.length || 0;
  const milestonesReached = goal.progress?.milestone_reached || 0;
  
  // Calculate percentage for circular progress
  const percentage = milestoneCount > 0 
    ? (milestonesReached / milestoneCount) * 100 
    : (progress / 100);

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

  const handleStartLesson = async (lessonId: string) => {
    try {
      // Check if lesson belongs to a course
      const { data: sectionLessons } = await supabase
        .from('section_lessons')
        .select(`
          section:course_sections(
            course_id
          )
        `)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      // If lesson belongs to a course, use course route, otherwise use free lesson route
      if (sectionLessons?.section?.course_id) {
        navigate(`/courses/${sectionLessons.section.course_id}/lessons/${lessonId}`);
      } else {
        navigate(`/courses/free/lessons/${lessonId}`);
      }
    } catch (error) {
      console.error('Error checking lesson course:', error);
      navigate(`/courses/free/lessons/${lessonId}`); // Fallback to free lesson route
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{goal.label}</h3>
          <p className="text-gray-600">{goal.description}</p>
        </div>
        <div className="w-16 h-16">
          <CircularProgressbar
            value={percentage}
            text={`${Math.round(percentage)}%`}
            styles={buildStyles({
              pathColor: '#16A34A',
              textColor: '#16A34A',
              trailColor: '#E5E7EB',
            })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 my-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-purple-100">
            <Trophy className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Milestones</p>
            <p className="font-semibold">{milestonesReached} / {milestoneCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-100">
            <Target className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Progress</p>
            <p className="font-semibold">{progress} points</p>
          </div>
        </div>

        {goal.estimated_duration && (
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-mint-100">
              <Clock className="w-5 h-5 text-mint-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Est. Duration</p>
              <p className="font-semibold">{goal.estimated_duration}</p>
            </div>
          </div>
        )}

        {goal.progress?.last_updated && (
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-orange-100">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Updated</p>
              <p className="font-semibold">
                {format(new Date(goal.progress.last_updated), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
        <div>
          <select
            value={status}
            onChange={(e) => onStatusChange?.(e.target.value as GoalStatus)}
            className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status]} 
              border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mint-500`}
          >
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        
        {goal.difficulty && (
          <span className={`px-3 py-1 rounded-full text-sm font-medium 
            ${goal.difficulty === 'beginner' ? 'bg-green-100 text-green-600' :
              goal.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-600' :
              'bg-red-100 text-red-600'}`}
          >
            {goal.difficulty.charAt(0).toUpperCase() + goal.difficulty.slice(1)}
          </span>
        )}
      </div>

      {/* Related Lessons Section */}
      <div className="mt-6">
        <button
          onClick={() => setShowLessons(!showLessons)}
          className="flex items-center gap-2 text-mint-600 hover:text-mint-700 font-medium"
        >
          {showLessons ? 'Hide Related Lessons' : 'Show Related Lessons'}
        </button>

        {showLessons && (
          <div className="mt-4 space-y-4">
            {loadingLessons ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 text-mint-500 animate-spin" />
              </div>
            ) : relatedLessons.length > 0 ? (
              <div className="space-y-3">
                {relatedLessons.map(lesson => (
                  <div 
                    key={lesson.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={lesson.image_url} 
                        alt={lesson.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                        <p className="text-sm text-gray-600">
                          Contributes {lesson.contribution_weight} points
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleStartLesson(lesson.id)}
                      className="p-2 text-mint-600 hover:text-mint-700 rounded-lg hover:bg-mint-50 transition-colors"
                    >
                      <Play className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">
                No related lessons found for this goal.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

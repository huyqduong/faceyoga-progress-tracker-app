import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Trophy, Clock, Target, Calendar } from 'lucide-react';
import { GoalWithProgress, GoalStatus } from '../../types/goal';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface GoalProgressCardProps {
  goal: GoalWithProgress;
  onStatusChange?: (status: GoalStatus) => void;
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

  const progress = goal.progress?.progress_value || 0;
  const status = goal.progress?.status || 'not_started';
  const milestoneCount = goal.milestones?.filter(milestone => milestone.target_value > 0).length || 0;
  const milestonesReached = goal.milestones?.filter(
    milestone => progress >= milestone.target_value
  ).length || 0;
  
  // Calculate total points needed for completion and total reward points
  const totalPointsNeeded = goal.milestones?.length > 0
    ? Math.max(...goal.milestones.map(m => m.target_value))
    : 100; // Default to 100 if no milestones
    
  const totalRewardPoints = goal.milestones
    ?.filter(milestone => progress >= milestone.target_value)
    .reduce((total, milestone) => total + milestone.reward_points, 0) || 0;
  
  // Calculate percentage for circular progress based on points
  const percentage = Math.min((progress / totalPointsNeeded) * 100, 100);

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
          <Target className="w-5 h-5 text-mint-500" />
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">Progress</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{progress} points</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">Milestones</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {milestonesReached} / {milestoneCount}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">Status</div>
            <div className={`text-sm ${statusColors[status]}`}>
              {statusLabels[status]}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-500" />
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">Last Updated</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {goal.progress?.last_updated 
                ? format(new Date(goal.progress.last_updated), 'MMM d')
                : 'Not started'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">Reward Points</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{totalRewardPoints}</div>
          </div>
        </div>
      </div>

      {onStatusChange && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Update Status
          </label>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as GoalStatus)}
            className="block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm focus:ring-mint-500 focus:border-mint-500"
          >
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

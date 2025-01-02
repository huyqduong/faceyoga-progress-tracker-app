import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { GoalMilestone, GoalProgress, GoalWithProgress } from '../../types/goal';

interface GoalMilestonesProps {
  goal: GoalWithProgress;
  milestones: GoalMilestone[];
  progress?: GoalProgress;
  loading?: boolean;
}

export default function GoalMilestones({ goal, milestones, progress, loading }: GoalMilestonesProps) {
  if (loading) {
    return <div>Loading...</div>;
  }

  const currentProgress = progress?.progress_value || 0;
  const sortedMilestones = [...milestones].sort((a, b) => a.target_value - b.target_value);
  
  // Calculate total reward points earned
  const earnedRewardPoints = sortedMilestones
    .filter(milestone => currentProgress >= milestone.target_value)
    .reduce((total, milestone) => total + milestone.reward_points, 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold text-gray-900">Milestones</h4>
        {earnedRewardPoints > 0 && (
          <span className="text-yellow-600 font-medium">
            Total Rewards: +{earnedRewardPoints} points
          </span>
        )}
      </div>
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-3 top-4 bottom-4 w-0.5 bg-gray-200" />

        {/* Milestones */}
        <div className="space-y-6">
          {sortedMilestones.map((milestone, index) => {
            const isCompleted = currentProgress >= milestone.target_value;
            const isNext = !isCompleted && 
              (index === 0 || currentProgress >= sortedMilestones[index - 1].target_value);

            return (
              <div
                key={milestone.id}
                className={`relative flex items-start gap-4 pl-2
                  ${isCompleted ? 'text-mint-600' : isNext ? 'text-blue-600' : 'text-gray-500'}`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-6 h-6 flex-shrink-0 bg-white" />
                ) : (
                  <Circle className="w-6 h-6 flex-shrink-0 bg-white" />
                )}
                
                <div className={`flex-1 ${isCompleted ? '' : 'opacity-75'}`}>
                  <h5 className="font-medium">{milestone.title}</h5>
                  {milestone.description && (
                    <p className="text-sm mt-1">{milestone.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span>Target: {milestone.target_value} points</span>
                    {milestone.reward_points > 0 && (
                      <span className={`${isCompleted ? 'text-yellow-600' : 'text-gray-500'}`}>
                        {isCompleted ? '✨ Earned: ' : ''} +{milestone.reward_points} reward points
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

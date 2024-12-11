import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { GoalMilestone } from '../../types/goal';

interface GoalMilestonesProps {
  milestones: GoalMilestone[];
  currentProgress: number;
}

export default function GoalMilestones({ milestones, currentProgress }: GoalMilestonesProps) {
  const sortedMilestones = [...milestones].sort((a, b) => a.target_value - b.target_value);

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-gray-900">Milestones</h4>
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
                      <span className="text-yellow-600">
                        +{milestone.reward_points} reward points
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

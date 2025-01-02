import React from 'react';
import { Trophy, Award, Zap, Target } from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';

interface UserProfileProps {
  totalPoints: number;
  level: string;
  streakDays: number;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    badgeImageUrl?: string;
  }>;
}

const levelThresholds = {
  beginner: { min: 0, max: 499 },
  intermediate: { min: 500, max: 1499 },
  advanced: { min: 1500, max: 3000 }
};

export default function UserProfile({ totalPoints, level, streakDays, achievements }: UserProfileProps) {
  const currentLevelThreshold = levelThresholds[level as keyof typeof levelThresholds];
  const progressToNextLevel = ((totalPoints - currentLevelThreshold.min) / 
    (currentLevelThreshold.max - currentLevelThreshold.min)) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      {/* Level Progress */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {level.charAt(0).toUpperCase() + level.slice(1)} Yogi
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {totalPoints} total points earned
          </p>
        </div>
        <div className="w-20 h-20">
          <CircularProgressbar
            value={progressToNextLevel}
            text={`${Math.round(progressToNextLevel)}%`}
            styles={buildStyles({
              pathColor: '#3a9e95',
              textColor: '#3a9e95',
              trailColor: '#E5E7EB',
            })}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-mint-50 dark:bg-mint-900/20 rounded-lg p-4">
          <Trophy className="w-6 h-6 text-mint-600 mb-2" />
          <div className="text-2xl font-bold text-mint-600">{totalPoints}</div>
          <div className="text-sm text-mint-700">Total Points</div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <Award className="w-6 h-6 text-yellow-600 mb-2" />
          <div className="text-2xl font-bold text-yellow-600">{achievements.length}</div>
          <div className="text-sm text-yellow-700">Achievements</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <Zap className="w-6 h-6 text-blue-600 mb-2" />
          <div className="text-2xl font-bold text-blue-600">{streakDays}</div>
          <div className="text-sm text-blue-700">Day Streak</div>
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Achievements
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <div 
              key={achievement.id}
              className="flex items-start gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
            >
              {achievement.badgeImageUrl ? (
                <img 
                  src={achievement.badgeImageUrl} 
                  alt={achievement.title}
                  className="w-12 h-12 object-contain"
                />
              ) : (
                <Award className="w-12 h-12 text-yellow-500" />
              )}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {achievement.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {achievement.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

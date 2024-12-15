import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import BackButton from '../components/BackButton';
import { LessonHistoryEntry } from '../types';

function LessonHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [history, setHistory] = useState<LessonHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('lesson_history')
          .select(`
            id,
            completed_at,
            practice_time,
            lesson:lessons (
              id,
              title,
              image_url,
              target_area,
              difficulty,
              description
            )
          `)
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false });

        if (error) throw error;

        setHistory(data || []);
      } catch (error) {
        console.error('Error fetching lesson history:', error);
        toast.error('Failed to load lesson history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min${minutes === 1 ? '' : 's'}`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <BackButton />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Lesson History</h1>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mint-500 dark:border-mint-400" />
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">
            No lessons completed yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start practicing face yoga to track your progress!
          </p>
          <button
            onClick={() => navigate('/lessons')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-mint-600 hover:bg-mint-700 dark:bg-mint-500 dark:hover:bg-mint-600 transition-colors"
          >
            Browse Lessons
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((entry) => (
            <div
              key={entry.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-start space-x-4">
                <img
                  src={entry.lesson.image_url}
                  alt={entry.lesson.title}
                  className="w-24 h-24 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {entry.lesson.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                      {entry.lesson.target_area}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-mint-100 dark:bg-mint-900/30 text-mint-800 dark:text-mint-300">
                      {entry.lesson.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDistanceToNow(new Date(entry.completed_at), { addSuffix: true })}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDuration(entry.practice_time)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/lesson/${entry.lesson.id}`)}
                  className="text-mint-600 dark:text-mint-400 hover:text-mint-700 dark:hover:text-mint-300"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LessonHistory;
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import BackButton from '../components/BackButton';

interface LessonHistoryEntry {
  id: string;
  lessons: {
    id: string;
    title: string;
    image_url: string;
    target_area: string;
    difficulty: string;
    description: string;
    is_premium: boolean;
  };
  completed_at: string;
  duration: number;
}

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
            duration,
            lessons!fk_lesson_history_lesson (
              id,
              title,
              image_url,
              target_area,
              difficulty,
              description,
              is_premium
            )
          `)
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false });

        if (error) throw error;
        setHistory(data || []);
      } catch (err) {
        console.error('Error fetching lesson history:', err);
        toast.error('Failed to load lesson history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lesson History</h1>
            <p className="mt-2 text-gray-600">Track your face yoga journey and progress</p>
          </div>
          <button
            onClick={() => navigate('/lessons')}
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 rounded-lg font-medium bg-mint-500 text-white hover:bg-mint-600 transition-colors"
          >
            Start New Lesson
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>

        {history.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <p className="text-gray-600">You haven't completed any lessons yet.</p>
            <button
              onClick={() => navigate('/lessons')}
              className="mt-4 text-mint-600 hover:text-mint-700 font-medium"
            >
              Browse Lessons
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{entry.lessons.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{entry.lessons.description}</p>
                    </div>
                    {entry.lessons.is_premium && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-amber-500 to-amber-600 text-white">
                        Premium
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1.5" />
                      {formatDistanceToNow(new Date(entry.completed_at), { addSuffix: true })}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1.5" />
                      {entry.duration} minutes
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/lessons/${entry.lessons.id}`)}
                    className="mt-4 inline-flex items-center text-mint-600 hover:text-mint-700"
                  >
                    Practice Again
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default LessonHistory;
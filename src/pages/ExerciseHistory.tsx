import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import BackButton from '../components/BackButton';

interface ExerciseHistoryEntry {
  id: string;
  exercises: {
    id: string;
    title: string;
    image_url: string;
    target_area: string;
    difficulty: string;
  };
  completed_at: string;
  duration: number;
}

function ExerciseHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [history, setHistory] = useState<ExerciseHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('exercise_history')
          .select(`
            id,
            completed_at,
            duration,
            exercises!fk_exercise_history_exercise (
              id,
              title,
              image_url,
              target_area,
              difficulty
            )
          `)
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false });

        if (error) throw error;
        setHistory(data || []);
      } catch (err) {
        console.error('Error fetching exercise history:', err);
        toast.error('Failed to load exercise history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading exercise history...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <BackButton />
          <h1 className="text-2xl font-bold">Exercise History</h1>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <p className="text-gray-600">No exercises completed yet. Start your journey today!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {history.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-xl shadow-sm p-4 flex items-center space-x-4"
            >
              <img
                src={entry.exercises.image_url}
                alt={entry.exercises.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {entry.exercises.title}
                </h3>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {format(new Date(entry.completed_at), 'PPp')}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {entry.duration} minutes
                  </div>
                </div>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${entry.exercises.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                      entry.exercises.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'}`}>
                    {entry.exercises.difficulty}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">{entry.exercises.target_area}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ExerciseHistory;
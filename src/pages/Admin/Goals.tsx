import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import MilestoneEditor from '../../components/admin/MilestoneEditor';
import { GoalMilestone } from '../../types/goal';

interface Goal {
  id: string;
  label: string;
  icon: string;
  description: string;
  created_at: string;
  milestones?: GoalMilestone[];
  lessons?: {
    id: string;
    lesson_id: string;
    goal_id: string;
    lesson: {
      id: string;
      title: string;
    };
    contribution_weight: number;
  }[];
}

interface EditingGoal {
  id?: string;
  label: string;
  icon: string;
  description: string;
  milestones: GoalMilestone[];
  lessons: {
    lessonId: string;
    contributionWeight: number;
  }[];
}

const AVAILABLE_ICONS = [
  { value: 'Target', label: 'Target' },
  { value: 'Clock', label: 'Clock' },
  { value: 'Sparkles', label: 'Sparkles' },
  { value: 'Heart', label: 'Heart' },
  { value: 'Star', label: 'Star' },
  { value: 'Sun', label: 'Sun' },
  { value: 'Moon', label: 'Moon' },
  { value: 'Smile', label: 'Smile' },
];

export default function AdminGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGoal, setEditingGoal] = useState<EditingGoal | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [lessons, setLessons] = useState<{ id: string; title: string; }[]>([]);

  useEffect(() => {
    fetchGoals();
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('id, title')
        .order('title');

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast.error('Failed to fetch lessons');
    }
  };

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select(`
          *,
          milestones:goal_milestones(*),
          lessons:goal_lessons(
            id,
            lesson_id,
            goal_id,
            lesson:lessons(id, title),
            contribution_weight
          )
        `)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast.error('Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingGoal({
      label: '',
      icon: 'Target',
      description: '',
      milestones: [],
      lessons: []
    });
  };

  const handleEdit = (goal: Goal) => {
    setIsAdding(false);
    setEditingGoal({
      id: goal.id,
      label: goal.label,
      icon: goal.icon,
      description: goal.description,
      milestones: goal.milestones || [],
      lessons: goal.lessons?.map(l => ({
        lessonId: l.lesson_id,
        contributionWeight: l.contribution_weight || 10
      })) || []
    });
  };

  const handleSave = async () => {
    if (!editingGoal) return;

    try {
      if (isAdding) {
        // First create the goal
        const { data: goalData, error: goalError } = await supabase
          .from('goals')
          .insert([{
            label: editingGoal.label,
            icon: editingGoal.icon,
            description: editingGoal.description,
          }])
          .select()
          .single();

        if (goalError) throw goalError;

        // Then create the milestones
        if (editingGoal.milestones.length > 0) {
          const { error: milestonesError } = await supabase
            .from('goal_milestones')
            .insert(
              editingGoal.milestones.map(milestone => ({
                goal_id: goalData.id,
                title: milestone.title,
                description: milestone.description,
                target_value: milestone.target_value,
                reward_points: milestone.reward_points
              }))
            );

          if (milestonesError) throw milestonesError;
        }

        // Create lesson links with contribution weights
        if (editingGoal.lessons.length > 0) {
          const { error: lessonsError } = await supabase
            .from('goal_lessons')
            .insert(
              editingGoal.lessons.map(lesson => ({
                goal_id: goalData.id,
                lesson_id: lesson.lessonId,
                contribution_weight: lesson.contributionWeight
              }))
            );

          if (lessonsError) throw lessonsError;
        }

        toast.success('Goal created successfully');
      } else {
        // Update goal
        const { error: goalError } = await supabase
          .from('goals')
          .update({
            label: editingGoal.label,
            icon: editingGoal.icon,
            description: editingGoal.description,
          })
          .eq('id', editingGoal.id);

        if (goalError) throw goalError;

        // Delete existing milestones
        const { error: deleteMilestonesError } = await supabase
          .from('goal_milestones')
          .delete()
          .eq('goal_id', editingGoal.id);

        if (deleteMilestonesError) throw deleteMilestonesError;

        // Create new milestones
        if (editingGoal.milestones.length > 0) {
          const { error: milestonesError } = await supabase
            .from('goal_milestones')
            .insert(
              editingGoal.milestones.map(milestone => ({
                goal_id: editingGoal.id,
                title: milestone.title,
                description: milestone.description,
                target_value: milestone.target_value,
                reward_points: milestone.reward_points
              }))
            );

          if (milestonesError) throw milestonesError;
        }

        // Delete existing lesson links
        const { error: deleteLessonsError } = await supabase
          .from('goal_lessons')
          .delete()
          .eq('goal_id', editingGoal.id);

        if (deleteLessonsError) throw deleteLessonsError;

        // Create new lesson links with contribution weights
        if (editingGoal.lessons.length > 0) {
          const { error: lessonsError } = await supabase
            .from('goal_lessons')
            .insert(
              editingGoal.lessons.map(lesson => ({
                goal_id: editingGoal.id,
                lesson_id: lesson.lessonId,
                contribution_weight: lesson.contributionWeight
              }))
            );

          if (lessonsError) throw lessonsError;
        }

        toast.success('Goal updated successfully');
      }

      setEditingGoal(null);
      fetchGoals();
    } catch (error) {
      console.error('Error saving goal:', error);
      toast.error('Failed to save goal');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Goal deleted successfully');
      fetchGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-500 dark:border-mint-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Goal Management</h1>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-mint-500 hover:bg-mint-600 dark:bg-mint-600 dark:hover:bg-mint-700 text-white rounded-lg transition-colors"
          disabled={isAdding}
        >
          <Plus className="w-5 h-5 inline-block mr-2" />
          Add New Goal
        </button>
      </header>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          {goals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No goals found.</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Click the "New Goal" button to create one.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{goal.label}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{goal.description}</p>
                    {goal.lessons && goal.lessons.length > 0 && (
                      <div className="mt-2">
                        <h4 className="text-sm font-medium text-gray-700">Related Lessons:</h4>
                        <ul className="mt-1 text-sm text-gray-600">
                          {goal.lessons.map(({ lesson }) => (
                            <li key={lesson.id}>{lesson.title}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="p-2 text-mint-600 dark:text-mint-400 hover:bg-mint-50 dark:hover:bg-mint-900/50 rounded-lg"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {editingGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {isAdding ? 'Add New Goal' : 'Edit Goal'}
              </h2>
              <button
                onClick={() => setEditingGoal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Label
                </label>
                <input
                  type="text"
                  value={editingGoal.label}
                  onChange={(e) =>
                    setEditingGoal({ ...editingGoal, label: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Icon
                </label>
                <select
                  value={editingGoal.icon}
                  onChange={(e) =>
                    setEditingGoal({ ...editingGoal, icon: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  {AVAILABLE_ICONS.map((icon) => (
                    <option key={icon.value} value={icon.value}>
                      {icon.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={editingGoal.description}
                  onChange={(e) =>
                    setEditingGoal({
                      ...editingGoal,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Related Lessons</h3>
                <div className="space-y-2">
                  {editingGoal.lessons.map((lesson, index) => {
                    const lessonData = lessons.find(l => l.id === lesson.lessonId);
                    return (
                      <div key={lesson.lessonId} className="flex items-center gap-2">
                        <select
                          value={lesson.lessonId}
                          onChange={(e) => {
                            const newLessons = [...editingGoal.lessons];
                            newLessons[index].lessonId = e.target.value;
                            setEditingGoal({ ...editingGoal, lessons: newLessons });
                          }}
                          className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
                        >
                          <option value="">Select a lesson</option>
                          {lessons.map(l => (
                            <option key={l.id} value={l.id}>{l.title}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={lesson.contributionWeight}
                          onChange={(e) => {
                            const newLessons = [...editingGoal.lessons];
                            newLessons[index].contributionWeight = parseInt(e.target.value) || 0;
                            setEditingGoal({ ...editingGoal, lessons: newLessons });
                          }}
                          min="0"
                          className="w-24 rounded-lg border border-gray-300 px-3 py-2"
                          placeholder="Points"
                        />
                        <button
                          onClick={() => {
                            const newLessons = editingGoal.lessons.filter((_, i) => i !== index);
                            setEditingGoal({ ...editingGoal, lessons: newLessons });
                          }}
                          className="p-2 text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    );
                  })}
                  <button
                    onClick={() => {
                      setEditingGoal({
                        ...editingGoal,
                        lessons: [...editingGoal.lessons, { lessonId: '', contributionWeight: 10 }]
                      });
                    }}
                    className="flex items-center gap-2 text-mint-600 hover:text-mint-700"
                  >
                    <Plus className="w-5 h-5" />
                    Add Lesson
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Milestones
                </label>
                <MilestoneEditor
                  milestones={editingGoal.milestones}
                  onChange={(milestones) =>
                    setEditingGoal({ ...editingGoal, milestones })
                  }
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setEditingGoal(null)}
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

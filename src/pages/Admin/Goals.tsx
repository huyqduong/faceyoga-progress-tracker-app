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
}

interface EditingGoal {
  id?: string;
  label: string;
  icon: string;
  description: string;
  milestones: GoalMilestone[];
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

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select(`
          *,
          milestones:goal_milestones(*)
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
      milestones: []
    });
  };

  const handleEdit = (goal: Goal) => {
    setIsAdding(false);
    setEditingGoal({
      id: goal.id,
      label: goal.label,
      icon: goal.icon,
      description: goal.description,
      milestones: goal.milestones || []
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
              editingGoal.milestones.map(m => ({
                goal_id: goalData.id,
                title: m.title,
                description: m.description,
                target_value: m.target_value,
                reward_points: m.reward_points
              }))
            );

          if (milestonesError) throw milestonesError;
        }

        toast.success('Goal added successfully');
      } else {
        // Update the goal
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
        const { error: deleteError } = await supabase
          .from('goal_milestones')
          .delete()
          .eq('goal_id', editingGoal.id);

        if (deleteError) throw deleteError;

        // Create new milestones
        if (editingGoal.milestones.length > 0) {
          const { error: milestonesError } = await supabase
            .from('goal_milestones')
            .insert(
              editingGoal.milestones.map(m => ({
                goal_id: editingGoal.id,
                title: m.title,
                description: m.description,
                target_value: m.target_value,
                reward_points: m.reward_points
              }))
            );

          if (milestonesError) throw milestonesError;
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {isAdding ? 'Add New Goal' : 'Edit Goal'}
                </h2>
                <button
                  onClick={() => setEditingGoal(null)}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Label
                  </label>
                  <input
                    type="text"
                    value={editingGoal.label}
                    onChange={(e) => setEditingGoal({ ...editingGoal, label: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                    placeholder="Enter goal label"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Icon
                  </label>
                  <select
                    value={editingGoal.icon}
                    onChange={(e) => setEditingGoal({ ...editingGoal, icon: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                  >
                    {AVAILABLE_ICONS.map((icon) => (
                      <option key={icon.value} value={icon.value}>
                        {icon.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editingGoal.description}
                    onChange={(e) => setEditingGoal({ ...editingGoal, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                    rows={3}
                    placeholder="Enter goal description"
                  />
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <MilestoneEditor
                    goalId={editingGoal.id || ''}
                    milestones={editingGoal.milestones}
                    onChange={(milestones) => setEditingGoal({ ...editingGoal, milestones })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setEditingGoal(null)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-mint-500 hover:bg-mint-600 text-white rounded-lg flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Goal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

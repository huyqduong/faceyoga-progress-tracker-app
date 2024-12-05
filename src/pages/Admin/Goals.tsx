import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Goal {
  id: string;
  label: string;
  icon: string;
  description: string;
  created_at: string;
}

interface EditingGoal {
  id?: string;
  label: string;
  icon: string;
  description: string;
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
        .select('*')
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
    });
  };

  const handleEdit = (goal: Goal) => {
    setIsAdding(false);
    setEditingGoal({
      id: goal.id,
      label: goal.label,
      icon: goal.icon,
      description: goal.description,
    });
  };

  const handleSave = async () => {
    if (!editingGoal) return;

    try {
      if (isAdding) {
        const { error } = await supabase
          .from('goals')
          .insert([{
            label: editingGoal.label,
            icon: editingGoal.icon,
            description: editingGoal.description,
          }]);

        if (error) throw error;
        toast.success('Goal added successfully');
      } else {
        const { error } = await supabase
          .from('goals')
          .update({
            label: editingGoal.label,
            icon: editingGoal.icon,
            description: editingGoal.description,
          })
          .eq('id', editingGoal.id);

        if (error) throw error;
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
      <div className="p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mint-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Goal Management</h1>
          <p className="mt-2 text-lg text-gray-600">
            Manage the goals that users can select during onboarding.
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent 
            rounded-lg shadow-sm text-white bg-mint-500 hover:bg-mint-600 focus:outline-none 
            focus:ring-2 focus:ring-offset-2 focus:ring-mint-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Goal
        </button>
      </div>

      {editingGoal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {isAdding ? 'Add New Goal' : 'Edit Goal'}
              </h2>
              <button
                onClick={() => setEditingGoal(null)}
                className="p-2 text-gray-400 hover:text-gray-500 rounded-lg"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Label
                </label>
                <input
                  type="text"
                  value={editingGoal.label}
                  onChange={(e) => setEditingGoal({ ...editingGoal, label: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-mint-500 focus:border-transparent"
                  placeholder="e.g., Tone Jawline"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon
                </label>
                <select
                  value={editingGoal.icon}
                  onChange={(e) => setEditingGoal({ ...editingGoal, icon: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-mint-500 focus:border-transparent"
                >
                  {AVAILABLE_ICONS.map((icon) => (
                    <option key={icon.value} value={icon.value}>
                      {icon.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editingGoal.description}
                  onChange={(e) => setEditingGoal({ ...editingGoal, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-mint-500 focus:border-transparent"
                  placeholder="e.g., Strengthen and define your jawline muscles"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setEditingGoal(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-mint-500 text-white rounded-lg hover:bg-mint-600"
                >
                  Save Goal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Icon
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Label
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {goals.map((goal) => (
              <tr key={goal.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-mint-600">{goal.icon}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{goal.label}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">{goal.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(goal)}
                    className="text-mint-600 hover:text-mint-700 mr-4"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

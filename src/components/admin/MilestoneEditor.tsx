import React, { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { GoalMilestone } from '../../types/goal';

interface MilestoneEditorProps {
  goalId: string;
  milestones: GoalMilestone[];
  onChange: (milestones: GoalMilestone[]) => void;
}

interface EditingMilestone extends Omit<GoalMilestone, 'id' | 'goal_id' | 'created_at'> {
  id?: string;
  isNew?: boolean;
}

export default function MilestoneEditor({ goalId, milestones, onChange }: MilestoneEditorProps) {
  const [editingMilestones, setEditingMilestones] = useState<EditingMilestone[]>([]);

  useEffect(() => {
    console.log('MilestoneEditor mounted with props:', { goalId, milestones });
    setEditingMilestones(milestones?.map(m => ({
      ...m,
      isNew: false
    })) || []);
  }, [milestones]);

  const handleAdd = () => {
    const newMilestones = [
      ...editingMilestones,
      {
        title: '',
        description: '',
        target_value: Math.max(0, ...editingMilestones.map(m => m.target_value || 0)) + 10,
        reward_points: 10,
        isNew: true
      }
    ];
    setEditingMilestones(newMilestones);
    onChange(newMilestones);
  };

  const handleRemove = (index: number) => {
    const newMilestones = editingMilestones.filter((_, i) => i !== index);
    setEditingMilestones(newMilestones);
    onChange(newMilestones);
  };

  const handleChange = (index: number, field: keyof EditingMilestone, value: any) => {
    const newMilestones = [...editingMilestones];
    newMilestones[index] = {
      ...newMilestones[index],
      [field]: value
    };
    setEditingMilestones(newMilestones);
    onChange(newMilestones);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newMilestones = [...editingMilestones];
    [newMilestones[index - 1], newMilestones[index]] = [newMilestones[index], newMilestones[index - 1]];
    setEditingMilestones(newMilestones);
    onChange(newMilestones);
  };

  const handleMoveDown = (index: number) => {
    if (index === editingMilestones.length - 1) return;
    const newMilestones = [...editingMilestones];
    [newMilestones[index], newMilestones[index + 1]] = [newMilestones[index + 1], newMilestones[index]];
    setEditingMilestones(newMilestones);
    onChange(newMilestones);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Milestones</h3>
        <button
          onClick={handleAdd}
          className="px-3 py-1 bg-mint-500 hover:bg-mint-600 text-white rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Milestone
        </button>
      </div>

      <div className="space-y-3">
        {editingMilestones.map((milestone, index) => (
          <div
            key={milestone.id || `new-${index}`}
            className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg"
          >
            <div className="flex items-start gap-4">
              <div className="flex flex-col gap-2 mt-2">
                <button 
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  <GripVertical className="w-5 h-5 rotate-180" />
                </button>
                <button 
                  onClick={() => handleMoveDown(index)}
                  disabled={index === editingMilestones.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  <GripVertical className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  value={milestone.title || ''}
                  onChange={(e) => handleChange(index, 'title', e.target.value)}
                  placeholder="Milestone title"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                />
                <textarea
                  value={milestone.description || ''}
                  onChange={(e) => handleChange(index, 'description', e.target.value)}
                  placeholder="Description (optional)"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                  rows={2}
                />
                <div className="flex gap-4">
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">
                      Target Points
                    </label>
                    <input
                      type="number"
                      value={milestone.target_value || 0}
                      onChange={(e) => handleChange(index, 'target_value', parseInt(e.target.value) || 0)}
                      min={0}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">
                      Reward Points
                    </label>
                    <input
                      type="number"
                      value={milestone.reward_points || 0}
                      onChange={(e) => handleChange(index, 'reward_points', parseInt(e.target.value) || 0)}
                      min={0}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleRemove(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

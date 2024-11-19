import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { useProgressStore } from '../store/progressStore';

function ProgressGallery() {
  const { entries, loading } = useProgressStore();

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading progress...</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm">
        <p className="text-gray-600">No progress entries yet. Start by adding your first photo!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Progress Timeline</h2>
        <div className="flex space-x-2">
          <button className="p-2 rounded-lg hover:bg-gray-100">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entries.map((entry) => (
          <div key={entry.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all">
            <div className="aspect-w-4 aspect-h-3">
              <img 
                src={entry.image_url} 
                alt={`Progress from ${format(new Date(entry.created_at), 'PPP')}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <time>{format(new Date(entry.created_at), 'PPP')}</time>
              </div>
              {entry.notes && (
                <p className="text-gray-700 text-sm">{entry.notes}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProgressGallery;
import React from 'react';
import { BookOpen, Video, FileText, Star } from 'lucide-react';

const resources = [
  {
    id: '1',
    title: 'Face Yoga Fundamentals',
    description: 'Learn the basic principles and techniques of face yoga.',
    type: 'guide',
    icon: BookOpen,
  },
  {
    id: '2',
    title: 'Advanced Techniques',
    description: 'Deep dive into advanced face yoga exercises and routines.',
    type: 'video',
    icon: Video,
  },
  {
    id: '3',
    title: 'Scientific Research',
    description: 'Explore the science behind facial exercises and their benefits.',
    type: 'article',
    icon: FileText,
  },
  {
    id: '4',
    title: 'Success Stories',
    description: 'Read about real transformations and testimonials.',
    type: 'stories',
    icon: Star,
  },
];

function Resources() {
  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Learning Resources</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Expand your knowledge with our comprehensive collection of face yoga resources.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {resources.map(({ id, title, description, icon: Icon }) => (
          <div
            key={id}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Icon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600">{description}</p>
                <button className="mt-4 text-purple-600 font-medium hover:text-purple-700">
                  Learn more →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-purple-50 rounded-xl p-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Need Personal Guidance?</h2>
        <p className="text-gray-600 mb-6">
          Our AI coach is available 24/7 to answer your questions and provide personalized advice.
        </p>
        <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          Chat with AI Coach
        </button>
      </div>
    </div>
  );
}

export default Resources;
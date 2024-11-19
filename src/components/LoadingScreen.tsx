import React from 'react';
import { Loader } from 'lucide-react';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-mint-50">
      <div className="text-center">
        <Loader className="w-12 h-12 text-mint-600 animate-spin mx-auto mb-4" />
        <p className="text-mint-600 text-lg font-medium">Loading...</p>
      </div>
    </div>
  );
}

export default LoadingScreen;
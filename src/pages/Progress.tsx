import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Trash2 } from 'lucide-react';
import { useProgressStore } from '../store/progressStore';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import BackButton from '../components/BackButton';

function Progress() {
  const { user } = useAuth();
  const { entries, loading, deleteProgress, addProgress, fetchProgress } = useProgressStore();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isMobile] = useState(() => /iPhone|iPad|Android/i.test(navigator.userAgent));
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');

  useEffect(() => {
    if (user) {
      fetchProgress(user.id);
    }
  }, [user, fetchProgress]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        setError(null);
      } else {
        setError('Please select an image file.');
      }
    }
  };

  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setError(null);
    } catch (err) {
      setError('Unable to access camera. Please check your permissions.');
      console.error('Camera error:', err);
    }
  };

  const toggleCamera = async () => {
    setCameraFacing(prev => prev === 'user' ? 'environment' : 'user');
    if (streamRef.current) {
      await startCamera();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'progress-photo.jpg', { type: 'image/jpeg' });
            setSelectedImage(file);
            setPreview(canvas.toDataURL('image/jpeg'));
          }
        }, 'image/jpeg', 0.8);
      }
      stopCamera();
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedImage) {
      setError('Please select an image first.');
      return;
    }

    try {
      setError(null);
      await addProgress(user.id, selectedImage, notes);
      await fetchProgress(user.id);
      setSelectedImage(null);
      setPreview(null);
      setNotes('');
      toast.success('Progress saved successfully!');
    } catch (err) {
      setError('Failed to save progress. Please try again.');
      console.error('Upload error:', err);
      toast.error('Failed to save progress');
    }
  };

  const handleDeleteProgress = async (id: string) => {
    if (!user || isDeleting) return;

    if (!window.confirm('Are you sure you want to delete this progress photo?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteProgress(id);
      toast.success('Photo deleted successfully');
      await fetchProgress(user.id);
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete photo');
    } finally {
      setIsDeleting(false);
    }
  };

  const clearSelection = () => {
    setSelectedImage(null);
    setPreview(null);
    setError(null);
    stopCamera();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <BackButton />
          <h1 className="text-2xl font-bold">Progress Tracker</h1>
        </div>
      </div>

      <header className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Track Your Progress</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Document your face yoga journey with photos and see your transformation over time.
        </p>
      </header>

      <div className="bg-white rounded-xl shadow-sm p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center">
            <X className="w-5 h-5 mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!preview ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-mint-500 transition-colors"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Upload Photo</span>
                </button>

                <button
                  type="button"
                  onClick={startCamera}
                  className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-mint-500 transition-colors"
                >
                  <Camera className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Take Photo</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture={isMobile ? 'environment' : undefined}
                onChange={handleFileSelect}
                className="hidden"
              />

              {streamRef.current && (
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full rounded-lg"
                  />
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                    {isMobile && (
                      <button
                        type="button"
                        onClick={toggleCamera}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg"
                      >
                        Switch Camera
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="px-4 py-2 bg-mint-500 text-white rounded-lg hover:bg-mint-600 transition-colors"
                    >
                      Capture
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full rounded-lg"
              />
              <button
                type="button"
                onClick={clearSelection}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {preview && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-mint-500"
                  rows={3}
                  placeholder="Add any notes about your progress..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-mint-500 text-white rounded-lg hover:bg-mint-600 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Saving...
                  </>
                ) : 'Save Progress'}
              </button>
            </>
          )}
        </form>
      </div>

      {/* Progress Gallery */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Progress Timeline</h2>
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
                <div className="flex items-center justify-between">
                  <time className="text-sm text-gray-600">
                    {format(new Date(entry.created_at), 'PPP')}
                  </time>
                  <button
                    onClick={() => handleDeleteProgress(entry.id)}
                    disabled={isDeleting}
                    className="p-1 text-red-600 hover:text-red-700 disabled:opacity-50"
                    title="Delete photo"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                {entry.notes && (
                  <p className="text-gray-700 text-sm">{entry.notes}</p>
                )}
              </div>
            </div>
          ))}

          {entries.length === 0 && (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No progress photos yet. Start tracking your journey today!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Progress;
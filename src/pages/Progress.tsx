import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Camera, Upload, X, Trash2, CameraOff, RefreshCcw, ImagePlus, Calendar as CalendarIcon } from 'lucide-react';
import { useProgressStore } from '../store/progressStore';
import { useAuth } from '../hooks/useAuth';
import { format, isSameDay } from 'date-fns';
import toast from 'react-hot-toast';
import BackButton from '../components/BackButton';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styles from './Progress.module.css';

function Progress() {
  const { user } = useAuth();
  const { entries, loading, deleteProgress, addProgress, fetchProgress } = useProgressStore();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarView, setCalendarView] = useState<'month' | 'year'>('month');
  const [activeStartDate, setActiveStartDate] = useState<Date>(new Date());
  const [photoDates, setPhotoDates] = useState<Set<string>>(new Set());
  const [isComparing, setIsComparing] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
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

  useEffect(() => {
    if (!loading && entries.length > 0) {
      const dates = new Set<string>();
      entries.forEach((entry) => {
        if (entry.created_at) {
          const date = new Date(entry.created_at);
          dates.add(date.toISOString().split('T')[0]);
        }
      });
      setPhotoDates(dates);
    }
  }, [entries, loading]);

  const filteredEntries = useMemo(() => {
    if (!entries) return [];
    
    if (selectedDate) {
      // Filter by specific date
      return entries.filter(entry => 
        isSameDay(new Date(entry.created_at), selectedDate)
      );
    } else if (calendarView === 'month') {
      // Filter by active month
      return entries.filter(entry => {
        const entryDate = new Date(entry.created_at);
        return (
          entryDate.getMonth() === activeStartDate.getMonth() &&
          entryDate.getFullYear() === activeStartDate.getFullYear()
        );
      });
    } else {
      // Filter by active year
      return entries.filter(entry => {
        const entryDate = new Date(entry.created_at);
        return entryDate.getFullYear() === activeStartDate.getFullYear();
      });
    }
  }, [entries, selectedDate, calendarView, activeStartDate]);

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
      setIsCameraActive(true);
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
    setIsCameraActive(false);
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
      await addProgress(selectedImage, notes);
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
      setSelectedEntries([]);
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

  const toggleEntrySelection = (id: string) => {
    setSelectedEntries(prev => {
      if (prev.includes(id)) {
        return prev.filter(entryId => entryId !== id);
      }
      return [...prev, id];
    });
  };

  const startComparison = () => {
    if (selectedEntries.length < 2) {
      toast.error('Please select at least 2 photos to compare');
      return;
    }
    setIsComparing(true);
  };

  const handleDateClick = (value: Date) => {
    setSelectedDate(prev => prev && isSameDay(prev, value) ? null : value);
    setIsComparing(false);
    setSelectedEntries([]);
  };

  const handleActiveStartDateChange = ({ activeStartDate, view }: { activeStartDate: Date, view: 'month' | 'year' }) => {
    setActiveStartDate(activeStartDate);
    setCalendarView(view);
    setSelectedDate(null);
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().split('T')[0];
      if (photoDates.has(dateStr)) {
        return (
          <div className={styles.dotContainer}>
            <div className={styles.dot}></div>
          </div>
        );
      }
    }
    return null;
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().split('T')[0];
      return photoDates.has(dateStr) ? styles.hasEntries : '';
    }
    return '';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <BackButton />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Progress Tracker</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Photo Upload and Calendar */}
        <div className="lg:col-span-1 space-y-8">
          {/* Photo Upload Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Progress Photo</h2>
            
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-center">
                <X className="w-5 h-5 mr-2 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {!preview ? (
              <div className="space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-mint-500 dark:hover:border-mint-400 transition-colors group"
                >
                  <ImagePlus className="w-8 h-8 text-gray-400 dark:text-gray-500 group-hover:text-mint-500 transition-colors mb-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-mint-700 dark:group-hover:text-mint-400">Upload Photo</span>
                </button>

                {isMobile && (
                  <>
                    {!isCameraActive ? (
                      <button
                        type="button"
                        onClick={startCamera}
                        className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-mint-500 dark:hover:border-mint-400 transition-colors group"
                      >
                        <Camera className="w-8 h-8 text-gray-400 dark:text-gray-500 group-hover:text-mint-500 transition-colors mb-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-mint-700 dark:group-hover:text-mint-400">Take Photo</span>
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative rounded-lg overflow-hidden bg-black">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-64 object-cover"
                          />
                          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                            <button
                              type="button"
                              onClick={toggleCamera}
                              className="p-3 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors"
                            >
                              <RefreshCcw className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                            </button>
                            <button
                              type="button"
                              onClick={capturePhoto}
                              className="p-3 bg-mint-500 rounded-full hover:bg-mint-600 transition-colors"
                            >
                              <Camera className="w-6 h-6 text-white" />
                            </button>
                            <button
                              type="button"
                              onClick={stopCamera}
                              className="p-3 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors"
                            >
                              <CameraOff className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="absolute top-2 right-2 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>
                </div>

                <div className="space-y-4">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about your progress..."
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-mint-500 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400"
                    rows={3}
                  />

                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="w-full py-3 bg-mint-500 text-white rounded-lg hover:bg-mint-600 transition-colors font-medium"
                  >
                    Save Progress
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Calendar Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Progress Calendar</h2>
            <div className={styles.calendarContainer}>
              <Calendar
                onChange={handleDateClick}
                value={selectedDate}
                tileContent={tileContent}
                tileClassName={tileClassName}
                locale="en-US"
                onActiveStartDateChange={handleActiveStartDateChange}
                className="dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                {selectedDate 
                  ? `Photos from ${format(selectedDate, 'MMMM d, yyyy')}`
                  : calendarView === 'month'
                    ? `Photos from ${format(activeStartDate, 'MMMM yyyy')}`
                    : `Photos from ${format(activeStartDate, 'yyyy')}`}
              </h3>
            </div>
          </div>
        </div>

        {/* Progress Gallery Section */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Progress Timeline</h2>
                {selectedDate && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {format(selectedDate, 'MMMM d, yyyy')}
                  </span>
                )}
              </div>
              {entries.length > 0 && (
                <div className="flex items-center space-x-4">
                  {selectedEntries.length > 0 && (
                    <>
                      <button
                        onClick={() => setSelectedEntries([])}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      >
                        Clear Selection ({selectedEntries.length})
                      </button>
                      {selectedEntries.length >= 2 && (
                        <button
                          onClick={startComparison}
                          className="px-4 py-2 bg-mint-500 text-white rounded-lg hover:bg-mint-600 transition-colors text-sm font-medium"
                        >
                          Compare Selected
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-500 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading progress...</p>
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedDate 
                    ? `No progress entries for ${format(selectedDate, 'MMMM d, yyyy')}`
                    : calendarView === 'month'
                      ? `No progress entries for ${format(activeStartDate, 'MMMM yyyy')}`
                      : `No progress entries for ${format(activeStartDate, 'yyyy')}`}
                </p>
              </div>
            ) : isComparing ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Photo Comparison</h3>
                  <button
                    onClick={() => {
                      setIsComparing(false);
                      setSelectedEntries([]);
                    }}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    Exit Comparison
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {entries
                    .filter(entry => selectedEntries.includes(entry.id))
                    .map((entry) => (
                      <div key={entry.id} className="space-y-2">
                        <div className="aspect-w-4 aspect-h-3">
                          <img
                            src={entry.image_url}
                            alt={`Progress from ${format(new Date(entry.created_at), 'PPP')}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          <time>{format(new Date(entry.created_at), 'PPP')}</time>
                        </div>
                        {entry.notes && (
                          <p className="text-sm text-gray-700 dark:text-gray-300">{entry.notes}</p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className={`relative group rounded-xl overflow-hidden border-2 transition-all ${
                      selectedEntries.includes(entry.id)
                        ? 'border-mint-500 shadow-lg'
                        : 'border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                    }`}
                  >
                    <div
                      onClick={() => toggleEntrySelection(entry.id)}
                      className="cursor-pointer"
                    >
                      <div className="aspect-w-4 aspect-h-3">
                        <img
                          src={entry.image_url}
                          alt={`Progress from ${format(new Date(entry.created_at), 'PPP')}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          <time>{format(new Date(entry.created_at), 'PPP')}</time>
                        </div>
                        {entry.notes && (
                          <p className="text-sm text-gray-700 dark:text-gray-300">{entry.notes}</p>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteProgress(entry.id)}
                      className="absolute top-2 right-2 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full opacity-0 group-hover:opacity-100 hover:bg-white dark:hover:bg-gray-800 transition-all"
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Progress;
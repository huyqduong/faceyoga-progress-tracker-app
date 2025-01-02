import React, { useState, useRef, useEffect } from 'react';
import { Camera, Save, User, Mail, Phone, MapPin, UserCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useProfileStore } from '../store/profileStore';
import { supabaseApi } from '../lib/supabase';
import { statsApi } from '../api/statsApi';
import toast from 'react-hot-toast';
import BackButton from '../components/BackButton';
import UserProfile from '../components/profile/UserProfile';
import { useRewardStore } from '../store/rewardStore';

function Profile() {
  const { user, profile } = useAuth();
  const { updateProfile, fetchProfile } = useProfileStore();
  const { totalPoints, level, streakDays, achievements, fetchRewards, updateStreak } = useRewardStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stats, setStats] = useState({
    coursesEnrolled: 0,
    lessonsCompleted: 0,
    daysPracticed: 0
  });

  const [formData, setFormData] = useState({
    username: profile?.username || '',
    full_name: profile?.full_name || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      // Fetch user stats and rewards
      Promise.all([
        statsApi.getUserStats(user.id),
        fetchRewards(user.id)
      ]).then(([userStats]) => {
        // Update streak days based on stats
        if (userStats.daysPracticed !== streakDays) {
          updateStreak(user.id, userStats.daysPracticed);
        }
        setStats(userStats);
      }).catch(error => {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user data');
      }).finally(() => {
        setIsLoading(false);
      });
    }
  }, [user, fetchRewards, streakDays, updateStreak]);

  // Refresh rewards data when component mounts and when goals are updated
  useEffect(() => {
    if (user) {
      fetchRewards(user.id).catch(error => {
        console.error('Error refreshing rewards:', error);
      });
    }
  }, [user, fetchRewards]);

  // If no user, don't render the profile page
  if (!user) {
    return null;
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsUploading(true);
      // First upload the avatar and get the URL
      const publicUrl = await supabaseApi.uploadAvatar(user.id, file);
      
      // Then update the profile with the new avatar URL
      await updateProfile({
        user_id: user.id,
        avatar_url: publicUrl,
      });

      // Force a fresh profile fetch to ensure we have the latest data
      await fetchProfile(user.id);
      
      toast.success('Profile picture updated successfully');
    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to update profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSaving(true);

      await updateProfile({
        user_id: user.id,
        email: user.email!,
        username: formData.username,
        full_name: formData.full_name,
        phone: formData.phone,
        address: formData.address,
      });

      setHasChanges(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-mint-600 dark:border-mint-400"></div>
        </div>
      ) : (
        <>
          <div className="flex items-center mb-8">
            <BackButton />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white ml-4">My Profile</h1>
          </div>

          <div className="grid md:grid-cols-[350px_1fr] gap-8">
            {/* Left Column - Profile Photo and Stats */}
            <div className="space-y-6">
              {/* Profile Photo */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex flex-col items-center">
                  <div className="relative group">
                    <div className="w-40 h-40 rounded-full overflow-hidden bg-mint-50 dark:bg-mint-900/20 ring-4 ring-mint-100 dark:ring-mint-900/40">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserCircle className="w-full h-full text-mint-300 dark:text-mint-600" />
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="opacity-0 group-hover:opacity-100 p-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full hover:bg-mint-50 dark:hover:bg-mint-900/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Upload profile picture"
                        >
                          <Camera className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                  {isUploading && (
                    <div className="mt-4 flex items-center space-x-2 text-mint-600 dark:text-mint-400">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-mint-600 dark:border-mint-400"></div>
                      <p className="text-sm">Uploading image...</p>
                    </div>
                  )}
                  <div className="mt-4 text-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{formData.full_name || 'Your Name'}</h2>
                    <p className="text-gray-500 dark:text-gray-400">@{formData.username || 'username'}</p>
                  </div>
                </div>
              </div>

              {/* Activity Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activity Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Courses Enrolled</span>
                    <span className="font-medium">{stats.coursesEnrolled}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Lessons Completed</span>
                    <span className="font-medium">{stats.lessonsCompleted}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Days Practiced</span>
                    <span className="font-medium">{stats.daysPracticed}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Profile Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Profile Information</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Username
                    </label>
                    <div className="relative">
                      <User className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="pl-10 w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-500 dark:focus:ring-mint-400 focus:border-transparent transition-all duration-200"
                        placeholder="Enter username"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className="pl-10 w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-500 dark:focus:ring-mint-400 focus:border-transparent transition-all duration-200"
                        placeholder="Enter full name"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="pl-10 w-full p-3 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Phone
                  </label>
                  <div className="relative">
                    <Phone className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="pl-10 w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-500 dark:focus:ring-mint-400 focus:border-transparent transition-all duration-200"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="pl-10 w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-500 dark:focus:ring-mint-400 focus:border-transparent transition-all duration-200"
                      placeholder="Enter address"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSaving || !hasChanges}
                  className="w-full flex items-center justify-center space-x-2 bg-mint-500 dark:bg-mint-400 text-white p-3 rounded-lg hover:bg-mint-600 dark:hover:bg-mint-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white dark:border-gray-200"></div>
                      <span>Save Changes</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Achievements and Rewards Section */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Achievements & Rewards</h3>
            <UserProfile
              totalPoints={totalPoints}
              level={level}
              streakDays={streakDays}
              achievements={achievements}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default Profile;
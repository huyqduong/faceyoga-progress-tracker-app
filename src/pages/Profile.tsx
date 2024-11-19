import React, { useState, useRef } from 'react';
import { Camera, Save, User, Mail, Phone, MapPin, UserCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useProfileStore } from '../store/profileStore';
import { supabaseApi } from '../lib/supabase';
import toast from 'react-hot-toast';

function Profile() {
  const { user, profile } = useAuth();
  const { updateProfile } = useProfileStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // If no user, don't render the profile page
  if (!user) {
    return null;
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsUploading(true);
      const publicUrl = await supabaseApi.uploadAvatar(user.id, file);
      
      await updateProfile({
        user_id: user.id,
        avatar_url: publicUrl,
      });

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
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Profile Settings</h1>
        <p className="text-lg text-gray-600">
          Manage your account information and preferences
        </p>
      </header>

      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-mint-50">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserCircle className="w-full h-full text-mint-300" />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute bottom-0 right-0 p-2 bg-mint-500 text-white rounded-full hover:bg-mint-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Upload profile picture"
            >
              <Camera className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
          {isUploading && (
            <p className="mt-2 text-sm text-mint-600">Uploading image...</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="pl-10 w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className="pl-10 w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="pl-10 w-full p-2 border rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <div className="relative">
              <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="pl-10 w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <div className="relative">
              <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="pl-10 w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving || !hasChanges}
            className="w-full flex items-center justify-center space-x-2 bg-mint-500 text-white p-2 rounded-lg hover:bg-mint-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Saving Changes...</span>
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
  );
}

export default Profile;
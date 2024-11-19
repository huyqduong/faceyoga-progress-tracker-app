import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Save, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useSettingsStore } from '../../store/settingsStore';
import toast from 'react-hot-toast';

interface AppSettings {
  id: string;
  business_name: string;
  tagline: string;
  home_title: string;
  logo_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  social_links: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  about_text: string | null;
}

function SettingsManager() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const { fetchSettings } = useSettingsStore();
  const [formData, setFormData] = useState({
    business_name: '',
    tagline: '',
    home_title: '',
    contact_email: '',
    contact_phone: '',
    social_links: {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: ''
    },
    about_text: ''
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('*')
          .single();

        if (error) throw error;

        setSettings(data);
        setFormData({
          business_name: data.business_name || '',
          tagline: data.tagline || '',
          home_title: data.home_title || '',
          contact_email: data.contact_email || '',
          contact_phone: data.contact_phone || '',
          social_links: {
            ...data.social_links
          },
          about_text: data.about_text || ''
        });
      } catch (err) {
        console.error('Error fetching settings:', err);
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !settings) return;

    try {
      setLoading(true);
      
      // Upload new logo
      const fileExt = file.name.split('.').pop();
      const filePath = `logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      // Update settings with new logo URL
      const { error: updateError } = await supabase
        .from('app_settings')
        .update({ logo_url: publicUrl })
        .eq('id', settings.id);

      if (updateError) throw updateError;

      setSettings(prev => prev ? { ...prev, logo_url: publicUrl } : null);
      await fetchSettings(); // Refresh global settings
      toast.success('Logo updated successfully');
    } catch (err) {
      console.error('Error uploading logo:', err);
      toast.error('Failed to upload logo');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!settings?.logo_url) return;

    try {
      setLoading(true);

      // Extract filename from URL
      const url = new URL(settings.logo_url);
      const filePath = url.pathname.split('/').pop()!;

      // Remove file from storage
      const { error: removeError } = await supabase.storage
        .from('logos')
        .remove([filePath]);

      if (removeError) throw removeError;

      // Update settings
      const { error: updateError } = await supabase
        .from('app_settings')
        .update({ logo_url: null })
        .eq('id', settings.id);

      if (updateError) throw updateError;

      setSettings(prev => prev ? { ...prev, logo_url: null } : null);
      await fetchSettings(); // Refresh global settings
      toast.success('Logo removed successfully');
    } catch (err) {
      console.error('Error removing logo:', err);
      toast.error('Failed to remove logo');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('app_settings')
        .update({
          business_name: formData.business_name,
          tagline: formData.tagline,
          home_title: formData.home_title,
          contact_email: formData.contact_email || null,
          contact_phone: formData.contact_phone || null,
          social_links: formData.social_links,
          about_text: formData.about_text || null
        })
        .eq('id', settings.id);

      if (error) throw error;

      // Refresh global settings after update
      await fetchSettings();
      toast.success('Settings updated successfully');
    } catch (err) {
      console.error('Error saving settings:', err);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/admin')}
          className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Website Settings</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Logo Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Logo</h2>
          <div className="flex items-center space-x-6">
            <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {settings?.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt="Business Logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <Upload className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-mint-500 text-white rounded-lg hover:bg-mint-600 transition-colors"
              >
                Upload Logo
              </button>
              {settings?.logo_url && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="px-4 py-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Business Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name
              </label>
              <input
                type="text"
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Home Page Title
              </label>
              <input
                type="text"
                value={formData.home_title}
                onChange={(e) => setFormData({ ...formData, home_title: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Social Media Links</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Facebook
              </label>
              <input
                type="url"
                value={formData.social_links.facebook}
                onChange={(e) => setFormData({
                  ...formData,
                  social_links: { ...formData.social_links, facebook: e.target.value }
                })}
                className="w-full p-2 border rounded-lg"
                placeholder="https://facebook.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instagram
              </label>
              <input
                type="url"
                value={formData.social_links.instagram}
                onChange={(e) => setFormData({
                  ...formData,
                  social_links: { ...formData.social_links, instagram: e.target.value }
                })}
                className="w-full p-2 border rounded-lg"
                placeholder="https://instagram.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Twitter
              </label>
              <input
                type="url"
                value={formData.social_links.twitter}
                onChange={(e) => setFormData({
                  ...formData,
                  social_links: { ...formData.social_links, twitter: e.target.value }
                })}
                className="w-full p-2 border rounded-lg"
                placeholder="https://twitter.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                YouTube
              </label>
              <input
                type="url"
                value={formData.social_links.youtube}
                onChange={(e) => setFormData({
                  ...formData,
                  social_links: { ...formData.social_links, youtube: e.target.value }
                })}
                className="w-full p-2 border rounded-lg"
                placeholder="https://youtube.com/..."
              />
            </div>
          </div>
        </div>

        {/* About Text */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">About Text</h2>
          <textarea
            value={formData.about_text}
            onChange={(e) => setFormData({ ...formData, about_text: e.target.value })}
            className="w-full p-2 border rounded-lg"
            rows={6}
            placeholder="Enter your business description..."
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-mint-500 text-white rounded-lg hover:bg-mint-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SettingsManager;
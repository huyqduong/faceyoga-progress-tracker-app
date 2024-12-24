import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Save, Trash2, X, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useSettingsStore } from '../../store/settingsStore';
import toast from 'react-hot-toast';

interface AppSettings {
  id: string;
  business_name: string;
  tagline: string;
  home_title: string;
  home_subtitle: string;
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
    home_subtitle: '',
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
          home_subtitle: data.home_subtitle || '',
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
          home_subtitle: formData.home_subtitle,
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
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Website Settings</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Customize your website's appearance and content
        </p>
      </header>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-8">
        {/* Logo Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Logo</h2>
          <div className="flex items-center gap-6">
            {settings?.logo_url ? (
              <div className="relative">
                <img
                  src={settings.logo_url}
                  alt="Website Logo"
                  className="h-20 w-20 object-contain rounded-lg bg-gray-50 dark:bg-gray-700 p-2"
                />
                <button
                  onClick={handleRemoveLogo}
                  className="absolute -top-2 -right-2 p-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full hover:bg-red-200 dark:hover:bg-red-900/50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="h-20 w-20 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500">
                <Sparkles className="w-8 h-8" />
              </div>
            )}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleLogoUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-mint-500 hover:bg-mint-600 dark:bg-mint-600 dark:hover:bg-mint-700 text-white rounded-lg transition-colors"
              >
                Upload Logo
              </button>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Recommended size: 200x200 pixels
              </p>
            </div>
          </div>
        </section>

        {/* Settings Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Business Name
              </label>
              <input
                type="text"
                value={formData.business_name}
                onChange={(e) =>
                  setFormData({ ...formData, business_name: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-mint-500 dark:focus:ring-mint-400"
                placeholder="Enter business name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tagline
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) =>
                  setFormData({ ...formData, tagline: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-mint-500 dark:focus:ring-mint-400"
                placeholder="Enter tagline"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Home Title
              </label>
              <input
                type="text"
                value={formData.home_title}
                onChange={(e) =>
                  setFormData({ ...formData, home_title: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-mint-500 dark:focus:ring-mint-400"
                placeholder="Enter home title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Home Subtitle
              </label>
              <input
                type="text"
                value={formData.home_subtitle}
                onChange={(e) =>
                  setFormData({ ...formData, home_subtitle: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-mint-500 dark:focus:ring-mint-400"
                placeholder="Enter home subtitle"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) =>
                  setFormData({ ...formData, contact_email: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-mint-500 dark:focus:ring-mint-400"
                placeholder="Enter contact email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contact Phone
              </label>
              <input
                type="tel"
                value={formData.contact_phone}
                onChange={(e) =>
                  setFormData({ ...formData, contact_phone: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-mint-500 dark:focus:ring-mint-400"
                placeholder="Enter contact phone"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              About Text
            </label>
            <textarea
              value={formData.about_text}
              onChange={(e) =>
                setFormData({ ...formData, about_text: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-mint-500 dark:focus:ring-mint-400"
              placeholder="Enter about text"
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Social Links
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Facebook
                </label>
                <input
                  type="url"
                  value={formData.social_links.facebook}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      social_links: {
                        ...formData.social_links,
                        facebook: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-mint-500 dark:focus:ring-mint-400"
                  placeholder="Enter Facebook URL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Instagram
                </label>
                <input
                  type="url"
                  value={formData.social_links.instagram}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      social_links: {
                        ...formData.social_links,
                        instagram: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-mint-500 dark:focus:ring-mint-400"
                  placeholder="Enter Instagram URL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Twitter
                </label>
                <input
                  type="url"
                  value={formData.social_links.twitter}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      social_links: {
                        ...formData.social_links,
                        twitter: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-mint-500 dark:focus:ring-mint-400"
                  placeholder="Enter Twitter URL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  YouTube
                </label>
                <input
                  type="url"
                  value={formData.social_links.youtube}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      social_links: {
                        ...formData.social_links,
                        youtube: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-mint-500 dark:focus:ring-mint-400"
                  placeholder="Enter YouTube URL"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-mint-500 hover:bg-mint-600 dark:bg-mint-600 dark:hover:bg-mint-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SettingsManager;
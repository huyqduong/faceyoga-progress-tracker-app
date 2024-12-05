import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSettingsStore } from '../../store/settingsStore';

interface AppSettings {
  id: string;
  business_name: string;
  tagline: string;
  home_title: string;
  logo_url: string | null;
  description: string;
  contact_email: string | null;
  contact_phone: string | null;
  social_links: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  about_text: string | null;
  primary_color: string;
  secondary_color: string;
}

export default function AppSettings() {
  const { settings: globalSettings, fetchSettings } = useSettingsStore();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (globalSettings) {
      setSettings(globalSettings);
      if (globalSettings.logo_url) {
        setPreviewUrl(globalSettings.logo_url);
      }
      setIsLoading(false);
    }
  }, [globalSettings]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const uploadLogo = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('public')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('public')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let logoUrl = settings?.logo_url;

      if (logoFile) {
        logoUrl = await uploadLogo(logoFile);
      }

      const formData = new FormData(e.currentTarget);
      const socialLinks = {
        facebook: formData.get('facebook') as string || null,
        instagram: formData.get('instagram') as string || null,
        twitter: formData.get('twitter') as string || null,
        youtube: formData.get('youtube') as string || null,
      };

      const updates = {
        business_name: formData.get('businessName') as string,
        tagline: formData.get('tagline') as string,
        home_title: formData.get('homeTitle') as string,
        logo_url: logoUrl,
        description: formData.get('description') as string,
        contact_email: formData.get('contactEmail') as string,
        contact_phone: formData.get('contactPhone') as string,
        social_links: socialLinks,
        about_text: formData.get('aboutText') as string,
        primary_color: formData.get('primaryColor') as string,
        secondary_color: formData.get('secondaryColor') as string,
      };

      console.log('Updating settings with:', updates);
      console.log('Current settings ID:', settings?.id);

      const { data, error } = await supabase
        .from('app_settings')
        .update(updates)
        .eq('id', '2a7fcef4-2fc1-43d9-9231-ab071173f452')
        .select();

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      console.log('Update response:', data);

      // Force a fresh fetch from the database
      await fetchSettings();
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">App Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Name
            </label>
            <input
              type="text"
              name="businessName"
              defaultValue={settings?.business_name}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-mint-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tagline
            </label>
            <input
              type="text"
              name="tagline"
              defaultValue={settings?.tagline}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-mint-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Home Title
            </label>
            <input
              type="text"
              name="homeTitle"
              defaultValue={settings?.home_title}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-mint-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              defaultValue={settings?.description}
              rows={4}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-mint-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              About Text
            </label>
            <textarea
              name="aboutText"
              defaultValue={settings?.about_text || ''}
              rows={6}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-mint-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                name="contactEmail"
                defaultValue={settings?.contact_email || ''}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-mint-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone
              </label>
              <input
                type="tel"
                name="contactPhone"
                defaultValue={settings?.contact_phone || ''}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-mint-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  name="primaryColor"
                  defaultValue={settings?.primary_color || '#4FD1C5'}
                  className="h-10 w-20"
                />
                <input
                  type="text"
                  value={settings?.primary_color || '#4FD1C5'}
                  className="flex-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-mint-500"
                  readOnly
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  name="secondaryColor"
                  defaultValue={settings?.secondary_color || '#38B2AC'}
                  className="h-10 w-20"
                />
                <input
                  type="text"
                  value={settings?.secondary_color || '#38B2AC'}
                  className="flex-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-mint-500"
                  readOnly
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Social Links
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Facebook</label>
                <input
                  type="url"
                  name="facebook"
                  defaultValue={settings?.social_links?.facebook || ''}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-mint-500"
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Instagram</label>
                <input
                  type="url"
                  name="instagram"
                  defaultValue={settings?.social_links?.instagram || ''}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-mint-500"
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Twitter</label>
                <input
                  type="url"
                  name="twitter"
                  defaultValue={settings?.social_links?.twitter || ''}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-mint-500"
                  placeholder="https://twitter.com/..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">YouTube</label>
                <input
                  type="url"
                  name="youtube"
                  defaultValue={settings?.social_links?.youtube || ''}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-mint-500"
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo
            </label>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Logo preview"
                    className="h-24 w-24 object-contain border rounded-md"
                  />
                )}
              </div>
              <div className="flex-1">
                <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Upload className="h-5 w-5 mr-2" />
                  Choose Logo
                  <input
                    type="file"
                    onChange={handleLogoChange}
                    accept="image/*"
                    className="hidden"
                  />
                </label>
                <p className="mt-2 text-sm text-gray-500">
                  Recommended size: 200x200px. Max file size: 2MB
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-mint-600 hover:bg-mint-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mint-500 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

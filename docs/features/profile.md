# User Profile Feature Documentation

## Overview
The User Profile feature manages user personal information, preferences, and settings. It provides interfaces for users to customize their experience and manage their account settings.

## Architecture

### Data Model
```typescript
interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  preferences: UserPreferences;
  notification_settings: NotificationSettings;
  created_at: string;
  updated_at: string;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  email_notifications: boolean;
  practice_reminders: boolean;
  reminder_time?: string;
}

interface NotificationSettings {
  email_updates: boolean;
  practice_reminders: boolean;
  achievement_notifications: boolean;
  course_updates: boolean;
}
```

### State Management

#### Profile Store (`src/store/profileStore.ts`)
```typescript
interface ProfileState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isDirty: boolean;
}

const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  loading: false,
  error: null,
  isDirty: false,
  
  updateProfile: (updates: Partial<UserProfile>) =>
    set(state => ({
      profile: state.profile 
        ? { ...state.profile, ...updates }
        : null,
      isDirty: true
    }))
}));
```

## Components

### ProfileEditor (`src/components/ProfileEditor.tsx`)
Main profile editing component.

Props:
```typescript
interface ProfileEditorProps {
  userId: string;
  onSave?: (profile: UserProfile) => void;
  onCancel?: () => void;
}
```

### AvatarUploader (`src/components/AvatarUploader.tsx`)
Component for avatar image management.

```typescript
interface AvatarUploaderProps {
  currentUrl?: string;
  onUpload: (url: string) => void;
  size?: number;
}
```

### PreferencesPanel (`src/components/PreferencesPanel.tsx`)
Settings and preferences management panel.

Features:
- Theme selection
- Language preferences
- Notification settings
- Practice reminders

## Profile Management

### Data Updates
```typescript
const updateProfile = async (updates: Partial<UserProfile>) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', currentUserId);
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    handleProfileError(error);
    throw error;
  }
};
```

### Avatar Management
```typescript
const uploadAvatar = async (file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${uuid()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;
  
  const { error } = await supabase.storage
    .from('avatars')
    .upload(filePath, file);
    
  if (error) throw error;
  
  return getPublicUrl(filePath);
};
```

## Preferences Management

### Theme System
```typescript
const updateTheme = (theme: Theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
};
```

### Notification Preferences
```typescript
interface NotificationConfig {
  type: string;
  enabled: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly';
  time?: string;
}
```

## Data Persistence

### Storage Strategy
1. Local storage for preferences
2. Server sync for profile data
3. Cached avatar URLs

### Sync Management
```typescript
const syncProfile = async () => {
  if (!isDirty) return;
  
  try {
    await saveProfile(pendingChanges);
    set({ isDirty: false });
  } catch (error) {
    // Handle sync error
  }
};
```

## Error Handling

### Profile Updates
```typescript
const handleProfileError = (error: Error) => {
  if (error instanceof StorageError) {
    // Handle storage-related errors
  } else if (error instanceof ValidationError) {
    // Handle validation errors
  } else {
    // Handle general errors
  }
};
```

### Image Upload
- File size limits
- Format validation
- Upload failures

## Performance Optimization

### Image Processing
1. Client-side resizing
2. Format optimization
3. Progressive loading

### State Updates
```typescript
// Optimized preference updates
const updatePreferences = (updates: Partial<UserPreferences>) => {
  set(state => ({
    profile: state.profile ? {
      ...state.profile,
      preferences: {
        ...state.profile.preferences,
        ...updates
      }
    } : null
  }));
};
```

## Integration Points

### Authentication Integration
- Profile creation on signup
- Profile cleanup on account deletion
- Session management

### Progress Integration
- Achievement display
- Progress visualization
- Practice history

## Debugging

### Logging System
```typescript
// Profile event logging
[ProfileStore] Updating profile for ${userId}
[ProfileStore] Avatar upload started
[ProfileStore] Preferences updated: ${JSON.stringify(changes)}
```

### Common Issues
1. Profile Updates
   - Validation errors
   - Sync failures
   - Concurrent updates

2. Image Upload
   - Size limits
   - Format issues
   - Storage errors

## Recent Updates

### December 2024
1. Enhanced avatar management
2. Improved preference sync
3. Added theme system
4. Enhanced error handling
5. Added debug logging

### Planned Updates
1. Advanced preferences
2. Profile sharing
3. Social integration
4. Enhanced avatar editing
5. Backup/restore options

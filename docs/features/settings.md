# Settings Management Feature Documentation

## Overview
The Settings Management feature provides a centralized system for managing application settings. It handles both application-level settings with proper validation and persistence.

## Architecture

### Data Model
```typescript
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

interface SettingsState {
  settings: AppSettings | null;
  loading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
}
```

### State Management

The application uses Zustand for state management with a dedicated settings store that handles all settings-related operations:

```typescript
const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  loading: false,
  error: null,
  
  fetchSettings: async () => {
    // Fetches settings from Supabase
    // Creates default settings if none exist
  }
}));
```

### Default Settings
```typescript
const DEFAULT_SETTINGS = {
  id: '2a7fcef4-2fc1-43d9-9231-ab071173f452',
  business_name: 'Face Yoga App',
  description: 'Transform your face naturally with our guided face yoga exercises',
  primary_color: '#4FD1C5',
  secondary_color: '#38B2AC',
  tagline: 'Your Natural Face Transformation Journey',
  home_title: 'Welcome to Face Yoga',
  logo_url: null,
  contact_email: null,
  contact_phone: null,
  about_text: null,
  social_links: {
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: '',
  }
};
```

## Features

### Logo Management
- Upload custom logo (stored in Supabase Storage)
- Remove existing logo
- Recommended size: 200x200 pixels
- Supports common image formats

### Business Information
- Business name
- Tagline
- Home page title
- Contact information (email and phone)
- About text
- Brand colors (primary and secondary)

### Social Media Integration
- Facebook profile URL
- Instagram profile URL
- Twitter profile URL
- YouTube channel URL

## Components

### SettingsManager
The main administrative interface for managing application settings. Features:
- Logo upload and management
- Form-based settings configuration
- Real-time validation
- Automatic saving
- Dark mode support
- Responsive design

### Implementation Details

#### Data Storage
- Settings are stored in Supabase `app_settings` table
- Logo files are stored in Supabase Storage under the `logos` bucket
- Single settings record with a fixed UUID

#### Error Handling
- Validation for required fields
- Error messages for failed operations
- Fallback to default settings
- Toast notifications for operation status

#### Updates and Persistence
- Automatic creation of default settings if none exist
- Real-time updates to global state
- Optimistic updates for better UX
- Proper error handling and rollback

## Recent Updates

### December 2024
1. Added dark mode support for settings interface
2. Enhanced logo management with preview and remove functionality
3. Improved form validation and error handling
4. Added toast notifications for operation feedback
5. Implemented responsive design for mobile devices

### Planned Updates
1. Color picker for brand colors
2. Settings backup and restore
3. Advanced validation rules
4. Multi-language support
5. Settings history and versioning

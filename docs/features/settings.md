# Settings Management Feature Documentation

## Overview
The Settings Management feature provides a centralized system for managing user preferences, application configuration, and system settings. It handles both user-level and application-level settings with proper validation and persistence.

## Architecture

### Data Model
```typescript
interface UserSettings {
  id: string;
  user_id: string;
  theme: ThemePreference;
  language: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  practice: PracticeSettings;
  updated_at: string;
}

interface AppSettings {
  maintenance_mode: boolean;
  feature_flags: Record<string, boolean>;
  system_notifications: SystemNotification[];
  version: string;
}

interface SettingsMetadata {
  key: string;
  type: 'string' | 'boolean' | 'number' | 'object';
  default: any;
  validation?: ValidationRule[];
}
```

### State Management

#### Settings Store (`src/store/settingsStore.ts`)
```typescript
interface SettingsState {
  userSettings: UserSettings | null;
  appSettings: AppSettings;
  loading: boolean;
  error: string | null;
  unsavedChanges: boolean;
}

const useSettingsStore = create<SettingsState>((set) => ({
  userSettings: null,
  appSettings: defaultAppSettings,
  loading: false,
  error: null,
  unsavedChanges: false,
  
  updateSettings: (updates: Partial<UserSettings>) =>
    set(state => ({
      userSettings: state.userSettings
        ? { ...state.userSettings, ...updates }
        : null,
      unsavedChanges: true
    }))
}));
```

## Components

### SettingsPanel (`src/components/SettingsPanel.tsx`)
Main settings interface component.

```typescript
interface SettingsPanelProps {
  section?: SettingsSection;
  onSave?: () => void;
  onCancel?: () => void;
}
```

### SettingsForm (`src/components/SettingsForm.tsx`)
Form component for settings management.

Features:
- Dynamic form generation
- Validation
- Default values
- Change tracking

### SettingsSection (`src/components/SettingsSection.tsx`)
Individual settings section component.

```typescript
interface SettingsSectionProps {
  title: string;
  description?: string;
  settings: SettingsMetadata[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
}
```

## Settings Management

### Settings Registry
```typescript
const settingsRegistry = {
  theme: {
    key: 'theme',
    type: 'string',
    default: 'system',
    validation: [
      {
        type: 'enum',
        values: ['light', 'dark', 'system']
      }
    ]
  },
  
  language: {
    key: 'language',
    type: 'string',
    default: 'en',
    validation: [
      {
        type: 'enum',
        values: SUPPORTED_LANGUAGES
      }
    ]
  }
};
```

### Validation System
```typescript
const validateSetting = (
  key: string,
  value: any,
  rules?: ValidationRule[]
): ValidationResult => {
  if (!rules) return { valid: true };
  
  for (const rule of rules) {
    const result = validateRule(value, rule);
    if (!result.valid) return result;
  }
  
  return { valid: true };
};
```

## Data Persistence

### Storage Strategy
```typescript
const settingsStorage = {
  save: async (settings: UserSettings) => {
    const { error } = await supabase
      .from('user_settings')
      .upsert(settings);
      
    if (error) throw error;
    
    await syncLocalSettings(settings);
  },
  
  load: async (userId: string) => {
    const local = getLocalSettings(userId);
    const remote = await fetchRemoteSettings(userId);
    
    return mergeSettings(local, remote);
  }
};
```

### Change Management
```typescript
const handleSettingsChange = async (
  changes: Partial<UserSettings>
) => {
  // Validate changes
  const validation = validateSettings(changes);
  if (!validation.valid) {
    throw new ValidationError(validation.errors);
  }
  
  // Apply changes
  const updated = await settingsStorage.save(changes);
  
  // Notify systems
  await notifySettingsChange(updated);
};
```

## Feature Flags

### Flag Management
```typescript
interface FeatureFlag {
  key: string;
  enabled: boolean;
  conditions?: FlagCondition[];
}

const featureFlags = {
  check: (flagKey: string, context?: any): boolean => {
    const flag = getFlag(flagKey);
    if (!flag?.enabled) return false;
    
    return evaluateConditions(flag.conditions, context);
  },
  
  update: async (flagKey: string, enabled: boolean) => {
    await updateFlag(flagKey, enabled);
    await invalidateFlagCache(flagKey);
  }
};
```

### Flag Evaluation
```typescript
const evaluateConditions = (
  conditions: FlagCondition[],
  context: any
): boolean => {
  if (!conditions?.length) return true;
  
  return conditions.every(condition =>
    evaluateCondition(condition, context)
  );
};
```

## Theme Management

### Theme System
```typescript
const themeManager = {
  apply: (theme: ThemePreference) => {
    const actualTheme = resolveTheme(theme);
    document.documentElement.setAttribute('data-theme', actualTheme);
    storeThemePreference(theme);
  },
  
  resolveTheme: (preference: ThemePreference): Theme => {
    if (preference === 'system') {
      return getSystemTheme();
    }
    return preference;
  }
};
```

### Theme Switching
```typescript
const handleThemeChange = async (theme: ThemePreference) => {
  // Update theme
  themeManager.apply(theme);
  
  // Save preference
  await updateSettings({ theme });
  
  // Notify components
  emitThemeChange(theme);
};
```

## Performance Optimization

### Settings Caching
```typescript
const settingsCache = {
  get: (key: string) => {
    const cached = cache.get(key);
    if (cached && !isExpired(cached)) {
      return cached.value;
    }
    return null;
  },
  
  set: (key: string, value: any, ttl?: number) => {
    cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttl ?? DEFAULT_TTL
    });
  }
};
```

### Batch Updates
```typescript
const batchSettingsUpdate = async (
  updates: Record<string, any>
) => {
  const validated = await validateBatch(updates);
  
  if (validated.valid) {
    await settingsStorage.save(updates);
    await invalidateCache(Object.keys(updates));
  }
};
```

## Integration Points

### Theme Integration
- Component theming
- Dynamic styles
- Theme transitions

### Language Integration
- Translation loading
- RTL support
- Format handling

## Error Handling

### Settings Errors
```typescript
const handleSettingsError = (error: Error) => {
  if (error instanceof ValidationError) {
    return {
      type: 'validation',
      fields: error.fields,
      message: 'Invalid settings'
    };
  }
  
  if (error instanceof StorageError) {
    return {
      type: 'storage',
      retry: true,
      message: 'Failed to save settings'
    };
  }
  
  return {
    type: 'unknown',
    message: 'Settings error'
  };
};
```

### Recovery Strategies
- Default fallback
- Sync retry
- Validation bypass

## Debugging

### Logging System
```typescript
// Settings event logging
[SettingsStore] Updating setting: ${key}
[SettingsStore] Validation error: ${error}
[SettingsStore] Theme change: ${theme}
```

### Common Issues
1. Settings Sync
   - Sync conflicts
   - Storage failures
   - Cache invalidation

2. Validation
   - Invalid values
   - Missing defaults
   - Type mismatches

## Recent Updates

### December 2024
1. Enhanced validation system
2. Improved theme handling
3. Added feature flags
4. Enhanced caching
5. Added debug logging

### Planned Updates
1. Advanced validation
2. Bulk operations
3. Import/export
4. Settings profiles
5. Backup system

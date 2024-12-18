# Notifications Feature Documentation

## Overview
The Notifications feature manages in-app notifications, email notifications, and practice reminders. It provides a comprehensive system for keeping users engaged and informed about their progress, new content, and important updates.

## Architecture

### Data Model
```typescript
interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  created_at: string;
  expires_at?: string;
}

type NotificationType = 
  | 'achievement'
  | 'reminder'
  | 'course_update'
  | 'streak'
  | 'system';

interface NotificationPreferences {
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  types: {
    [K in NotificationType]: {
      enabled: boolean;
      email: boolean;
      push: boolean;
    }
  };
}
```

### State Management

#### Notification Store (`src/store/notificationStore.ts`)
```typescript
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  loading: boolean;
  error: string | null;
}

const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  preferences: defaultPreferences,
  loading: false,
  error: null,
  
  markAsRead: (id: string) => 
    set(state => ({
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: state.unreadCount - 1
    }))
}));
```

## Components

### NotificationCenter (`src/components/NotificationCenter.tsx`)
Main notification management interface.

```typescript
interface NotificationCenterProps {
  onNotificationClick?: (notification: Notification) => void;
  maxHeight?: number;
  showPreferences?: boolean;
}
```

### NotificationBell (`src/components/NotificationBell.tsx`)
Notification indicator component.

```typescript
interface NotificationBellProps {
  count?: number;
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
}
```

### NotificationPreferences (`src/components/NotificationPreferences.tsx`)
Settings panel for notification preferences.

Features:
- Email notification toggle
- Push notification settings
- Type-specific preferences
- Schedule management

## Notification Management

### Creation and Dispatch
```typescript
const createNotification = async (
  userId: string,
  type: NotificationType,
  data: NotificationData
) => {
  const notification = {
    id: generateId(),
    user_id: userId,
    type,
    ...data,
    read: false,
    created_at: new Date().toISOString()
  };
  
  await saveNotification(notification);
  await dispatchNotification(notification);
};
```

### Email Integration
```typescript
const sendEmailNotification = async (
  notification: Notification,
  userEmail: string
) => {
  const template = getEmailTemplate(notification.type);
  const content = template.render(notification);
  
  await emailService.send({
    to: userEmail,
    subject: notification.title,
    html: content
  });
};
```

## Push Notifications

### Service Worker Setup
```typescript
const registerPushNotifications = async () => {
  const registration = await navigator.serviceWorker.register(
    '/notification-worker.js'
  );
  
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: VAPID_PUBLIC_KEY
  });
  
  return subscription;
};
```

### Notification Worker
```typescript
// notification-worker.js
self.addEventListener('push', event => {
  const data = event.data.json();
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.message,
      icon: '/icon.png',
      data: { url: data.link }
    })
  );
});
```

## Reminder System

### Practice Reminders
```typescript
interface PracticeReminder {
  id: string;
  user_id: string;
  time: string; // HH:mm format
  days: number[]; // 0-6 for days of week
  enabled: boolean;
}

const scheduleReminder = async (reminder: PracticeReminder) => {
  const job = new CronJob(
    reminder.time,
    () => sendReminder(reminder),
    null,
    true,
    'UTC'
  );
  
  activeReminders.set(reminder.id, job);
};
```

### Streak Notifications
```typescript
const checkAndNotifyStreak = async (userId: string) => {
  const streak = await getStreakCount(userId);
  
  if (isStreakMilestone(streak)) {
    await createNotification(userId, 'streak', {
      title: 'Streak Milestone!',
      message: `You've maintained a ${streak} day streak!`
    });
  }
};
```

## Error Handling

### Notification Delivery
```typescript
const handleNotificationError = async (
  error: Error,
  notification: Notification
) => {
  if (error instanceof DeliveryError) {
    await retryNotification(notification);
  } else if (error instanceof PermissionError) {
    await updateUserPreferences(notification.user_id, {
      push_enabled: false
    });
  }
  // Log error for monitoring
  logger.error('Notification error', { error, notification });
};
```

### Permission Management
- Push notification permissions
- Email verification
- Preference validation

## Performance Optimization

### Notification Batching
```typescript
const batchNotifications = async (
  notifications: Notification[]
) => {
  const batches = chunk(notifications, 10);
  
  for (const batch of batches) {
    await Promise.all(
      batch.map(notification => dispatchNotification(notification))
    );
  }
};
```

### Caching Strategy
1. Local notification cache
2. Preference caching
3. Template preloading

## Integration Points

### Progress Integration
- Achievement notifications
- Streak updates
- Milestone alerts

### Course Integration
- Course updates
- New content alerts
- Deadline reminders

## Debugging

### Logging System
```typescript
// Notification event logging
[NotificationStore] Creating notification for ${userId}
[NotificationStore] Push notification sent
[NotificationStore] Email delivery failed: ${error}
```

### Common Issues
1. Delivery
   - Push notification failures
   - Email bounces
   - Permission issues

2. Timing
   - Reminder scheduling
   - Notification delays
   - Timezone handling

## Recent Updates

### December 2024
1. Enhanced push notifications
2. Improved email templates
3. Added reminder system
4. Enhanced error handling
5. Added debug logging

### Planned Updates
1. Rich notifications
2. Custom reminder rules
3. Notification analytics
4. Advanced filtering
5. Batch preferences

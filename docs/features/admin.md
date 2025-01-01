# Admin Panel Feature Documentation

## Overview
The Admin Panel provides comprehensive tools for platform management, user administration, content management, and system monitoring. It's designed for administrators to efficiently manage all aspects of the Face Yoga Progress Tracker app.

## Architecture

### Data Model
```typescript
interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'super_admin';
  permissions: Permission[];
  last_login: string;
}

interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  resource: string;
  details: Record<string, any>;
  timestamp: string;
}
```

### State Management

#### Admin Store (`src/store/adminStore.ts`)
```typescript
interface AdminState {
  currentAdmin: AdminUser | null;
  permissions: Permission[];
  auditLogs: AuditLog[];
  loading: boolean;
  error: string | null;
}

const useAdminStore = create<AdminState>((set) => ({
  currentAdmin: null,
  permissions: [],
  auditLogs: [],
  loading: false,
  error: null,
  
  setCurrentAdmin: (admin: AdminUser) =>
    set({ currentAdmin: admin }),
    
  updatePermissions: (permissions: Permission[]) =>
    set({ permissions })
}));
```

## Components

### AdminDashboard (`src/pages/Admin/Dashboard.tsx`)
Main dashboard component for administrative overview.

Features:
- Quick access to lesson management
- Quick access to course management
- Summary of available features
- Navigation to key admin functions

### LessonManager (`src/pages/Admin/LessonManager.tsx`)
Comprehensive lesson management interface.

Features:
- Create and edit lessons
- Manage lesson content and media
- Organize lesson order
- Preview lessons
- Bulk operations support

### CourseManager (`src/pages/Admin/CourseManager.tsx`)
Course administration interface.

Features:
- Course creation and editing
- Section management
- Lesson assignment to courses
- Course preview
- Publication controls

### SettingsManager (`src/pages/Admin/SettingsManager.tsx`)
Application settings management interface.

Features:
- Business information management
- Contact details configuration
- Social media links
- Theme customization
- Branding settings (logo, colors)

### FeedbackManager (`src/pages/Admin/FeedbackManager.tsx`)
User feedback management system.

Features:
- View and respond to user feedback
- Feedback categorization
- Analytics and reporting
- Action item tracking

## Navigation

The admin panel uses a sidebar navigation (`AdminSidebar.tsx`) with the following structure:

```typescript
const navigation = [
  {
    name: 'Back to Home',
    href: '/',
    icon: Home,
    isExternal: true,
  },
  {
    name: 'Dashboard',
    href: '/admin',
    icon: BarChart,
  },
  {
    name: 'Lesson Management',
    href: '/admin/lessons',
    icon: Dumbbell,
  },
  {
    name: 'Course Management',
    href: '/admin/courses',
    icon: Book,
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
  {
    name: 'Feedback',
    href: '/admin/feedback',
    icon: MessageSquare,
  }
];
```

## Access Control

### AdminGuard Component
The `AdminGuard` component (`src/components/AdminGuard.tsx`) provides route protection for admin-only pages:

```typescript
interface AdminGuardProps {
  children: React.ReactNode;
}
```

Features:
- Role-based access control
- Authentication verification
- Redirect to login for unauthenticated users
- Permission checking for specific routes

## Access Control

### Permission Management
```typescript
const checkPermission = (
  admin: AdminUser,
  resource: string,
  action: string
) => {
  const permission = admin.permissions.find(p => p.resource === resource);
  return permission?.actions.includes(action) ?? false;
};
```

### Role-Based Access
```typescript
const getRolePermissions = (role: string): Permission[] => {
  switch (role) {
    case 'super_admin':
      return ALL_PERMISSIONS;
    case 'admin':
      return ADMIN_PERMISSIONS;
    default:
      return [];
  }
};
```

## Audit System

### Action Logging
```typescript
const logAdminAction = async (
  adminId: string,
  action: string,
  details: Record<string, any>
) => {
  const log: AuditLog = {
    id: generateId(),
    admin_id: adminId,
    action,
    resource: details.resource,
    details,
    timestamp: new Date().toISOString()
  };
  
  await saveAuditLog(log);
};
```

### Audit Trail
```typescript
const getAuditTrail = async (
  filters: AuditLogFilters
): Promise<AuditLog[]> => {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .match(filters)
    .order('timestamp', { ascending: false });
    
  if (error) throw error;
  return data;
};
```

## User Management

### User Actions
```typescript
const userActions = {
  suspend: async (userId: string) => {
    await updateUserStatus(userId, 'suspended');
    await logAdminAction(getCurrentAdmin().id, 'suspend_user', {
      resource: 'user',
      userId
    });
  },
  
  resetPassword: async (userId: string) => {
    const resetToken = await generateResetToken(userId);
    await sendPasswordReset(userId, resetToken);
  },
  
  updateRole: async (userId: string, newRole: string) => {
    await updateUserRole(userId, newRole);
    await refreshUserPermissions(userId);
  }
};
```

### Bulk Operations
```typescript
const bulkUserUpdate = async (
  userIds: string[],
  update: Partial<User>
) => {
  const batches = chunk(userIds, 100);
  
  for (const batch of batches) {
    await Promise.all(
      batch.map(id => updateUser(id, update))
    );
  }
};
```

## Content Management

### Content Operations
```typescript
const contentManager = {
  publish: async (contentId: string, type: string) => {
    await updateContentStatus(contentId, 'published');
    await reindexContent(contentId);
  },
  
  unpublish: async (contentId: string) => {
    await updateContentStatus(contentId, 'draft');
    await removeFromIndex(contentId);
  },
  
  archive: async (contentId: string) => {
    await updateContentStatus(contentId, 'archived');
    await cleanupContent(contentId);
  }
};
```

### Batch Processing
```typescript
const batchContentUpdate = async (
  contentIds: string[],
  update: Partial<Content>
) => {
  const results = await Promise.allSettled(
    contentIds.map(id => updateContent(id, update))
  );
  
  return processResults(results);
};
```

## State Management

The application uses Zustand for state management with the following stores:

### Settings Store (`src/store/settingsStore.ts`)
```typescript
interface SettingsState {
  settings: AppSettings | null;
  loading: boolean;
  error: string | null;
  
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
}
```

### Lesson Store (`src/store/lessonStore.ts`)
```typescript
interface LessonState {
  lessons: Lesson[];
  currentLesson: Lesson | null;
  loading: boolean;
  error: string | null;

  fetchLessons: () => Promise<void>;
  createLesson: (lesson: LessonInput) => Promise<void>;
  updateLesson: (id: string, updates: Partial<Lesson>) => Promise<void>;
  deleteLesson: (id: string) => Promise<void>;
}
```

### Course Store (`src/store/courseStore.ts`)
```typescript
interface CourseState {
  courses: Course[];
  currentCourse: Course | null;
  loading: boolean;
  error: string | null;

  fetchCourses: () => Promise<void>;
  createCourse: (course: CourseInput) => Promise<void>;
  updateCourse: (id: string, updates: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
}
```

## Related Documentation

- [API Documentation](../api.md)
- [Security Guidelines](../security.md)
- [User Management](./auth.md)

## Admin System Documentation

The admin system provides comprehensive tools for managing the Face Yoga Progress Tracker application, including user management, content administration, and system monitoring.

## Core Features

### User Management
- View and manage user accounts
- Monitor user activity and engagement
- Handle user roles and permissions
- Review and moderate user content
- Manage user subscriptions

### Content Management
- Create and edit courses
- Manage lesson content
- Upload and manage video content
- Handle course prerequisites
- Control content visibility

### Analytics Dashboard
- User engagement metrics
- Course completion rates
- System performance stats
- User retention data
- Revenue analytics

### System Configuration
- Feature flag management
- System settings control
- API configuration
- Integration management
- Performance optimization

## Technical Implementation

### Admin Access Control
```typescript
interface AdminRole {
  id: string;
  name: 'super_admin' | 'content_admin' | 'support_admin';
  permissions: Permission[];
}

interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}
```

### User Management API
```typescript
interface AdminUserManagement {
  // User operations
  getUsers(filters: UserFilters): Promise<User[]>;
  updateUserRole(userId: string, role: string): Promise<void>;
  disableUser(userId: string): Promise<void>;
  enableUser(userId: string): Promise<void>;
  
  // Subscription management
  updateSubscription(userId: string, plan: string): Promise<void>;
  cancelSubscription(userId: string): Promise<void>;
  
  // Activity monitoring
  getUserActivity(userId: string): Promise<ActivityLog[]>;
  getLoginHistory(userId: string): Promise<LoginRecord[]>;
}
```

### Content Management System
```typescript
interface AdminContentManagement {
  // Course management
  createCourse(courseData: CourseInput): Promise<Course>;
  updateCourse(courseId: string, updates: CourseUpdates): Promise<Course>;
  deleteCourse(courseId: string): Promise<void>;
  
  // Lesson management
  createLesson(lessonData: LessonInput): Promise<Lesson>;
  updateLesson(lessonId: string, updates: LessonUpdates): Promise<Lesson>;
  deleteLesson(lessonId: string): Promise<void>;
  
  // Video content
  uploadVideo(file: File, metadata: VideoMetadata): Promise<string>;
  updateVideoMetadata(videoId: string, metadata: VideoMetadata): Promise<void>;
  deleteVideo(videoId: string): Promise<void>;
}
```

## Admin Dashboard

### User Management Interface
- User search and filtering
- Role assignment
- Account status management
- Activity monitoring
- Subscription management

### Content Management Interface
- Course creation wizard
- Lesson editor
- Video upload interface
- Content organization tools
- Preview functionality

### Analytics Interface
- Real-time metrics dashboard
- Custom report generation
- Data export functionality
- Trend visualization
- Performance monitoring

### System Management Interface
- Configuration panel
- Feature flag controls
- Integration settings
- Performance optimization tools
- Error monitoring

## Security Measures

### Access Control
1. Role-based access control (RBAC)
2. Two-factor authentication
3. Session management
4. IP whitelisting
5. Audit logging

### Data Protection
1. Encrypted sensitive data
2. Secure API endpoints
3. Rate limiting
4. Input validation
5. Output sanitization

## Best Practices

### User Management
1. Regular access review
2. Clear documentation of changes
3. Consistent permission structure
4. Audit trail maintenance
5. Privacy compliance

### Content Management
1. Content review process
2. Version control
3. Backup procedures
4. Quality assurance
5. Metadata management

### System Administration
1. Regular security updates
2. Performance monitoring
3. Backup verification
4. Error handling
5. Documentation maintenance

## Related Documentation
- [API Reference](../API.md)
- [Security Guidelines](../security.md)
- [User Management](./auth.md)
- [Analytics System](./analytics.md)

### Permission Management

Permissions are managed through a role-based access control system:

```typescript
interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

const checkPermission = (admin: AdminUser, resource: string, action: string) => {
  const permission = admin.permissions.find(p => p.resource === resource);
  return permission?.actions.includes(action) ?? false;
};
```

## State Management

The application uses Zustand for state management with the following stores:

### Settings Store (`src/store/settingsStore.ts`)
```typescript
interface SettingsState {
  settings: AppSettings | null;
  loading: boolean;
  error: string | null;
  
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
}
```

### Lesson Store (`src/store/lessonStore.ts`)
```typescript
interface LessonState {
  lessons: Lesson[];
  currentLesson: Lesson | null;
  loading: boolean;
  error: string | null;

  fetchLessons: () => Promise<void>;
  createLesson: (lesson: LessonInput) => Promise<void>;
  updateLesson: (id: string, updates: Partial<Lesson>) => Promise<void>;
  deleteLesson: (id: string) => Promise<void>;
}
```

### Course Store (`src/store/courseStore.ts`)
```typescript
interface CourseState {
  courses: Course[];
  currentCourse: Course | null;
  loading: boolean;
  error: string | null;

  fetchCourses: () => Promise<void>;
  createCourse: (course: CourseInput) => Promise<void>;
  updateCourse: (id: string, updates: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
}

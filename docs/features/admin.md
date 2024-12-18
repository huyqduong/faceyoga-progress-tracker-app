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

### AdminDashboard (`src/components/AdminDashboard.tsx`)
Main admin interface component.

```typescript
interface AdminDashboardProps {
  adminId: string;
  defaultView?: AdminView;
}
```

### UserManagement (`src/components/admin/UserManagement.tsx`)
User administration component.

Features:
- User listing
- Role management
- Account actions
- User search

### ContentManager (`src/components/admin/ContentManager.tsx`)
Content management interface.

```typescript
interface ContentManagerProps {
  contentType: 'course' | 'lesson' | 'practice';
  permissions: Permission[];
}
```

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

## System Monitoring

### Health Checks
```typescript
const systemHealth = {
  checkServices: async () => {
    const checks = await Promise.all([
      checkDatabase(),
      checkStorage(),
      checkCache(),
      checkQueue()
    ]);
    
    return aggregateHealthStatus(checks);
  },
  
  getMetrics: async () => {
    return {
      uptime: getUptime(),
      memory: getMemoryUsage(),
      activeUsers: getActiveUserCount(),
      errorRate: calculateErrorRate()
    };
  }
};
```

### Performance Monitoring
```typescript
const monitorPerformance = async () => {
  const metrics = {
    responseTime: await measureResponseTime(),
    throughput: calculateThroughput(),
    errorRate: getErrorRate(),
    resourceUsage: getResourceUsage()
  };
  
  await storeMetrics(metrics);
};
```

## Error Handling

### Admin Operations
```typescript
const handleAdminError = async (error: Error) => {
  if (error instanceof PermissionError) {
    await logSecurityEvent(error);
    return {
      message: 'Insufficient permissions',
      code: 'PERMISSION_DENIED'
    };
  }
  
  if (error instanceof ValidationError) {
    return {
      message: 'Invalid input',
      details: error.details
    };
  }
  
  await logError(error);
  return {
    message: 'Operation failed',
    retry: true
  };
};
```

### Error Recovery
- Automatic retries
- Fallback options
- Data validation

## Performance Optimization

### Data Loading
1. Pagination
2. Lazy loading
3. Data caching

### Operation Batching
```typescript
const batchOperations = async (
  operations: AdminOperation[]
) => {
  const batches = chunk(operations, 10);
  
  for (const batch of batches) {
    await Promise.all(
      batch.map(operation => executeOperation(operation))
    );
  }
};
```

## Debugging

### Logging System
```typescript
// Admin action logging
[AdminStore] Admin action: ${action}
[AdminStore] Permission check: ${resource}:${action}
[AdminStore] Error in operation: ${error}
```

### Common Issues
1. Permissions
   - Access denied
   - Role conflicts
   - Permission sync

2. Operations
   - Batch failures
   - Validation errors
   - Timeout issues

## Recent Updates

### December 2024
1. Enhanced audit system
2. Improved user management
3. Added batch operations
4. Enhanced monitoring
5. Added debug logging

### Planned Updates
1. Advanced analytics
2. Bulk operations
3. Custom roles
4. Audit improvements
5. Performance tools

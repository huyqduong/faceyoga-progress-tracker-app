# Authentication Feature Documentation

## Overview
The Authentication feature manages user authentication, authorization, and session management using Supabase Auth. It provides secure access control and user management capabilities.

## Architecture

### Data Model
```typescript
interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'user' | 'admin';
  created_at: string;
  last_login: string;
}

interface Session {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  user: User;
}
```

### State Management

#### Auth Store (`src/store/authStore.ts`)
```typescript
interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;
}

const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: false,
  error: null,
  
  setSession: (session: Session | null) => 
    set({ session, user: session?.user ?? null }),
  
  clearSession: () => 
    set({ session: null, user: null }),
}));
```

## Components

### AuthProvider (`src/components/AuthProvider.tsx`)
Context provider for authentication state.

```typescript
interface AuthContextType {
  session: Session | null;
  user: User | null;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}
```

### LoginForm (`src/components/LoginForm.tsx`)
Form component for user authentication.

Props:
```typescript
interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  redirectTo?: string;
}
```

### ProtectedRoute (`src/components/ProtectedRoute.tsx`)
Route wrapper for authenticated access.

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin';
  redirectTo?: string;
}
```

## Authentication Flow

### Sign In Process
```typescript
const signIn = async (credentials: SignInCredentials) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });
    
    if (error) throw error;
    
    await initializeUserData(data.user.id);
    return data;
  } catch (error) {
    handleAuthError(error);
    throw error;
  }
};
```

### Session Management
1. Token refresh
2. Session persistence
3. Auto-logout on expiry

## Authorization

### Role-Based Access Control
```typescript
const checkAccess = (user: User, requiredRole: string) => {
  if (!user) return false;
  if (requiredRole === 'admin') return user.role === 'admin';
  return true;
};
```

### Protected Routes
```typescript
const routes = [
  {
    path: '/admin',
    component: AdminDashboard,
    requiredRole: 'admin'
  },
  {
    path: '/profile',
    component: UserProfile,
    requiredRole: 'user'
  }
];
```

## Security Measures

### Password Security
1. Minimum requirements
2. Hash verification
3. Reset flow

### Token Management
```typescript
const refreshSession = async () => {
  const { data, error } = await supabase.auth.refreshSession();
  if (error) {
    await handleSessionError(error);
    return;
  }
  updateSession(data.session);
};
```

## Error Handling

### Authentication Errors
```typescript
const handleAuthError = (error: AuthError) => {
  switch (error.status) {
    case 401:
      return 'Invalid credentials';
    case 404:
      return 'User not found';
    case 429:
      return 'Too many attempts';
    default:
      return 'Authentication failed';
  }
};
```

### Session Errors
- Token expiration
- Invalid tokens
- Network issues

## Performance Optimization

### Token Storage
1. Secure storage
2. Background refresh
3. Cleanup on logout

### State Updates
```typescript
// Optimized state updates
const updateUserData = async (userData: Partial<User>) => {
  set(state => ({
    user: state.user ? { ...state.user, ...userData } : null
  }));
};
```

## Integration Points

### API Integration
- Authentication headers
- Token injection
- Error handling

### User Profile
- Profile management
- Settings synchronization
- Preferences storage

## Debugging

### Logging System
```typescript
// Auth event logging
[AuthStore] Sign in attempt for ${email}
[AuthStore] Token refresh at ${timestamp}
[AuthStore] Session expired for ${userId}
```

### Common Issues
1. Authentication
   - Invalid credentials
   - Account verification
   - Password reset

2. Session Management
   - Token expiration
   - Refresh failures
   - Storage issues

## Recent Updates

### December 2024
1. Enhanced session management
2. Improved error handling
3. Added role-based access
4. Enhanced security measures
5. Added debug logging

### Planned Updates
1. Social authentication
2. Multi-factor authentication
3. Enhanced session security
4. Improved error recovery
5. Advanced user roles

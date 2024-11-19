# Face Yoga Progress Tracker - Architecture Documentation

## System Architecture

The application follows a modern client-server architecture with the following key components:

### Frontend Architecture

```mermaid
graph TD
    App[App.tsx] --> Router[React Router]
    Router --> Pages[Pages]
    Router --> Guards[Auth Guards]
    
    Pages --> Components[Components]
    Pages --> Hooks[Custom Hooks]
    Pages --> Store[Zustand Store]
    
    Store --> API[API Layer]
    API --> Supabase[Supabase Client]
    API --> OpenAI[OpenAI Client]
```

### Backend Architecture

```mermaid
graph TD
    API[FastAPI] --> Auth[Authentication]
    API --> Routes[Routes]
    Routes --> Controllers[Controllers]
    Controllers --> Database[Supabase Database]
    Controllers --> Storage[Supabase Storage]
```

## Component Architecture

### Core Components

1. **Authentication Flow**
```mermaid
sequenceDiagram
    participant User
    participant AuthComponent
    participant AuthStore
    participant SupabaseAuth
    
    User->>AuthComponent: Login/Signup
    AuthComponent->>SupabaseAuth: Authenticate
    SupabaseAuth-->>AuthStore: Update State
    AuthStore-->>AuthComponent: Reflect Changes
    AuthComponent->>User: Redirect/Response
```

2. **Exercise Management**
```mermaid
sequenceDiagram
    participant Admin
    participant ExerciseManager
    participant ExerciseStore
    participant Database
    
    Admin->>ExerciseManager: CRUD Operation
    ExerciseManager->>ExerciseStore: Update State
    ExerciseStore->>Database: Persist Changes
    Database-->>ExerciseStore: Confirm
    ExerciseStore-->>ExerciseManager: Update UI
```

3. **Progress Tracking**
```mermaid
sequenceDiagram
    participant User
    participant ProgressComponent
    participant ProgressStore
    participant Storage
    participant Database
    
    User->>ProgressComponent: Upload Photo
    ProgressComponent->>Storage: Store Image
    Storage-->>ProgressComponent: Image URL
    ProgressComponent->>Database: Save Progress
    Database-->>ProgressStore: Update State
    ProgressStore-->>ProgressComponent: Update UI
```

## State Management Architecture

### Store Structure

```typescript
interface RootStore {
  auth: AuthStore;
  profile: ProfileStore;
  exercises: ExerciseStore;
  courses: CourseStore;
  progress: ProgressStore;
  chat: ChatStore;
}

interface AuthStore {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

interface ProfileStore {
  profile: Profile | null;
  loading: boolean;
  error: Error | null;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

// ... other store interfaces
```

## Database Architecture

### Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ PROFILES : has
    USERS ||--o{ PROGRESS : tracks
    EXERCISES ||--o{ PROGRESS : includes
    COURSES ||--|{ SECTIONS : contains
    SECTIONS ||--|{ SECTION_EXERCISES : contains
    EXERCISES ||--o{ SECTION_EXERCISES : includes
    
    USERS {
        uuid id PK
        string email
        string password_hash
    }
    
    PROFILES {
        uuid id PK
        uuid user_id FK
        string username
        string full_name
        string avatar_url
        string role
    }
    
    EXERCISES {
        uuid id PK
        string title
        string duration
        string target_area
        string description
        string image_url
        string video_url
        string category
        string difficulty
        string[] instructions
        string[] benefits
    }
    
    PROGRESS {
        uuid id PK
        uuid user_id FK
        uuid exercise_id FK
        string image_url
        string notes
        timestamp created_at
    }
    
    COURSES {
        uuid id PK
        string title
        string description
        string image_url
        string difficulty
        string duration
    }
    
    SECTIONS {
        uuid id PK
        uuid course_id FK
        string title
        string description
        integer order_index
    }
    
    SECTION_EXERCISES {
        uuid id PK
        uuid section_id FK
        uuid exercise_id FK
        integer order_index
    }
```

## Security Architecture

### Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant AuthGuard
    participant SupabaseAuth
    participant RLS
    participant Database
    
    Client->>AuthGuard: Request Protected Route
    AuthGuard->>SupabaseAuth: Verify Token
    SupabaseAuth-->>AuthGuard: Token Valid
    AuthGuard->>RLS: Apply Policies
    RLS->>Database: Filtered Query
    Database-->>Client: Protected Data
```

### Row Level Security

```sql
-- Example RLS Policies
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage exercises"
ON exercises
USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
));
```

## API Architecture

### RESTful Endpoints

```typescript
interface APIEndpoints {
  auth: {
    signIn: '/auth/signin' // POST
    signUp: '/auth/signup' // POST
    signOut: '/auth/signout' // POST
  }
  profiles: {
    get: '/profiles/:id' // GET
    update: '/profiles/:id' // PUT
    uploadAvatar: '/profiles/:id/avatar' // POST
  }
  exercises: {
    list: '/exercises' // GET
    create: '/exercises' // POST
    update: '/exercises/:id' // PUT
    delete: '/exercises/:id' // DELETE
  }
  progress: {
    list: '/progress' // GET
    create: '/progress' // POST
    delete: '/progress/:id' // DELETE
  }
  courses: {
    list: '/courses' // GET
    create: '/courses' // POST
    update: '/courses/:id' // PUT
    delete: '/courses/:id' // DELETE
    sections: '/courses/:id/sections' // GET, POST
  }
}
```

## Storage Architecture

### File Storage Structure

```
storage/
├── avatars/
│   └── {user_id}/
│       └── avatar.{ext}
├── progress/
│   └── {user_id}/
│       └── {timestamp}.{ext}
└── exercises/
    └── {exercise_id}.{ext}
```

## Integration Architecture

### Third-party Services

```mermaid
graph TD
    App[Application] --> Supabase[Supabase]
    App --> OpenAI[OpenAI]
    
    Supabase --> Auth[Authentication]
    Supabase --> DB[Database]
    Supabase --> Storage[File Storage]
    
    OpenAI --> Assistant[AI Coach]
    OpenAI --> Completion[Text Generation]
```

This architecture documentation provides a comprehensive overview of the system's structure and components. For specific implementation details, refer to the inline code documentation and the README.md file.
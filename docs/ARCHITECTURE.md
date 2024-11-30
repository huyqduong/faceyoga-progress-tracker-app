# Face Yoga Progress Tracker Architecture

## System Architecture

### High-Level Overview

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[React UI Components]
        State[Zustand State Management]
        API[API Client Layer]
    end

    subgraph "Backend Layer"
        Auth[Supabase Auth]
        DB[(Supabase PostgreSQL)]
        Storage[Supabase Storage]
    end

    UI --> State
    State --> API
    API --> Auth
    API --> DB
    API --> Storage
    Auth --> DB
```

### Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant Auth as Supabase Auth
    participant DB as Database

    U->>FE: Login Request
    FE->>Auth: Authenticate
    Auth->>DB: Verify Credentials
    DB->>Auth: Return User Data
    Auth->>FE: JWT Token
    FE->>U: Login Success
    Note over FE: Store Token in Local Storage
```

### Exercise Management Flow

```mermaid
sequenceDiagram
    participant A as Admin
    participant FE as Frontend
    participant RPC as Stored Procedures
    participant DB as Database
    participant Policy as RLS Policies

    A->>FE: Update Exercise
    FE->>RPC: Call update_exercise
    RPC->>Policy: Check Admin Status
    Policy->>DB: Verify Role
    DB->>Policy: Return Status
    alt is admin
        Policy->>RPC: Allow Update
        RPC->>DB: Update Exercise
        DB->>FE: Return Updated Data
    else not admin
        Policy->>RPC: Deny Update
        RPC->>FE: Return Error
    end
```

### Data Access Control

```mermaid
flowchart TD
    subgraph "Access Control"
        Auth[Authentication]
        RLS[Row Level Security]
        Proc[Stored Procedures]
    end

    subgraph "Tables"
        P[Profiles]
        E[Exercises]
        EH[Exercise History]
        C[Courses]
    end

    Auth --> RLS
    RLS --> P
    RLS --> E
    RLS --> EH
    RLS --> C
    
    Proc --> P
    Proc --> E
```

## Component Architecture

### Frontend Structure

```mermaid
graph TD
    subgraph "Pages"
        Home
        Exercises
        Courses
        Profile
        Admin
    end

    subgraph "Components"
        ExerciseCard
        CourseCard
        Navigation
        Forms
    end

    subgraph "State Management"
        Store[Zustand Store]
        subgraph "Stores"
            UserStore
            ExerciseStore
            CourseStore
        end
    end

    Pages --> Components
    Components --> Store
    Store --> Stores
```

### State Management Flow

```mermaid
flowchart LR
    subgraph "UI Layer"
        Components
        Pages
    end

    subgraph "State Layer"
        Store[Zustand Store]
        Actions[Store Actions]
        State[Store State]
    end

    subgraph "Data Layer"
        API[API Client]
        Cache[State Cache]
    end

    Components --> Store
    Pages --> Store
    Store --> Actions
    Store --> State
    Actions --> API
    State --> Cache
```

## Database Schema

### Core Tables Relationship

```mermaid
erDiagram
    USERS ||--o{ PROFILES : has
    PROFILES ||--o{ EXERCISE_HISTORY : tracks
    EXERCISES ||--o{ EXERCISE_HISTORY : includes
    COURSES ||--o{ COURSE_SECTIONS : contains
    COURSE_SECTIONS ||--o{ SECTION_EXERCISES : contains
    EXERCISES ||--o{ SECTION_EXERCISES : includes
    USERS ||--o{ COURSE_PURCHASES : makes
    COURSES ||--o{ COURSE_PURCHASES : involves
    USERS ||--o{ COURSE_ACCESS : has
    COURSES ||--o{ COURSE_ACCESS : grants
```

## Security Architecture

### Row Level Security Flow

```mermaid
flowchart TD
    subgraph "Request Flow"
        Client[Client Request]
        Auth[Auth Check]
        RLS[RLS Policies]
        Proc[Stored Procedures]
        Data[Data Access]
    end

    Client --> Auth
    Auth --> RLS
    RLS --> Proc
    Proc --> Data

    subgraph "Policy Types"
        Select[SELECT Policies]
        Insert[INSERT Policies]
        Update[UPDATE Policies]
        Delete[DELETE Policies]
    end

    RLS --> Select
    RLS --> Insert
    RLS --> Update
    RLS --> Delete
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Client Side"
        Browser[Web Browser]
        PWA[Progressive Web App]
    end

    subgraph "Hosting"
        Vercel[Vercel Frontend]
    end

    subgraph "Backend Services"
        Supabase[Supabase Platform]
        subgraph "Supabase Services"
            Auth[Authentication]
            DB[PostgreSQL Database]
            Storage[File Storage]
        end
    end

    Browser --> Vercel
    PWA --> Vercel
    Vercel --> Supabase
    Supabase --> Auth
    Supabase --> DB
    Supabase --> Storage
```

## Implementation Details

### Exercise Update Flow

```mermaid
sequenceDiagram
    participant UI as User Interface
    participant Store as Zustand Store
    participant API as API Client
    participant RPC as Stored Procedure
    participant DB as Database

    UI->>Store: Update Exercise
    Store->>API: Call updateExercise
    API->>RPC: Execute update_exercise
    RPC->>DB: Check Admin Status
    DB->>RPC: Return Status
    alt is admin
        RPC->>DB: Update Exercise
        DB->>RPC: Return Updated Data
        RPC->>API: Return Success
        API->>Store: Update State
        Store->>UI: Render Update
    else not admin
        RPC->>API: Return Error
        API->>Store: Set Error State
        Store->>UI: Show Error
    end
```

## Performance Considerations

### Data Loading Strategy

```mermaid
graph TD
    subgraph "Initial Load"
        First[First Paint]
        Shell[App Shell]
        Data[Critical Data]
    end

    subgraph "Lazy Loading"
        Course[Course Data]
        Exercise[Exercise Data]
        History[User History]
    end

    subgraph "Caching"
        Memory[Memory Cache]
        Storage[Local Storage]
    end

    First --> Shell
    Shell --> Data
    Data --> Course
    Data --> Exercise
    Course --> Memory
    Exercise --> Memory
    Memory --> Storage
```

## Error Handling

### Error Flow

```mermaid
flowchart TD
    subgraph "Error Sources"
        API[API Errors]
        Auth[Auth Errors]
        Val[Validation Errors]
    end

    subgraph "Error Handling"
        Catch[Error Boundary]
        Log[Error Logging]
        UI[User Feedback]
    end

    API --> Catch
    Auth --> Catch
    Val --> Catch
    Catch --> Log
    Catch --> UI
```

## Future Considerations

### Planned Improvements

```mermaid
graph LR
    subgraph "Current"
        Basic[Basic Features]
        Auth[Authentication]
        Data[Data Management]
    end

    subgraph "Short Term"
        Cache[Caching]
        Offline[Offline Support]
        Analytics[Usage Analytics]
    end

    subgraph "Long Term"
        AI[AI Features]
        Social[Social Features]
        Scale[Scalability]
    end

    Basic --> Cache
    Auth --> Offline
    Data --> Analytics
    Cache --> AI
    Offline --> Social
    Analytics --> Scale
```
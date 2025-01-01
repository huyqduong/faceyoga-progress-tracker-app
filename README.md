# Renew and Glow Face Yoga

A comprehensive face yoga application built with React, TypeScript, and Supabase.

## Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- A Supabase account
- An OpenAI account (for AI coaching features)

## Environment Setup

1. Create a `.env` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL='your_supabase_url'
VITE_SUPABASE_ANON_KEY='your_supabase_anon_key'

VITE_OPENAI_API_KEY='your_openai_api_key'
VITE_OPENAI_ASSISTANT_ID='your_openai_assistant_id'
```

## Database Setup

1. Create a new Supabase project
2. Run the migration scripts in order from the `supabase/migrations` folder
3. Enable Storage and create the following buckets:
   - `avatars` (public)
   - `progress` (public)
   - `exercises` (public)

## Installation

```bash
# Install dependencies
npm install
```

## Development

```bash
# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```bash
src/
├── components/        # Reusable UI components
├── hooks/            # Custom React hooks
├── lib/              # Core utilities and API clients
├── pages/            # Page components
├── store/            # Global state management
└── types/            # TypeScript type definitions
```

## Key Features

- User authentication with Supabase
- Face yoga exercise management
- Progress tracking with:
  - Practice time tracking
  - Daily streak calculation
  - Lesson completion history
  - Visual progress charts
- AI-powered coaching
- Course management system
- Admin dashboard

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Database Schema

### Profiles
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users,
    email TEXT,
    username TEXT,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user',
    streak INTEGER DEFAULT 0,
    lessons_completed INTEGER DEFAULT 0,
    practice_time INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Lesson History
```sql
CREATE TABLE lesson_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    practice_time INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Exercises
```sql
CREATE TABLE exercises (
    id UUID PRIMARY KEY,
    title TEXT,
    duration TEXT,
    target_area TEXT,
    description TEXT,
    image_url TEXT,
    video_url TEXT,
    category TEXT,
    difficulty TEXT,
    instructions TEXT[],
    benefits TEXT[]
);
```

### Courses
```sql
CREATE TABLE courses (
    id UUID PRIMARY KEY,
    title TEXT,
    description TEXT,
    image_url TEXT,
    difficulty TEXT,
    duration TEXT
);
```

### Course Sections
```sql
CREATE TABLE course_sections (
    id UUID PRIMARY KEY,
    course_id UUID REFERENCES courses,
    title TEXT,
    description TEXT,
    order_index INTEGER
);
```

### Section Exercises
```sql
CREATE TABLE section_exercises (
    id UUID PRIMARY KEY,
    section_id UUID REFERENCES course_sections,
    exercise_id UUID REFERENCES exercises,
    order_index INTEGER
);
```

## Progress Tracking

The app includes comprehensive progress tracking features:

### Practice Time
- Tracks time spent on each lesson in minutes
- Records practice time in both lesson history and user profile
- Displays total practice time in hours and minutes format
- Shows daily practice time in an interactive chart
- Automatically updates profile's practice time on lesson completion

### Lesson History
- Records each completed lesson with timestamp
- Stores practice time per lesson in minutes
- Maintains completion timestamps for streak calculation
- Used for progress visualization and stats
- Enables detailed practice analytics

### Daily Streak
- Tracks consecutive days of practice
- Maintains streak for multiple lessons in one day
- Increments streak for consecutive days
- Resets streak after missed days
- Shows current streak on dashboard

### Progress Charts
- Visual representation of practice time
- Last 7 days practice history
- Interactive tooltips with daily stats
- Total practice time overview

## Authentication

The app uses Supabase Authentication with the following features:
- Email/Password authentication
- Google OAuth
- Password reset
- Email verification

## Storage

Files are stored in Supabase Storage with the following structure:
- `/avatars/{user_id}/avatar.{ext}` - User profile pictures
- `/progress/{user_id}/{timestamp}.{ext}` - Progress photos
- `/exercises/{exercise_id}.{ext}` - Exercise images and videos

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License
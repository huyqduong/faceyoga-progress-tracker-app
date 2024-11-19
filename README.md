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

```
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
- Progress tracking with photo uploads
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
    exercises_done INTEGER DEFAULT 0,
    practice_time FLOAT DEFAULT 0
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
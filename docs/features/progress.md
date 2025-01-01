# Progress Tracking Feature Documentation

## Overview
The Progress feature allows users to track their face yoga journey through photos and notes. Users can capture, compare, and manage their progress photos over time using an interactive calendar interface.

## Features

### Progress Photos
- Take photos directly using device camera (mobile or desktop)
- Upload photos from device storage
- Switch between front and back camera on mobile devices
- View photos in a calendar-based timeline
- Compare before/after photos side by side
- Delete unwanted progress photos
- Add notes to each progress photo

### Calendar View
- Monthly and yearly calendar views
- Visual indicators for dates with photos
- Select dates to view or add progress photos
- Interactive date selection for photo comparison

### Data Collection
- Progress photos with timestamps
- User notes and descriptions
- Photo metadata
- Creation and update timestamps

## Implementation

### Data Model
```typescript
interface Progress {
  id: string;
  user_id: string;
  image_url: string;
  notes: string;
  created_at: string;
  updated_at: string;
}
```

### Key Components

#### Progress Photo Capture
- Camera integration using WebRTC
- Support for both mobile and desktop devices
- Front/back camera toggle for mobile
- File upload fallback option

#### Photo Management
- Secure photo storage in Supabase
- Photo deletion with storage cleanup
- Automatic image compression
- Responsive image display

#### Calendar Integration
- Interactive calendar using react-calendar
- Date highlighting for photos
- Month/year view switching
- Date-based photo filtering

### State Management
The progress feature uses Zustand for state management with the following key operations:
- `fetchProgress`: Retrieves all progress entries for the current user
- `addProgress`: Uploads a new progress photo with notes
- `deleteProgress`: Removes a progress entry and its associated photo

### Security
- Photos are stored securely in Supabase storage
- Each photo is associated with a user ID
- Access control through Supabase RLS policies
- Secure URL generation for photo access

## Usage

### Adding Progress Photos
1. Navigate to the Progress page
2. Choose between camera capture or file upload
3. Add optional notes
4. Submit the progress entry

### Viewing Progress
1. Use the calendar to navigate through dates
2. Click on dates with photos to view entries
3. Use the comparison tool to select two photos
4. Toggle between month and year views

### Managing Photos
1. View individual photos in the timeline
2. Delete unwanted photos using the trash icon
3. Add or edit notes for context
4. Compare photos to track progress

## Technical Notes

### Dependencies
- react-calendar: Calendar UI component
- date-fns: Date manipulation
- Supabase: Backend storage and database
- WebRTC: Camera access and photo capture

### Performance Considerations
- Images are compressed before upload
- Calendar view optimized for large datasets
- Lazy loading for photo galleries
- Efficient photo comparison handling

### Mobile Considerations
- Responsive design for all screen sizes
- Native camera integration
- Touch-friendly interface
- Optimized for mobile networks

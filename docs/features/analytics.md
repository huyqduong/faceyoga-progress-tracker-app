# Analytics Dashboard Feature Documentation

## Overview
The Analytics Dashboard provides comprehensive insights into user engagement, progress tracking, and platform usage. It offers both user-level analytics for personal progress and admin-level analytics for platform management.

## Architecture

### Data Model
```typescript
interface Analytics {
  id: string;
  user_id?: string;
  event_type: AnalyticsEventType;
  data: Record<string, any>;
  timestamp: string;
  session_id?: string;
}

interface AnalyticsMetrics {
  daily_active_users: number;
  total_practice_time: number;
  course_completion_rate: number;
  average_session_duration: number;
  retention_rate: number;
}

interface UserMetrics {
  practice_time: number;
  completed_lessons: number;
  current_streak: number;
  average_session_length: number;
  favorite_categories: string[];
}
```

### State Management

#### Analytics Store (`src/store/analyticsStore.ts`)
```typescript
interface AnalyticsState {
  metrics: AnalyticsMetrics;
  userMetrics: UserMetrics;
  timeframe: TimeFrame;
  loading: boolean;
  error: string | null;
}

const useAnalyticsStore = create<AnalyticsState>((set) => ({
  metrics: defaultMetrics,
  userMetrics: defaultUserMetrics,
  timeframe: 'week',
  loading: false,
  error: null,
  
  setTimeframe: (timeframe: TimeFrame) =>
    set({ timeframe, loading: true }),
    
  updateMetrics: (metrics: Partial<AnalyticsMetrics>) =>
    set(state => ({
      metrics: { ...state.metrics, ...metrics }
    }))
}));
```

## Components

### AnalyticsDashboard (`src/components/AnalyticsDashboard.tsx`)
Main analytics visualization component.

```typescript
interface AnalyticsDashboardProps {
  userId?: string; // Optional for admin view
  timeframe?: TimeFrame;
  showDetails?: boolean;
}
```

### MetricsCard (`src/components/MetricsCard.tsx`)
Individual metric display component.

```typescript
interface MetricsCardProps {
  title: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}
```

### AnalyticsChart (`src/components/AnalyticsChart.tsx`)
Chart component for data visualization.

Features:
- Multiple chart types
- Interactive tooltips
- Time range selection
- Data comparison

## Data Collection

### Event Tracking
```typescript
const trackEvent = async (
  eventType: AnalyticsEventType,
  data: Record<string, any>
) => {
  const event = {
    id: generateId(),
    event_type: eventType,
    data,
    timestamp: new Date().toISOString(),
    session_id: getCurrentSession()
  };
  
  await saveAnalyticsEvent(event);
};
```

### Session Tracking
```typescript
const trackSession = async () => {
  const session = {
    id: generateSessionId(),
    start_time: new Date().toISOString(),
    user_id: getCurrentUser()?.id,
    device_info: getDeviceInfo()
  };
  
  return startSession(session);
};
```

## Metrics Calculation

### User Metrics
```typescript
const calculateUserMetrics = async (
  userId: string,
  timeframe: TimeFrame
) => {
  const events = await getUserEvents(userId, timeframe);
  
  return {
    practice_time: calculateTotalPracticeTime(events),
    completed_lessons: countCompletedLessons(events),
    current_streak: calculateStreak(events),
    average_session_length: calculateAverageSession(events),
    favorite_categories: analyzeFavoriteCategories(events)
  };
};
```

### Platform Metrics
```typescript
const calculatePlatformMetrics = async (timeframe: TimeFrame) => {
  const [users, sessions, completions] = await Promise.all([
    getActiveUsers(timeframe),
    getSessionData(timeframe),
    getCompletionData(timeframe)
  ]);
  
  return {
    daily_active_users: calculateDAU(users),
    retention_rate: calculateRetention(users),
    course_completion_rate: calculateCompletionRate(completions)
  };
};
```

## Visualization

### Chart Configuration
```typescript
interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'radar';
  data: ChartData;
  options: {
    responsive: boolean;
    scales?: Record<string, any>;
    plugins?: Record<string, any>;
  };
}

const createChartConfig = (
  data: any[],
  type: ChartType,
  options?: Partial<ChartOptions>
): ChartConfig => {
  return {
    type,
    data: processChartData(data),
    options: {
      responsive: true,
      ...defaultOptions,
      ...options
    }
  };
};
```

### Data Formatting
```typescript
const formatMetricValue = (
  value: number,
  type: 'time' | 'percentage' | 'number'
) => {
  switch (type) {
    case 'time':
      return formatDuration(value);
    case 'percentage':
      return `${(value * 100).toFixed(1)}%`;
    default:
      return value.toLocaleString();
  }
};
```

## Performance Optimization

### Data Aggregation
```typescript
const aggregateTimeSeriesData = (
  events: Analytics[],
  interval: 'hour' | 'day' | 'week'
) => {
  return events.reduce((acc, event) => {
    const bucket = getBucketKey(event.timestamp, interval);
    acc[bucket] = (acc[bucket] || 0) + 1;
    return acc;
  }, {});
};
```

### Caching Strategy
1. Metric caching
2. Chart data caching
3. Aggregation results

## Integration Points

### Progress Integration
- Practice tracking
- Completion rates
- Achievement analytics

### User Integration
- User segments
- Behavior analysis
- Engagement metrics

## Error Handling

### Data Collection Errors
```typescript
const handleTrackingError = async (error: Error) => {
  if (error instanceof QuotaError) {
    await flushEvents();
  } else if (error instanceof NetworkError) {
    await queueEvent(event);
  }
  
  logger.error('Analytics error', { error });
};
```

### Visualization Errors
- Data loading failures
- Rendering issues
- Invalid metrics

## Debugging

### Logging System
```typescript
// Analytics event logging
[AnalyticsStore] Tracking event: ${eventType}
[AnalyticsStore] Calculating metrics for timeframe: ${timeframe}
[AnalyticsStore] Chart rendering error: ${error}
```

### Common Issues
1. Data Collection
   - Event tracking failures
   - Session management
   - Data consistency

2. Performance
   - Chart rendering
   - Data aggregation
   - Cache management

## Recent Updates

### December 2024
1. Enhanced metrics calculation
2. Improved data visualization
3. Added user segments
4. Enhanced caching
5. Added debug logging

### Planned Updates
1. Advanced analytics
2. Custom metrics
3. Export capabilities
4. Predictive analytics
5. Real-time dashboards

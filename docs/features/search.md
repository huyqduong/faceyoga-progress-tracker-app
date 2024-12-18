# Search and Discovery Feature Documentation

## Overview
The Search and Discovery feature provides powerful search capabilities and content discovery mechanisms across courses, lessons, and practice content. It includes filters, recommendations, and personalized content discovery.

## Architecture

### Data Model
```typescript
interface SearchResult {
  id: string;
  type: 'course' | 'lesson' | 'practice';
  title: string;
  description: string;
  thumbnail?: string;
  relevance: number;
  metadata: SearchMetadata;
}

interface SearchMetadata {
  category?: string;
  difficulty?: string;
  duration?: number;
  tags: string[];
  lastUpdated: string;
}

interface SearchFilters {
  categories?: string[];
  difficulty?: string[];
  duration?: [number, number];
  tags?: string[];
  sortBy?: 'relevance' | 'date' | 'popularity';
}
```

### State Management

#### Search Store (`src/store/searchStore.ts`)
```typescript
interface SearchState {
  query: string;
  results: SearchResult[];
  filters: SearchFilters;
  loading: boolean;
  error: string | null;
  recentSearches: string[];
  totalResults: number;
  page: number;
}

const useSearchStore = create<SearchState>((set) => ({
  query: '',
  results: [],
  filters: defaultFilters,
  loading: false,
  error: null,
  recentSearches: [],
  totalResults: 0,
  page: 1,
  
  setQuery: (query: string) => 
    set({ query, page: 1 }),
    
  updateFilters: (filters: Partial<SearchFilters>) =>
    set(state => ({
      filters: { ...state.filters, ...filters },
      page: 1
    }))
}));
```

## Components

### SearchBar (`src/components/SearchBar.tsx`)
Main search input component.

```typescript
interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  showFilters?: boolean;
}
```

### FilterPanel (`src/components/FilterPanel.tsx`)
Search filter management component.

Features:
- Category selection
- Difficulty filters
- Duration range
- Tag selection
- Sort options

### SearchResults (`src/components/SearchResults.tsx`)
Results display component with infinite scroll.

```typescript
interface SearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
}
```

## Search Implementation

### Full-Text Search
```typescript
const performSearch = async (
  query: string,
  filters: SearchFilters,
  page: number
) => {
  const { data, error } = await supabase
    .rpc('search_content', {
      search_query: query,
      filter_categories: filters.categories,
      filter_difficulty: filters.difficulty,
      page_number: page,
      items_per_page: 20
    });
    
  if (error) throw error;
  return processSearchResults(data);
};
```

### Search Ranking
```typescript
const calculateRelevance = (item: SearchResult, query: string) => {
  let score = 0;
  
  // Title match weight
  score += getStringMatchScore(item.title, query) * 2;
  
  // Description match weight
  score += getStringMatchScore(item.description, query);
  
  // Tag match bonus
  if (item.metadata.tags.some(tag => tag.includes(query))) {
    score += 0.5;
  }
  
  return score;
};
```

## Discovery Features

### Recommendations Engine
```typescript
interface RecommendationParams {
  userId: string;
  contentType?: 'course' | 'lesson';
  limit?: number;
}

const getRecommendations = async (params: RecommendationParams) => {
  // Fetch user preferences and history
  const userProfile = await getUserProfile(params.userId);
  const history = await getUserHistory(params.userId);
  
  // Calculate content scores
  const recommendations = await rankContent(
    userProfile,
    history,
    params.contentType
  );
  
  return recommendations.slice(0, params.limit);
};
```

### Popular Content
```typescript
const getPopularContent = async (timeframe: string) => {
  const { data } = await supabase
    .rpc('get_popular_content', {
      time_frame: timeframe,
      limit: 10
    });
    
  return processPopularResults(data);
};
```

## Performance Optimization

### Search Optimization
1. Query caching
2. Result pagination
3. Debounced search
4. Index optimization

### Caching Strategy
```typescript
const searchCache = new LRUCache({
  max: 100,
  maxAge: 1000 * 60 * 5 // 5 minutes
});

const getCachedResults = async (
  query: string,
  filters: SearchFilters
) => {
  const cacheKey = generateCacheKey(query, filters);
  
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey);
  }
  
  const results = await performSearch(query, filters, 1);
  searchCache.set(cacheKey, results);
  
  return results;
};
```

## Integration Points

### Course Integration
- Course search indexing
- Content recommendations
- Popular courses

### Progress Integration
- Personalized recommendations
- Progress-based filtering
- History-based search

## Error Handling

### Search Errors
```typescript
const handleSearchError = (error: Error) => {
  if (error instanceof SearchTimeoutError) {
    return {
      message: 'Search took too long. Please try again.',
      retry: true
    };
  }
  
  if (error instanceof FilterError) {
    return {
      message: 'Invalid filter combination',
      retry: false
    };
  }
  
  return {
    message: 'Search failed. Please try again later.',
    retry: true
  };
};
```

### Results Handling
- Empty results
- Partial results
- Filter conflicts

## Analytics

### Search Analytics
```typescript
interface SearchAnalytics {
  query: string;
  filters: SearchFilters;
  resultCount: number;
  clickedResults: string[];
  searchDuration: number;
}

const trackSearch = async (analytics: SearchAnalytics) => {
  await analyticsService.track('search', {
    ...analytics,
    timestamp: new Date().toISOString()
  });
};
```

### Usage Metrics
1. Popular searches
2. Filter usage
3. Result clicks
4. Search abandonment

## Debugging

### Logging System
```typescript
// Search event logging
[SearchStore] Search query: ${query}
[SearchStore] Applied filters: ${JSON.stringify(filters)}
[SearchStore] Results count: ${results.length}
```

### Common Issues
1. Search Performance
   - Slow queries
   - Cache misses
   - Filter complexity

2. Result Quality
   - Relevance issues
   - Missing results
   - Ranking problems

## Recent Updates

### December 2024
1. Enhanced search ranking
2. Improved recommendations
3. Added search analytics
4. Enhanced caching
5. Added debug logging

### Planned Updates
1. Advanced search filters
2. Semantic search
3. Personalized ranking
4. Search suggestions
5. Filter presets

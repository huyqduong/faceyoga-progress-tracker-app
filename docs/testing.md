# Face Yoga App Testing Documentation

This document outlines the testing strategy and implementation for the Face Yoga Progress Tracker application.

## Overview

Our testing suite consists of unit tests and integration tests covering the core functionality of the application. We use Jest as our test runner and React Testing Library for testing React components.

## Test Files Structure

```
src/
├── api/
│   └── __tests__/
│       └── courseApi.test.ts       # API layer tests
├── components/
│   └── __tests__/
│       ├── ExerciseCard.test.tsx   # Exercise card component tests
│       └── ExerciseGrid.test.tsx   # Exercise grid component tests
└── stores/
    └── __tests__/
        └── useExerciseStore.test.ts # Store tests
```

## Test Coverage

### 1. Store Tests (`useExerciseStore.test.ts`)

Tests the Zustand store that manages exercise state.

#### Test Cases:
- `fetchExercises`: Retrieves all exercises
  - Verifies successful data fetching
  - Checks loading state management
  - Tests error handling
- `searchExercises`: Filters exercises by title
  - Validates search query formatting
  - Tests result storage in state
- `getExerciseById`: Retrieves single exercise
  - Confirms correct ID usage
  - Verifies single exercise retrieval

#### Example:
```typescript
it('fetches exercises successfully', async () => {
  const { result } = renderHook(() => useExerciseStore());
  await act(async () => {
    await result.current.fetchExercises();
  });
  expect(result.current.exercises).toEqual([mockExercise]);
  expect(result.current.loading).toBe(false);
});
```

### 2. API Tests (`courseApi.test.ts`)

Tests the API layer for exercise access control.

#### Test Cases:
- Non-premium exercise access
- Premium exercise access with subscription
- Premium exercise access without subscription
- Error handling in API calls

#### Example:
```typescript
it('returns true for non-premium exercises', async () => {
  const result = await courseApi.hasAccessToExercise(userId, exerciseId);
  expect(result).toBe(true);
});
```

### 3. Component Tests

#### ExerciseGrid (`ExerciseGrid.test.tsx`)

Tests the grid component that displays exercises.

##### Test Cases:
- Correct rendering of exercise cards
- Exercise count display
- Empty state handling
- Exercise click interactions
- Premium content display

#### ExerciseCard (`ExerciseCard.test.tsx`)

Tests individual exercise card components.

##### Test Cases:
- Exercise details display
- Start button functionality
- Premium/locked state
- Benefits display
- Difficulty badge display

## Testing Strategy

### 1. Unit Testing Approach
- **Isolation**: Each component and function is tested in isolation
- **Mocking**: External dependencies are mocked
- **Edge Cases**: Coverage includes error states and boundary conditions

### 2. Integration Testing
- Store interactions with components
- API calls through Supabase
- User interactions with UI elements

### 3. Mock Strategy

#### Supabase Mocking
```typescript
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn()
  }
}));
```

#### Test Data
```typescript
const mockExercise = {
  id: '1',
  title: 'Face Yoga Exercise',
  duration: '5 minutes',
  // ... other properties
};
```

### 4. State Management Testing
- Loading states
- Error handling
- Data updates
- Premium/locked states

### 5. User Interaction Testing
- Click handlers
- Visual feedback
- Access control
- Form interactions

## Best Practices

1. **Async Testing**
   ```typescript
   await act(async () => {
     await result.current.fetchExercises();
   });
   ```

2. **Error Handling**
   ```typescript
   it('handles errors gracefully', async () => {
     // Mock error response
     const result = await courseApi.hasAccessToExercise(userId, exerciseId);
     expect(result).toBe(false);
   });
   ```

3. **Component Testing**
   ```typescript
   render(<ExerciseGrid exercises={mockExercises} />);
   expect(screen.getByText('Exercise Title')).toBeInTheDocument();
   ```

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test useExerciseStore.test.ts

# Run tests with coverage
npm test -- --coverage
```

## Continuous Integration

Tests are run automatically on:
- Pull requests
- Merges to main branch
- Release deployments

## Future Improvements

1. **E2E Testing**
   - Add Cypress for end-to-end testing
   - Cover critical user flows

2. **Performance Testing**
   - Add performance benchmarks
   - Test loading times

3. **Coverage Goals**
   - Maintain >80% code coverage
   - Add visual regression testing

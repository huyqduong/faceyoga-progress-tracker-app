/**
 * Tests for the Course API
 * 
 * This test suite verifies the functionality of the Course API, which handles
 * access control for exercises based on their premium status and user subscriptions.
 * 
 * Testing Strategy:
 * - Mock Supabase responses for both exercises and subscriptions
 * - Test different combinations of premium status and subscription status
 * - Verify error handling in various scenarios
 */

import { courseApi } from '../courseApi';
import { supabase } from '../../lib/supabase';

// Mock the supabase module
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn()
  }
}));

describe('courseApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hasAccessToExercise', () => {
    const mockUserId = 'user123';
    const mockExerciseId = 'exercise123';

    /**
     * Tests that non-premium exercises are accessible to all users
     * regardless of their subscription status.
     */
    it('returns true for non-premium exercises', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: mockExerciseId,
                is_premium: false
              },
              error: null
            })
          })
        })
      });

      const result = await courseApi.hasAccessToExercise(mockUserId, mockExerciseId);
      expect(result).toBe(true);
    });

    /**
     * Tests that premium exercises are not accessible to users
     * without an active subscription.
     */
    it('returns false for premium exercises without active subscription', async () => {
      // Mock exercise query
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: mockExerciseId,
                is_premium: true
              },
              error: null
            })
          })
        })
      });

      // Mock subscription query
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                subscription: {
                  status: 'inactive'
                }
              },
              error: null
            })
          })
        })
      });

      const result = await courseApi.hasAccessToExercise(mockUserId, mockExerciseId);
      expect(result).toBe(false);
    });

    /**
     * Tests that premium exercises are accessible to users
     * with an active subscription.
     */
    it('returns true for premium exercises with active subscription', async () => {
      // Mock exercise query
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: mockExerciseId,
                is_premium: true
              },
              error: null
            })
          })
        })
      });

      // Mock subscription query
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                subscription: {
                  status: 'active'
                }
              },
              error: null
            })
          })
        })
      });

      const result = await courseApi.hasAccessToExercise(mockUserId, mockExerciseId);
      expect(result).toBe(true);
    });

    /**
     * Tests error handling when database queries fail.
     * Should deny access by default when errors occur.
     */
    it('handles errors gracefully', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: new Error('Database error')
            })
          })
        })
      });

      const result = await courseApi.hasAccessToExercise(mockUserId, mockExerciseId);
      expect(result).toBe(false);
    });
  });
});

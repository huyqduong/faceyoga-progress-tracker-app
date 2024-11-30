import React from 'react';
import { Course } from '../lib/supabase-types';
import { courseApi } from '../lib/courses';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

interface CoursePurchaseButtonProps {
  course: Course;
  onPurchaseComplete?: () => void;
}

export const CoursePurchaseButton = ({ course, onPurchaseComplete }: CoursePurchaseButtonProps) => {
  const { user } = useAuthStore();
  const [hasAccess, setHasAccess] = React.useState<boolean | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    checkAccess();
  }, [user, course.id]);

  const checkAccess = async () => {
    if (!user) {
      setHasAccess(false);
      return;
    }

    try {
      const access = await courseApi.hasAccessToCourse(user.id, course.id);
      setHasAccess(access);
    } catch (error) {
      console.error('Error checking access:', error);
      setHasAccess(false);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      toast.error('Please sign in to purchase this course');
      return;
    }

    setIsLoading(true);
    try {
      // Create a purchase record with status 'pending'
      const purchase = await courseApi.createPurchase({
        user_id: user.id,
        course_id: course.id,
        amount: course.price,
        currency: course.currency,
        status: 'completed', // Set as completed directly since this is a test version
        payment_intent_id: `test_${Date.now()}`,
        payment_method: 'test',
        receipt_url: 'https://example.com/receipt'
      });

      // Check if the purchase was successful
      if (purchase) {
        toast.success('Purchase successful! You now have access to this course.');
        setHasAccess(true);
        onPurchaseComplete?.();
        
        // Refresh the page after a short delay to ensure all states are updated
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error: any) {
      console.error('Error purchasing course:', error);
      toast.error(error.message || 'Error purchasing course. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (hasAccess) {
    return (
      <div className="px-4 py-2 bg-green-100 text-green-800 rounded-md text-center">
        You have access to this course
      </div>
    );
  }

  return (
    <button
      onClick={handlePurchase}
      disabled={isLoading}
      className={`w-full px-4 py-2 rounded-md text-center transition-colors
        ${isLoading 
          ? 'bg-gray-300 cursor-not-allowed' 
          : 'bg-mint-500 text-white hover:bg-mint-600'
        }`}
    >
      {isLoading ? 'Processing...' : `Purchase for ${course.price} ${course.currency}`}
    </button>
  );
};

import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { courseApi } from '../lib/courses';
import { Loader2 } from 'lucide-react';
import { formatDisplayPrice } from '../stripe/config';
import { toast } from 'react-hot-toast';
import { stripeService } from '../stripe/stripeService';
import { StripePaymentForm } from './StripePaymentForm';
import { CheckCircle } from 'lucide-react';
import { useCourseStore } from '../store/courseStore';

interface CoursePurchaseButtonProps {
  courseId: string;
  onPurchaseComplete?: () => void;
}

export const CoursePurchaseButton: React.FC<CoursePurchaseButtonProps> = ({
  courseId,
  onPurchaseComplete
}) => {
  const { user } = useAuth();
  const { courses } = useCourseStore();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [purchased, setPurchased] = React.useState(false);
  const [showPaymentForm, setShowPaymentForm] = React.useState(false);
  const [clientSecret, setClientSecret] = React.useState<string | null>(null);

  const course = courses.find(c => c.id === courseId);

  // Check if user has already purchased the course
  React.useEffect(() => {
    const checkAccess = async () => {
      if (!user || !courseId) return;

      try {
        const hasAccess = await courseApi.hasAccessToCourse(user.id, courseId);
        setPurchased(hasAccess);
      } catch (error) {
        console.error('Error checking course access:', error);
        setPurchased(false);
      }
    };

    checkAccess();
  }, [user?.id, courseId]);

  const handlePurchase = async () => {
    if (!user) {
      toast.error('Please sign in to purchase this course');
      return;
    }

    if (!course) {
      toast.error('Course not found');
      return;
    }

    if (!course.price) {
      toast.error('Course price is not set');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { clientSecret, error } = await stripeService.createPaymentIntent({
        courseId,
        userId: user.id,
        amount: course.price,
      });

      if (error) throw new Error(error);
      if (!clientSecret) throw new Error('Failed to create payment intent');

      setClientSecret(clientSecret);
      setShowPaymentForm(true);
    } catch (err) {
      console.error('Error initiating purchase:', err);
      setError(err instanceof Error ? err.message : 'Failed to initiate purchase');
      toast.error('Failed to initiate purchase. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      await stripeService.handlePaymentSuccess(paymentIntentId, courseId);
      setPurchased(true);
      setShowPaymentForm(false);
      toast.success('Course purchased successfully!');
      onPurchaseComplete?.();
    } catch (err) {
      console.error('Error handling payment success:', err);
      toast.error('Error completing purchase. Please contact support.');
    }
  };

  if (purchased) {
    return (
      <div className="flex items-center space-x-2 text-mint-600">
        <CheckCircle className="h-5 w-5" />
        <span>You own this course</span>
      </div>
    );
  }

  if (showPaymentForm && clientSecret && course) {
    return (
      <StripePaymentForm
        clientSecret={clientSecret}
        course={course}
        onSuccess={handlePaymentSuccess}
        onError={(error) => {
          setError(error);
          toast.error(error);
        }}
      />
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 text-sm text-red-600">
          {error}
        </div>
      )}
      <button
        onClick={handlePurchase}
        disabled={loading}
        className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg text-white transition-colors
          ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-mint-500 hover:bg-mint-600'}`}
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <span>Purchase Course</span>
            {course?.price && <span>({formatDisplayPrice(course.price)})</span>}
          </>
        )}
      </button>
    </div>
  );
};

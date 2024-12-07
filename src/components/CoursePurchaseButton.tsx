import React from 'react';
import { Course } from '../lib/supabase-types';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';
import { formatDisplayPrice } from '../stripe/config';
import { toast } from 'react-hot-toast';
import { stripeService } from '../stripe/stripeService';
import { StripePaymentForm } from './StripePaymentForm';

interface CoursePurchaseButtonProps {
  course: Course;
  onPurchaseComplete?: () => void;
}

export const CoursePurchaseButton: React.FC<CoursePurchaseButtonProps> = ({
  course,
  onPurchaseComplete
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [purchased, setPurchased] = React.useState(false);
  const [showPaymentForm, setShowPaymentForm] = React.useState(false);
  const [clientSecret, setClientSecret] = React.useState<string | null>(null);

  // Check if user has already purchased the course
  React.useEffect(() => {
    const checkPurchaseStatus = async () => {
      if (!user) return;

      try {
        const { data } = await supabase
          .from('course_access')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', course.id);

        setPurchased(data && data.length > 0);
      } catch (error) {
        console.error('Error checking purchase status:', error);
        setPurchased(false);
      }
    };

    checkPurchaseStatus();
  }, [user, course.id]);

  const handlePurchase = async () => {
    if (!user) {
      setError('Please log in to purchase this course');
      toast.error('Please log in to purchase this course');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create a payment intent
      const { clientSecret: secret, error: intentError } = await stripeService.createPaymentIntent(
        course.id,
        course.price
      );

      if (intentError || !secret) {
        throw new Error(intentError || 'Failed to create payment intent');
      }

      setClientSecret(secret);
      setShowPaymentForm(true);
    } catch (error: any) {
      console.error('Purchase error:', error);
      setError(error.message || 'Failed to process payment');
      toast.error(error.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      // Check if user already has access
      const { data: existingAccess, error: accessCheckError } = await supabase
        .from('course_access')
        .select('*')
        .eq('user_id', user!.id)
        .eq('course_id', course.id);

      if (accessCheckError && accessCheckError.code !== 'PGRST116') {
        // PGRST116 means no rows returned, which is what we want
        throw accessCheckError;
      }

      if (existingAccess) {
        setPurchased(true);
        setShowPaymentForm(false);
        toast.success('You already have access to this course!');
        onPurchaseComplete?.();
        return;
      }

      // First create the purchase record
      const { data: purchase, error: purchaseError } = await supabase
        .from('course_purchases')
        .insert({
          user_id: user!.id,
          course_id: course.id,
          amount: course.price,
          currency: course.currency,
          status: 'completed',
          payment_intent_id: paymentIntentId,
          payment_method: 'stripe'
        })
        .select()
        .single();

      if (purchaseError) throw purchaseError;
      if (!purchase) throw new Error('Failed to create purchase record');

      // Then create the course access record using the purchase ID
      const { error: accessError } = await supabase
        .from('course_access')
        .insert({
          user_id: user!.id,
          course_id: course.id,
          access_type: 'lifetime',
          purchase_id: purchase.id,
          starts_at: new Date().toISOString()
        });

      if (accessError) throw accessError;

      setPurchased(true);
      setShowPaymentForm(false);
      toast.success('Purchase successful! You now have access to this course.');
      onPurchaseComplete?.();
    } catch (error: any) {
      console.error('Error recording course access:', error);
      toast.error('Purchase recorded but access not granted. Please contact support.');
    }
  };

  const handlePaymentError = (error: string) => {
    setError(error);
    setShowPaymentForm(false);
    toast.error(error || 'Payment failed. Please try again.');
  };

  if (purchased) {
    return (
      <button
        className="w-full px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        onClick={onPurchaseComplete}
      >
        Start Learning
      </button>
    );
  }

  if (showPaymentForm && clientSecret) {
    return (
      <StripePaymentForm
        clientSecret={clientSecret}
        course={course}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handlePurchase}
        disabled={loading}
        className="w-full px-4 py-2 bg-mint-600 text-white rounded-md font-medium hover:bg-mint-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mint-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <span>Purchase for {formatDisplayPrice(course.price)}</span>
          </>
        )}
      </button>
      {error && (
        <div className="text-red-600 text-sm mt-2">{error}</div>
      )}
    </div>
  );
};

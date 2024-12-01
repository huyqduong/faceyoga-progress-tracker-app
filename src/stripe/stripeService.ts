import { supabase } from '../lib/supabase';
import { formatStripePrice } from './config';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface CreatePaymentIntentResponse {
  clientSecret: string;
  error?: string;
}

export const stripeService = {
  async createPaymentIntent(courseId: string, amount: number): Promise<CreatePaymentIntentResponse> {
    try {
      console.log('Creating payment intent for:', { courseId, amount });

      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Authentication required');
      }

      if (!session) {
        console.error('No session found');
        throw new Error('Please sign in to make a purchase');
      }

      // Create payment intent
      const response = await fetch(`${SUPABASE_URL}/functions/v1/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ courseId, amount: formatStripePrice(amount) }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Payment intent creation failed:', errorData);
        throw new Error(errorData.error || 'Failed to create payment');
      }

      const data = await response.json();
      console.log('Payment intent created successfully:', data);
      return { clientSecret: data.clientSecret }; 
    } catch (error: any) {
      console.error('Error in createPaymentIntent:', error);
      return { 
        clientSecret: '', 
        error: error.message || 'Failed to create payment intent'
      };
    }
  },

  async handlePaymentSuccess(paymentIntentId: string, courseId: string): Promise<void> {
    try {
      console.log('Handling payment success for:', paymentIntentId);

      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Authentication required');
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/handle-payment-success`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ paymentIntentId, courseId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Payment success handling failed:', errorData);
        throw new Error(errorData.error || 'Failed to process payment');
      }

      const data = await response.json();
      console.log('Payment success handled:', data);
    } catch (error: any) {
      console.error('Error in handlePaymentSuccess:', error);
      throw error;
    }
  },
};

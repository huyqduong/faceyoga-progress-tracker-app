import { supabase } from '../lib/supabase';
import { formatStripePrice } from './config';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface CreatePaymentIntentResponse {
  clientSecret: string;
  error?: string;
}

interface CreatePaymentIntentParams {
  courseId: string;
  userId: string;
  amount: number;
}

export const stripeService = {
  async createPaymentIntent({ courseId, userId, amount }: CreatePaymentIntentParams): Promise<CreatePaymentIntentResponse> {
    try {
      if (!courseId || !amount) {
        throw new Error('Missing required fields: courseId and amount');
      }

      console.log('Creating payment intent for:', { courseId, userId, amount });

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
        body: JSON.stringify({ 
          courseId, 
          amount: formatStripePrice(amount)
        }),
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
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw new Error('Authentication required');
      if (!session) throw new Error('Please sign in to complete purchase');

      console.log('Creating course purchase record...');

      const now = new Date().toISOString();

      // First create a purchase record
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('course_purchases')
        .insert([
          {
            user_id: session.user.id,
            course_id: courseId,
            amount: 0, // This should be the actual amount from the course
            currency: 'usd',
            status: 'completed',
            payment_intent_id: paymentIntentId,
            payment_method: 'stripe'
          }
        ])
        .select()
        .single();

      if (purchaseError) {
        console.error('Error creating purchase record:', purchaseError);
        throw new Error('Failed to record purchase');
      }

      // Check if access already exists
      const { data: existingAccess } = await supabase
        .from('course_access')
        .select()
        .eq('user_id', session.user.id)
        .eq('course_id', courseId)
        .single();

      if (existingAccess) {
        console.log('User already has access to this course');
        return;
      }

      // Create course access record with the purchase ID
      const { error: accessError } = await supabase
        .from('course_access')
        .insert([
          {
            user_id: session.user.id,
            course_id: courseId,
            purchase_id: purchaseData.id,
            access_type: 'lifetime', 
            starts_at: now,
            created_at: now,
            updated_at: now
          }
        ]);

      if (accessError) {
        console.error('Error creating course access:', accessError);
        throw new Error('Failed to grant course access');
      }

      console.log('Course access granted successfully');
    } catch (error: any) {
      console.error('Error handling payment success:', error);
      throw error;
    }
  }
};

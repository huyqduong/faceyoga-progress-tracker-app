import React from 'react';
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { stripePromise } from '../stripe/config';
import { Course } from '../lib/supabase-types';
import { formatDisplayPrice } from '../stripe/config';

interface PaymentFormProps {
  clientSecret: string;
  course: Course;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

const PaymentForm = ({ clientSecret, course, onSuccess, onError }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [paymentStatus, setPaymentStatus] = React.useState<string>('');
  const [errorMessage, setErrorMessage] = React.useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('Processing payment...');
    setErrorMessage('');

    try {
      // First, check the PaymentIntent status
      const { paymentIntent: existingIntent } = await stripe.retrievePaymentIntent(clientSecret);
      console.log('Current PaymentIntent status:', existingIntent?.status);

      if (existingIntent?.status === 'succeeded') {
        console.log('Payment already succeeded');
        setPaymentStatus('Payment successful!');
        onSuccess(existingIntent.id);
        return;
      }

      if (existingIntent?.status === 'requires_payment_method') {
        const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/course/${course.id}`,
            payment_method_data: {
              billing_details: {
                name: 'Course Purchase',
              },
            },
          },
          redirect: 'if_required',
        });

        if (confirmError) {
          console.error('Payment confirmation error:', confirmError);
          if (confirmError.type === 'invalid_request_error' && 
              confirmError.code === 'payment_intent_unexpected_state') {
            // Handle the case where the payment might have succeeded but we missed the update
            const { paymentIntent: updatedIntent } = await stripe.retrievePaymentIntent(clientSecret);
            if (updatedIntent?.status === 'succeeded') {
              setPaymentStatus('Payment successful!');
              onSuccess(updatedIntent.id);
              return;
            }
          }
          setErrorMessage(confirmError.message || 'An error occurred during payment');
          onError(confirmError.message || 'An error occurred during payment');
          return;
        }

        if (paymentIntent && paymentIntent.status === 'succeeded') {
          setPaymentStatus('Payment successful!');
          onSuccess(paymentIntent.id);
        } else {
          setErrorMessage('Please try another payment method');
          onError('Please try another payment method');
        }
      } else {
        setErrorMessage('Invalid payment state. Please try again.');
        onError('Invalid payment state. Please try again.');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setErrorMessage(error.message || 'An unexpected error occurred');
      onError(error.message || 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Payment Details</h3>
          <p className="text-gray-600">
            Amount: {formatDisplayPrice(course.price || 0)}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
            {errorMessage}
          </div>
        )}

        {paymentStatus && !errorMessage && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-600 rounded-md">
            {paymentStatus}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 border border-gray-200 rounded-md">
            <PaymentElement />
          </div>

          <button
            type="submit"
            disabled={isProcessing || !stripe || !elements}
            className={`w-full px-4 py-3 rounded-md text-center transition-colors
              ${isProcessing 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-mint-500 text-white hover:bg-mint-600'
              }`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Pay Now'
            )}
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-500">
          <p>• Your payment is secured by Stripe</p>
          <p>• No credit card information is stored on our servers</p>
        </div>
      </div>
    </div>
  );
};

interface StripePaymentFormProps {
  clientSecret: string;
  course: Course;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

export const StripePaymentForm = (props: StripePaymentFormProps) => {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret: props.clientSecret }}>
      <PaymentForm {...props} />
    </Elements>
  );
};

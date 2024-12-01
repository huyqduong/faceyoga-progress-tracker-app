import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
// Note: Replace 'your_publishable_key' with your actual Stripe publishable key from environment variables
export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const CURRENCY = 'usd';

// Helper function to format price for Stripe (converts dollars to cents)
export const formatStripePrice = (price: number): number => Math.round(price * 100);

// Helper function to format price for display
export const formatDisplayPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: CURRENCY,
  }).format(price);
};

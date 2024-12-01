import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../stripe/config';
import { StripePaymentForm } from './StripePaymentForm';
import { Course } from '../lib/supabase-types';
import { CoursePurchaseButton } from './CoursePurchaseButton';

const testCourse: Course = {
  id: 'test-course',
  title: 'Test Course',
  description: 'Test course for Stripe integration',
  price: 10.00,
  currency: 'usd',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  image_url: '',
  status: 'published'
};

export const StripeTestPayment = () => {
  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Test Payment</h2>
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">{testCourse.title}</h3>
          <p className="text-gray-600">{testCourse.description}</p>
          <p className="text-lg font-bold mt-2">
            Price: ${testCourse.price} {testCourse.currency.toUpperCase()}
          </p>
        </div>
        <CoursePurchaseButton course={testCourse} />
      </div>
    </div>
  );
};

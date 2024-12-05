import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Smile, Camera, Calendar, Award, Sparkles, Clock, Users, Crown, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AppSettings {
  id: string;
  business_name: string;
  logo_url: string | null;
  description: string;
  primary_color: string;
  secondary_color: string;
}

const Landing = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching app settings:', error);
        return;
      }

      setSettings(data);

      // Apply custom colors if available
      if (data.primary_color) {
        document.documentElement.style.setProperty('--color-primary', data.primary_color);
      }
      if (data.secondary_color) {
        document.documentElement.style.setProperty('--color-secondary', data.secondary_color);
      }
    };

    fetchSettings();
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('early_access_signups')
        .insert([
          {
            email,
            status: 'pending'
          }
        ]);

      if (error) {
        console.error('Signup error:', error);
        if (error.code === '23505') {
          toast.error('This email has already been registered for early access.');
        } else {
          toast.error(`Failed to sign up: ${error.message}`);
        }
        return;
      }

      toast.success('Thank you for signing up! We\'ll notify you when we launch.');
      setEmail('');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Failed to sign up. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-mint-50 to-mint-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 sm:pt-32 sm:pb-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[url('/images/pattern-bg.svg')] opacity-10"></div>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="mb-8 flex justify-center">
              <motion.img
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                src={settings?.logo_url || '/images/logo.svg'}
                alt={settings?.business_name || 'Face Yoga App'}
                className="h-24 w-auto"
              />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Transform Your Face Naturally
              <span className="block text-mint-600">with {settings?.business_name || 'Face Yoga'}</span>
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto"
            >
              {settings?.description || 'Join our revolutionary face yoga app that combines expert coaching, progress tracking, and personalized routines to help you achieve natural facial rejuvenation.'}
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mt-10 flex flex-col items-center gap-4"
            >
              <form onSubmit={handleSignup} className="w-full max-w-md">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email for early access"
                    className="flex-1 rounded-md border-2 border-mint-200 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-mint-500 focus:outline-none"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="rounded-md bg-mint-600 px-6 py-2 font-semibold text-white shadow-sm hover:bg-mint-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Signing up...</span>
                      </>
                    ) : (
                      <>
                        <span>Join Waitlist</span>
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
              <p className="text-sm text-gray-600">
                Be the first to know when we launch. No spam, ever.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Before/After Gallery */}
      <section className="py-16 bg-white/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Real Results from Our Community</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative rounded-xl overflow-hidden shadow-lg"
              >
                <div className="aspect-[4/5] relative bg-gradient-to-br from-mint-50 to-mint-200 flex items-center justify-center">
                  <p className="text-mint-600 font-semibold text-lg">Before & After {i}</p>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <p className="absolute bottom-4 left-4 text-white font-semibold">
                    After 8 weeks of practice
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Free Features Section */}
      <section id="features" className="py-24 bg-white/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16">Start Your Journey For Free</h2>
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center text-center p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-mint-100">
                <Smile className="h-8 w-8 text-mint-600" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">Basic Exercises</h3>
              <p className="mt-2 text-gray-600">Access our collection of fundamental face yoga exercises to get started.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col items-center text-center p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-mint-100">
                <Camera className="h-8 w-8 text-mint-600" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">Progress Tracking</h3>
              <p className="mt-2 text-gray-600">Track your transformation with before/after photos and measurements.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col items-center text-center p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-mint-100">
                <Users className="h-8 w-8 text-mint-600" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">Community Support</h3>
              <p className="mt-2 text-gray-600">Connect with fellow face yoga enthusiasts and share your journey.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Premium Features Preview */}
      <section className="py-24 bg-gradient-to-b from-mint-100 to-mint-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold mb-4">Coming Soon: Premium Features</h2>
              <p className="text-lg text-gray-600">Unlock the full potential of your face yoga practice</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl p-8 shadow-lg"
            >
              <Crown className="h-12 w-12 text-mint-600 mb-6" />
              <h3 className="text-xl font-bold mb-4">Premium Courses</h3>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <Sparkles className="h-5 w-5 text-mint-500 mr-2" />
                  <span>Expert-led video courses</span>
                </li>
                <li className="flex items-center">
                  <Clock className="h-5 w-5 text-mint-500 mr-2" />
                  <span>Structured 8-week programs</span>
                </li>
                <li className="flex items-center">
                  <Award className="h-5 w-5 text-mint-500 mr-2" />
                  <span>Certification upon completion</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl p-8 shadow-lg"
            >
              <Users className="h-12 w-12 text-mint-600 mb-6" />
              <h3 className="text-xl font-bold mb-4">1:1 Coaching</h3>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <Sparkles className="h-5 w-5 text-mint-500 mr-2" />
                  <span>Personalized guidance</span>
                </li>
                <li className="flex items-center">
                  <Clock className="h-5 w-5 text-mint-500 mr-2" />
                  <span>Weekly progress reviews</span>
                </li>
                <li className="flex items-center">
                  <Award className="h-5 w-5 text-mint-500 mr-2" />
                  <span>Custom exercise plans</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white/30">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Start Your Face Yoga Journey Today
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            Begin with our free features and upgrade whenever you're ready for premium content.
          </p>
        </motion.div>
      </section>
    </div>
  );
};

export default Landing;

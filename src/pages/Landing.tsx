import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Smile, Camera, Calendar, Award, Sparkles, Clock, Users, Crown, Loader2, GraduationCap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import BeforeAfterSlider from '../components/BeforeAfterSlider';

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
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-mint-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center"
            >
              <img
                src={settings?.logo_url || '/images/logo.svg'}
                alt={settings?.business_name || 'Face Yoga App'}
                className="h-10 w-auto"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2"
            >
              <button className="px-4 py-2 text-mint-600 hover:text-mint-700 font-medium">
                Log In
              </button>
              <button className="px-4 py-2 bg-mint-600 text-white rounded-lg hover:bg-mint-700 transition-colors font-medium">
                Sign Up
              </button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[url('/images/pattern-bg.svg')] opacity-5"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-mint-50/90 via-white/95 to-mint-50/90 backdrop-blur-sm"></div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-left"
            >
              <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6">
                <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-mint-600/90 to-mint-300/90">
                  Transform Your Face
                </span>
                <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-mint-500/90 to-mint-200/90">
                  Naturally
                </span>
              </h1>
              <p className="mt-6 text-xl sm:text-2xl leading-relaxed text-gray-600 font-light">
                Experience the power of guided face yoga exercises for natural rejuvenation and radiant skin
              </p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="mt-10"
              >
                <form onSubmit={handleSignup} className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email for early access"
                    className="flex-1 rounded-xl border-2 border-mint-200 px-6 py-4 text-lg text-gray-900 placeholder-gray-500 focus:border-mint-500 focus:outline-none shadow-sm"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="rounded-xl bg-gradient-to-r from-mint-600 to-mint-700 px-8 py-4 font-semibold text-white shadow-lg hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:translate-y-[-2px] text-lg min-w-[180px]"
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
                </form>
                <p className="mt-4 text-sm text-gray-600 text-center sm:text-left">
                  Be the first to know when we launch. No spam, ever.
                </p>
              </motion.div>
            </motion.div>

            {/* Right Column - Feature Cards */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="space-y-6"
            >
              {[
                {
                  icon: Calendar,
                  title: "Daily Routines",
                  description: "Personalized face yoga routines tailored to your goals"
                },
                {
                  icon: Camera,
                  title: "Progress Tracking",
                  description: "Track your transformation with advanced photo tools"
                },
                {
                  icon: GraduationCap,
                  title: "Expert Guidance",
                  description: "Learn from certified instructors and structured courses"
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-mint-100/50"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-gradient-to-br from-mint-400 to-mint-600 p-3 shadow-md">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                      <p className="mt-1 text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Before/After Gallery */}
      <section className="py-24 bg-gradient-to-b from-white via-mint-50/30 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-mint-600 to-mint-400 mb-4">
              Real Results from Our Community
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
              See the amazing transformations achieved by our dedicated members through consistent practice
            </p>
          </motion.div>

          {/* Before/After Image Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <BeforeAfterSlider
              beforeImage="/images/transformations/before1.jpg"
              afterImage="/images/transformations/after1.jpg"
              weeks={8}
            />
            <BeforeAfterSlider
              beforeImage="/images/transformations/before2.jpg"
              afterImage="/images/transformations/after2.jpg"
              weeks={12}
            />
            <BeforeAfterSlider
              beforeImage="/images/transformations/before3.jpg"
              afterImage="/images/transformations/after3.jpg"
              weeks={10}
            />
          </div>

          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <p className="text-sm text-gray-500 italic">
              Results may vary. Consistent practice and dedication are key to achieving optimal results.
            </p>
          </motion.div>

          {/* Face Yoga Method Attribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div>
              <img 
                src="/images/transformations/face-yoga-method-logo.jpg" 
                alt="Face Yoga Method" 
                className="h-24 mx-auto object-contain"
              />
              <p className="text-mint-600 font-medium mt-2">
                In partnership with Face Yoga Method
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-12 text-center"
          >

          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-b from-white to-mint-50/30">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center"
        >
          <h2 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-mint-600 to-mint-800 mb-6">
            Start Your Face Yoga Journey Today
          </h2>
          <p className="text-xl leading-8 text-gray-600 max-w-2xl mx-auto mb-12">
            Join our community and experience the transformative power of face yoga
          </p>
          <motion.button
            whileHover={{ y: -2 }}
            className="rounded-xl bg-gradient-to-r from-mint-600 to-mint-700 px-8 py-4 font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Get Started Now
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
};

export default Landing;

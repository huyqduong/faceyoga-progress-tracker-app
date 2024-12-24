import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Smile, Camera, Calendar, Award, Sparkles, Clock, Users, Crown, Loader2, GraduationCap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import { ThemeToggle } from '../components/ThemeToggle';

interface AppSettings {
  id: string;
  business_name: string;
  home_title: string;
  home_subtitle: string;
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

  const scrollToSignup = () => {
    const signupForm = document.querySelector('#signup-form');
    signupForm?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-mint-100 dark:border-gray-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0"
            >
              <img
                src={settings?.logo_url || '/images/logo.svg'}
                alt={settings?.business_name || 'Face Yoga App'}
                className="h-8 sm:h-10 w-auto flex-shrink-0"
              />
              <div className="text-base sm:text-xl font-bold text-mint-600 truncate dark:text-gray-100 min-w-0">
                {settings?.business_name || 'Renew and Glow Face Yoga'}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 ml-4 flex-shrink-0"
            >
              <ThemeToggle />
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[url('/images/pattern-bg.svg')] opacity-5 dark:opacity-[0.02]"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-mint-50/90 via-white/95 to-mint-50/90 dark:from-gray-900/90 dark:via-gray-900/95 dark:to-gray-900/90 backdrop-blur-sm"></div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            {/* Left Column - Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight mb-4 sm:mb-6 text-gray-900 dark:text-white">
                <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-mint-600/90 to-mint-300/90">
                  {settings?.home_title || 'Transform Your Face Naturally'}
                </span>
              </h1>
              <p className="mt-4 sm:mt-6 text-lg sm:text-xl md:text-2xl leading-relaxed text-gray-600 dark:text-gray-300">
                {settings?.home_subtitle || 'Experience the power of guided face yoga exercises for natural rejuvenation and radiant skin'}
              </p>

              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={scrollToSignup}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-mint-600 to-mint-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium text-base sm:text-lg flex items-center justify-center gap-2"
                >
                  Join Waitlist <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="#features"
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white dark:bg-gray-800 text-mint-600 dark:text-mint-400 rounded-xl shadow-md hover:shadow-lg transition-all font-medium text-base sm:text-lg flex items-center justify-center gap-2"
                >
                  Learn More <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.a>
              </div>

              {/* Social Proof */}
              <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center gap-4 sm:gap-8 justify-center lg:justify-start">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-mint-300 to-mint-400 border-2 border-white" />
                  ))}
                </div>
                <div className="text-gray-600 text-sm sm:text-base dark:text-gray-300">
                  <span className="font-semibold text-mint-600">100+</span> happy users
                </div>
              </div>
            </motion.div>

            {/* Right Column - Feature Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative flex items-center justify-center"
            >
              <div className="relative w-[80%] aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                <BeforeAfterSlider
                  beforeImage="/images/before-sample.jpg"
                  afterImage="/images/after-sample.jpg"
                  beforeLabel=""
                  afterLabel=""
                />
                
                {/* Results Label */}
                {/* <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                  <span className="text-mint-700 font-semibold">Real Results</span>
                </div> */}
              </div>
              
              {/* Floating Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-6 left-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 flex items-center gap-3"
              >
                <div className="p-3 bg-mint-50 dark:bg-gray-700 rounded-xl">
                  <Award className="w-6 h-6 text-mint-600 dark:text-mint-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Success Rate</div>
                  <div className="font-bold text-xl dark:text-white">98%</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Why Choose Our App?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Discover the features that make our face yoga app unique
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Calendar className="w-8 h-8 text-mint-600 dark:text-mint-400" />,
                title: "Daily Routines",
                description: "Personalized face yoga routines tailored to your goals and schedule"
              },
              {
                icon: <Camera className="w-8 h-8 text-mint-600 dark:text-mint-400" />,
                title: "Progress Tracking",
                description: "Advanced photo tools to track and visualize your transformation journey"
              },
              {
                icon: <GraduationCap className="w-8 h-8 text-mint-600 dark:text-mint-400" />,
                title: "Expert Guidance",
                description: "Learn from certified instructors with structured video courses"
              },
              {
                icon: <Clock className="w-8 h-8 text-mint-600 dark:text-mint-400" />,
                title: "Time-Efficient",
                description: "Quick 10-minute exercises that fit into your busy lifestyle"
              },
              {
                icon: <Users className="w-8 h-8 text-mint-600 dark:text-mint-400" />,
                title: "Community Support",
                description: "Join a supportive community of face yoga enthusiasts"
              },
              {
                icon: <Crown className="w-8 h-8 text-mint-600 dark:text-mint-400" />,
                title: "Premium Content",
                description: "Access exclusive exercises and premium features"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-mint-50/50 dark:bg-gray-800/50 rounded-2xl p-6 hover:bg-mint-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="bg-white dark:bg-gray-700 w-16 h-16 rounded-xl shadow-md flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Waitlist Section */}
      <section id="signup-form" className="py-20 bg-gradient-to-b from-mint-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Be the First to Experience</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Join our exclusive waitlist and get early access to transform your face naturally
            </p>
            
            <form onSubmit={handleSignup} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-xl border border-mint-200 focus:outline-none focus:ring-2 focus:ring-mint-500 focus:border-transparent dark:border-gray-600"
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-4 bg-mint-600 text-white rounded-xl hover:bg-mint-700 transition-colors font-medium text-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    Join Waitlist
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-300">Be the first to know when we launch. No spam, ever.</p>
          </motion.div>
        </div>
      </section>

      {/* Before/After Gallery */}
      <section className="py-24 bg-gradient-to-b from-white via-white to-mint-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 relative">
        <div className="absolute inset-0 bg-[url('/images/pattern-bg.svg')] opacity-5 dark:opacity-[0.02]"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-4">
              Real Results from Our Community
            </h2>
            <p className="text-xl leading-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              See the amazing transformations achieved by our dedicated members through consistent practice
            </p>
          </motion.div>

          {/* Before/After Image Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
              <BeforeAfterSlider
                beforeImage="/images/transformations/before1.jpg"
                afterImage="/images/transformations/after1.jpg"
                weeks={8}
              />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
              <BeforeAfterSlider
                beforeImage="/images/transformations/before2.jpg"
                afterImage="/images/transformations/after2.jpg"
                weeks={12}
              />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
              <BeforeAfterSlider
                beforeImage="/images/transformations/before3.jpg"
                afterImage="/images/transformations/after3.jpg"
                weeks={10}
              />
            </div>
          </div>

          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 inline-block">
              <img 
                src="/images/transformations/face-yoga-method-logo.jpg" 
                alt="Face Yoga Method" 
                className="h-24 mx-auto object-contain"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-gradient-to-b from-white via-white to-mint-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="absolute inset-0 bg-[url('/images/pattern-bg.svg')] opacity-5 dark:opacity-[0.02]"></div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center"
        >
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
            Start Your Face Yoga Journey Today
          </h2>
          <p className="text-xl leading-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
            Join our community and experience the transformative power of face yoga
          </p>
          <motion.button
            whileHover={{ y: -2 }}
            onClick={scrollToSignup}
            className="rounded-xl bg-gradient-to-r from-mint-600 to-mint-500 px-8 py-4 font-semibold text-white shadow-lg hover:shadow-xl hover:from-mint-700 hover:to-mint-600 transition-all duration-300"
          >
            Get Started Now
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
};

export default Landing;

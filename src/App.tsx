import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import CourseManager from './pages/Admin/CourseManager';
import FeedbackManager from './pages/Admin/FeedbackManager';
import Goals from './pages/Goals';
import AdminGoals from './pages/Admin/Goals';
import UserManager from './pages/Admin/UserManager';
import SettingsManager from './pages/Admin/SettingsManager';
import { useAuth } from './hooks/useAuth';
import AuthGuard from './components/AuthGuard';
import AdminGuard from './components/AdminGuard';
import LoadingScreen from './components/LoadingScreen';
import UserDashboard from './pages/UserDashboard';
import Lessons from './pages/Lessons';
import LessonDetails from './pages/LessonDetails';
import LessonHistory from './pages/LessonHistory';
import Progress from './pages/Progress';
import Coaching from './pages/Coaching';
import Resources from './pages/Resources';
import GoalAnalytics from './pages/GoalAnalytics';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import Landing from './pages/Landing';
import AdminDashboard from './pages/Admin/Dashboard';
import LessonManager from './pages/Admin/LessonManager';
import Feedback from './pages/Feedback';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { useTheme } from './components/ThemeProvider';
import { lightTheme, darkTheme } from './theme/mui-theme';

// App content component that uses router hooks
function AppContent() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-mint-50 dark:bg-gray-900 pattern-bg flex flex-col">
      {user && <Navbar />}
      <main className={`flex-1 ${user ? 'mt-0' : 'mt-0'}`}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/" element={!user ? <Landing /> : <Home />} />
          
          {/* Protected routes - require authentication */}
          {user && (
            <>
              {/* Admin routes */}
              <Route path="/admin/*" element={<AdminGuard><Admin /></AdminGuard>} />
              
              {/* Onboarding route */}
              <Route path="/onboarding" element={<Onboarding />} />

              {/* Regular user routes */}
              {!profile?.onboarding_completed ? (
                <Route path="*" element={<Navigate to="/onboarding" replace />} />
              ) : (
                <>
                  <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
                  <Route path="/my-courses" element={<AuthGuard><UserDashboard /></AuthGuard>} />
                  <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />
                  <Route path="/lessons" element={<AuthGuard><Lessons /></AuthGuard>} />
                  <Route path="/lessons/:lessonId" element={<AuthGuard><LessonDetails /></AuthGuard>} />
                  <Route path="/courses/:courseId/lessons/:lessonId" element={<AuthGuard><LessonDetails /></AuthGuard>} />
                  <Route path="/lesson-history" element={<AuthGuard><LessonHistory /></AuthGuard>} />
                  <Route path="/courses" element={<AuthGuard><Courses /></AuthGuard>} />
                  <Route path="/courses/:courseId" element={<AuthGuard><CourseDetails /></AuthGuard>} />
                  <Route path="/courses/free/lessons/:lessonId" element={<AuthGuard><LessonDetails /></AuthGuard>} />
                  <Route path="/progress" element={<AuthGuard><Progress /></AuthGuard>} />
                  <Route path="/progress/entry/:entryId" element={<AuthGuard><Progress /></AuthGuard>} />
                  <Route path="/coaching" element={<AuthGuard><Coaching /></AuthGuard>} />
                  <Route path="/resources" element={<AuthGuard><Resources /></AuthGuard>} />
                  <Route path="/goals" element={<AuthGuard><Goals /></AuthGuard>} />
                  <Route path="/goals/analytics" element={<AuthGuard><GoalAnalytics /></AuthGuard>} />
                  <Route path="/feedback" element={<AuthGuard><Feedback /></AuthGuard>} />
                </>
              )}
            </>
          )}

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </main>
    </div>
  );
}

// Main App component that provides the Router context
function App() {
  const { theme } = useTheme();
  const muiTheme = theme === 'dark' ? darkTheme : lightTheme;

  // Add global error boundary
  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      toast.error('An unexpected error occurred. Please try again.');
      event.preventDefault();
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      if (event.reason?.message?.includes('connection')) {
        toast.error('Connection error. Please check your internet connection.');
      } else if (event.reason?.message?.includes('JWT')) {
        return;
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
      
      event.preventDefault();
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <Router>
      <MuiThemeProvider theme={muiTheme}>
        <AppContent />
      </MuiThemeProvider>
    </Router>
  );
}

export default App;
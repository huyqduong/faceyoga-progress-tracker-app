import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Exercises from './pages/Exercises';
import ExerciseDetails from './pages/ExerciseDetails';
import ExerciseHistory from './pages/ExerciseHistory';
import Progress from './pages/Progress';
import Coaching from './pages/Coaching';
import Resources from './pages/Resources';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import CourseManager from './pages/Admin/CourseManager';
import CourseDetails from './pages/CourseDetails';
import Courses from './pages/Courses';
import Goals from './pages/Goals';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import AuthGuard from './components/AuthGuard';
import AdminGuard from './components/AdminGuard';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-mint-50 pattern-bg flex flex-col">
        {user && !profile?.onboarding_completed ? (
          <Routes>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="*" element={<Navigate to="/onboarding" replace />} />
          </Routes>
        ) : (
          <>
            {user && <Navbar />}
            <main className={`flex-1 ${user ? 'mt-0' : 'mt-0'}`}>
              <Routes>
                <Route path="/login" element={
                  user ? <Navigate to="/" replace /> : <Login />
                } />
                <Route path="/" element={<AuthGuard><Home /></AuthGuard>} />
                <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
                <Route path="/exercises" element={<AuthGuard><Exercises /></AuthGuard>} />
                <Route path="/exercises/:exerciseId" element={<AuthGuard><ExerciseDetails /></AuthGuard>} />
                <Route path="/exercise-history" element={<AuthGuard><ExerciseHistory /></AuthGuard>} />
                <Route path="/courses" element={<AuthGuard><Courses /></AuthGuard>} />
                <Route path="/courses/:courseId" element={<AuthGuard><CourseDetails /></AuthGuard>} />
                <Route path="/progress" element={<AuthGuard><Progress /></AuthGuard>} />
                <Route path="/coaching" element={<AuthGuard><Coaching /></AuthGuard>} />
                <Route path="/resources" element={<AuthGuard><Resources /></AuthGuard>} />
                <Route path="/goals" element={<AuthGuard><Goals /></AuthGuard>} />
                <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />
                <Route path="/admin" element={<AdminGuard><Admin /></AdminGuard>} />
                <Route path="/admin/courses" element={<AdminGuard><CourseManager /></AdminGuard>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </>
        )}
      </div>
    </Router>
  );
}

export default App;
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage         from './pages/HomePage';
import LoginPage        from './pages/LoginPage';
import RegisterPage     from './pages/RegisterPage';
import CoursesPage      from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import MyCoursesPage    from './pages/MyCoursesPage';
import AdminDashboard   from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Navbar           from './components/Navbar';
import Footer           from './components/Footer';
import ProtectedRoute   from './components/ProtectedRoute';
import { useAuth }      from './context/AuthContext';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage  from './pages/ResetPasswordPage';

// Pages that use the DashboardLayout don't need Navbar/Footer
const DASHBOARD_PATHS = ['/dashboard', '/admin', '/my-courses', '/profile'];

function App() {
  const { isLoggedIn } = useAuth();
  const isDashboard = DASHBOARD_PATHS.some(p =>
    window.location.pathname.startsWith(p)
  );

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {!isDashboard && <Navbar />}

        <main className={isDashboard ? '' : 'flex-grow bg-gray-50 dark:bg-gray-950'}>
          <Routes>
            {/* Public */}
            <Route path="/"            element={<HomePage />} />
            <Route path="/login"       element={<LoginPage />} />
            <Route path="/register"    element={<RegisterPage />} />
            <Route path="/courses"     element={<CoursesPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
            <Route path="/forgot-password"       element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

            {/* Student dashboard */}
            <Route path="/dashboard" element={
              <ProtectedRoute><StudentDashboard /></ProtectedRoute>
            } />
            <Route path="/my-courses" element={
              <ProtectedRoute><MyCoursesPage /></ProtectedRoute>
            } />

            {/* Admin dashboard */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
            } />
          </Routes>
        </main>

        {!isDashboard && <Footer />}
      </div>
    </Router>
  );
}

export default App;
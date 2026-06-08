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
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage  from './pages/ResetPasswordPage';
import QuizPage       from './pages/QuizPage';
import QuizResultPage from './pages/QuizResultPage';
import CertificateVerifyPage from './pages/CertificateVerifyPage';


// Pages that use the DashboardLayout don't need Navbar/Footer
const DASHBOARD_PATHS = ['/dashboard', '/admin', '/my-courses', '/profile', '/quiz'];

function App() {
  const isDashboard = DASHBOARD_PATHS.some(p =>
    window.location.pathname.startsWith(p)
  );

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        {!isDashboard && <Navbar />}

        <main className="flex-grow bg-background">
          <Routes>
            {/* Public */}
            <Route path="/"            element={<HomePage />} />
            <Route path="/login"       element={<LoginPage />} />
            <Route path="/register"    element={<RegisterPage />} />
            <Route path="/courses"     element={<CoursesPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
            <Route path="/forgot-password"       element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/verify/:certificateId" element={<CertificateVerifyPage />} />

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
            <Route path="/quiz/:quizId"         element={
              <ProtectedRoute><QuizPage /></ProtectedRoute>
            } />
            <Route path="/quiz/:quizId/results" element={
              <ProtectedRoute><QuizResultPage /></ProtectedRoute>
            } />
          </Routes>
        </main>

        {!isDashboard && <Footer />}
      </div>
    </Router>
  );
}

export default App;
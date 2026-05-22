// App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages
import HomePage         from './pages/HomePage';
import LoginPage        from './pages/LoginPage';
import RegisterPage     from './pages/RegisterPage';
import CoursesPage      from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import MyCoursesPage    from './pages/MyCoursesPage';
import AdminDashboard   from './pages/AdminDashboard';

// Components
import Navbar           from './components/Navbar';
import Footer           from './components/Footer';
import ProtectedRoute   from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-grow bg-gray-50">
          <Routes>
            {/* Public Routes — anyone can visit */}
            <Route path="/"            element={<HomePage />} />
            <Route path="/login"       element={<LoginPage />} />
            <Route path="/register"    element={<RegisterPage />} />
            <Route path="/courses"     element={<CoursesPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />

            {/* Protected — logged-in students only */}
            <Route path="/my-courses" element={
              <ProtectedRoute>
                <MyCoursesPage />
              </ProtectedRoute>
            } />

            {/* Protected — admins only */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
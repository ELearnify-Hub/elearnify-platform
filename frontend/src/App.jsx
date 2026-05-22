// App.jsx — Main Router Configuration
// This file defines all the URL routes in our application

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import MyCoursesPage from './pages/MyCoursesPage';
import AdminDashboard from './pages/AdminDashboard';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      {/* Navbar appears on every page */}
      <Navbar />

      {/* Main content area */}
      <main className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/"               element={<HomePage />} />
          <Route path="/login"          element={<LoginPage />} />
          <Route path="/register"       element={<RegisterPage />} />
          <Route path="/courses"        element={<CoursesPage />} />
          <Route path="/courses/:id"    element={<CourseDetailPage />} />
          <Route path="/my-courses"     element={<MyCoursesPage />} />
          <Route path="/admin"          element={<AdminDashboard />} />
        </Routes>
      </main>

      {/* Footer appears on every page */}
      <Footer />
    </Router>
  );
}

export default App;
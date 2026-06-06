// pages/StudentDashboard.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, PlayCircle, Award, Clock,
  TrendingUp, ArrowRight, Flame
} from 'lucide-react';
import { enrollmentAPI, courseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import DashboardLayout    from '../layouts/DashboardLayout';
import StatCard           from '../components/StatCard';
import CourseProgressCard from '../components/CourseProgressCard';
import Loader             from '../components/Loader';

const StudentDashboard = () => {
  const { user }              = useAuth();
  const location              = useLocation();
  const [myCourses, setMyCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading,   setLoading]   = useState(true);

  // Function to fetch data
  const fetchData = async () => {
    try {
      const [enrolledRes, coursesRes] = await Promise.all([
        enrollmentAPI.getMyCourses(),
        courseAPI.getAll({ limit: 4 })
      ]);
      console.log('Enrolled courses response:', enrolledRes.data);
      setMyCourses(enrolledRes.data.courses || []);
      setAllCourses(coursesRes.data.courses || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when navigating back with refresh signal
  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [location.pathname, location.state?.refresh]);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) return (
    <DashboardLayout title="Dashboard">
      <Loader text="Loading your dashboard..." />
    </DashboardLayout>
  );

  return (
    <DashboardLayout
      title="My Dashboard"
      subtitle={`${getGreeting()}, ${user?.name?.split(' ')[0]}! 👋`}>

      {/* ── Welcome Banner ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1,  y:  0 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl
          p-6 mb-6 text-white relative overflow-hidden">

        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10
          rounded-full" />
        <div className="absolute -right-4 -bottom-10 w-28 h-28 bg-white/10
          rounded-full" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Flame size={18} className="text-yellow-300" />
            <span className="text-blue-100 text-sm">Keep it up!</span>
          </div>
          <h2 className="text-2xl font-bold mb-1">
            {getGreeting()}, {user?.name?.split(' ')[0]}!
          </h2>
          <p className="text-blue-100 text-sm mb-4">
            You have {myCourses.length} active course{myCourses.length !== 1 ? 's' : ''}.
            Keep learning every day!
          </p>
          <Link to="/courses"
            className="inline-flex items-center gap-2 bg-white text-blue-600
              font-semibold text-sm px-4 py-2 rounded-xl hover:bg-blue-50
              transition-colors">
            Browse New Courses
            <ArrowRight size={16} />
          </Link>
        </div>
      </motion.div>

      {/* ── Stat Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={BookOpen}
          label="Enrolled Courses"
          value={myCourses.length}
          color="blue"
          delay={0}
          trend={12}
        />
        <StatCard
          icon={PlayCircle}
          label="In Progress"
          value={myCourses.length}
          color="purple"
          delay={0.1}
        />
        <StatCard
          icon={Award}
          label="Completed"
          value={0}
          color="green"
          delay={0.2}
          trend={0}
        />
        <StatCard
          icon={Clock}
          label="Hours Learned"
          value="12h"
          color="orange"
          delay={0.3}
          trend={8}
        />
      </div>

      {/* ── Continue Learning ─────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Continue Learning
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Pick up where you left off
            </p>
          </div>
          <Link to="/my-courses"
            className="text-blue-600 dark:text-blue-400 text-sm font-medium
              hover:underline flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {myCourses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border
              border-dashed border-gray-200 dark:border-gray-700
              p-10 text-center">
            <BookOpen size={40} className="mx-auto text-gray-300
              dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 mb-3">
              You haven't enrolled in any courses yet
            </p>
            <Link to="/courses"
              className="inline-flex items-center gap-2 bg-blue-600
                hover:bg-blue-700 text-white text-sm font-medium
                px-5 py-2 rounded-xl transition-colors">
              Browse Courses
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {myCourses.slice(0, 4).map((course, i) => (
              <CourseProgressCard key={course._id} course={course} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* ── Recommended Courses ───────────────────────────────── */}
      {allCourses.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recommended For You
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Explore new topics
              </p>
            </div>
            <Link to="/courses"
              className="text-blue-600 dark:text-blue-400 text-sm
                font-medium hover:underline flex items-center gap-1">
              See all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {allCourses.map((course, i) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0  }}
                transition={{ delay: i * 0.08 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border
                  border-gray-100 dark:border-gray-800 p-4 shadow-sm
                  hover:shadow-md transition-shadow">
                <span className="text-xs bg-blue-50 dark:bg-blue-900/20
                  text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                  {course.category}
                </span>
                <h3 className="font-semibold text-sm text-gray-900
                  dark:text-white mt-2 mb-1 line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-xs text-gray-400 mb-3">
                  {course.instructor}
                </p>
                <Link to={`/courses/${course._id}`}
                  className="block text-center bg-gray-100 dark:bg-gray-800
                    hover:bg-blue-600 hover:text-white text-gray-700
                    dark:text-gray-300 text-xs font-medium py-2 rounded-xl
                    transition-all">
                  View Course
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentDashboard;
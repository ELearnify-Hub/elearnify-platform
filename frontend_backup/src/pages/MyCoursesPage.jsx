// pages/MyCoursesPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { enrollmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const MyCoursesPage = () => {
  const { user }                    = useAuth();
  const [courses,  setCourses]      = useState([]);
  const [loading,  setLoading]      = useState(true);
  const [error,    setError]        = useState('');
  const [unenrolling, setUnenrolling] = useState(null); // stores courseId being unenrolled

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const { data } = await enrollmentAPI.getMyCourses();
        setCourses(data.courses);
      } catch (err) {
        setError('Failed to load your courses.');
      } finally {
        setLoading(false);
      }
    };
    fetchMyCourses();
  }, []);

  const handleUnenroll = async (courseId, courseTitle) => {
    const confirmed = window.confirm(
      `Are you sure you want to unenroll from "${courseTitle}"?`
    );
    if (!confirmed) return;

    setUnenrolling(courseId);
    try {
      await enrollmentAPI.unenroll(courseId);
      // Remove from local state without re-fetching
      setCourses(prev => prev.filter(c => c._id !== courseId));
    } catch (err) {
      alert('Failed to unenroll. Please try again.');
    } finally {
      setUnenrolling(null);
    }
  };

  if (loading) return <Loader text="Loading your courses..." />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Learning</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Welcome back, <strong>{user?.name}</strong>!
          You are enrolled in {courses.length} course(s).
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          {error}
        </div>
      )}

      {courses.length === 0 ? (
        /* Empty state */
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            You haven't enrolled in any courses yet
          </h2>
          <p className="text-gray-400 dark:text-gray-400 mb-6">
            Browse our library and start learning today!
          </p>
          <Link to="/courses"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors inline-block">
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course._id}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-800">

              {/* Thumbnail */}
              {course.thumbnail ? (
                <img
                  src={`http://localhost:5000/${course.thumbnail}`}
                  alt={course.title}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
                  <span className="text-white text-4xl">🎓</span>
                </div>
              )}

              <div className="p-5 flex flex-col flex-grow">
                {/* Badge */}
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full self-start mb-2">
                  {course.category}
                </span>

                <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-2">{course.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">👨‍🏫 {course.instructor}</p>
                {course.duration && (
                  <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">⏱ {course.duration}</p>
                )}

                {/* Enrolled badge */}
                <div className="mt-auto space-y-2">
                  <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"/>
                    </svg>
                    Enrolled
                  </div>

                  <Link to={`/courses/${course._id}`}
                    className="block text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition-colors">
                    Continue Learning →
                  </Link>

                  <button
                    onClick={() => handleUnenroll(course._id, course.title)}
                    disabled={unenrolling === course._id}
                    className="w-full text-center text-red-400 hover:text-red-600 text-xs py-1 transition-colors disabled:opacity-50">
                    {unenrolling === course._id ? 'Unenrolling...' : 'Unenroll from course'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCoursesPage;
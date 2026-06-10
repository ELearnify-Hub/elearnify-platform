// pages/MyCoursesPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { enrollmentAPI, SERVER_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const getThumbnailUrl = (thumbnail) => {
  if (!thumbnail) return '';

  if (
    thumbnail.startsWith('http://') ||
    thumbnail.startsWith('https://')
  ) {
    return thumbnail;
  }

  return `${SERVER_URL}/${thumbnail}`;
};

const MyCoursesPage = () => {
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [unenrolling, setUnenrolling] = useState(null);

  useEffect(() => {
    const fetchMyCourses = async () => {
      setLoading(true);
      setError('');

      try {
        const { data } = await enrollmentAPI.getMyCourses();
        setCourses(data.courses || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            'Failed to load your courses.'
        );
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
    setError('');
    setSuccess('');

    try {
      const { data } = await enrollmentAPI.unenroll(courseId);

      setCourses((prev) =>
        prev.filter((course) => course._id !== courseId)
      );

      setSuccess(data.message || 'Unenrolled from course successfully.');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to unenroll. Please try again.'
      );
    } finally {
      setUnenrolling(null);
    }
  };

  if (loading) {
    return <Loader text="Loading your courses..." />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          My Learning
        </h1>

        <p className="text-[var(--text-secondary)] mt-1">
          Welcome back, <strong>{user?.name}</strong>! You are enrolled in{' '}
          {courses.length} course(s).
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6 text-sm">
          {success}
        </div>
      )}

      {courses.length === 0 ? (
        /* Empty state */
        <div className="text-center py-20 bg-[var(--surface-1)] rounded-2xl shadow-[var(--shadow-sm)] border border-[var(--border-light)]">
          <div className="text-6xl mb-4">📚</div>

          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            You haven't enrolled in any courses yet
          </h2>

          <p className="text-[var(--text-secondary)] mb-6">
            Browse our library and start learning today!
          </p>

          <Link
            to="/courses"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors inline-block"
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course._id}
              className="bg-[var(--surface-1)] rounded-2xl shadow-[var(--shadow-sm)] overflow-hidden flex flex-col hover:shadow-[var(--shadow-md)] transition-all duration-300 border border-[var(--border-light)]"
            >

              {/* Thumbnail */}
              {course.thumbnail ? (
                <img
                  src={getThumbnailUrl(course.thumbnail)}
                  alt={course.title}
                  className="w-full h-40 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}

              <div
                className={`${course.thumbnail ? 'hidden' : ''} w-full h-40 bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center`}
              >
                <BookOpen size={42} className="text-white opacity-80" />
              </div>

              <div className="p-5 flex flex-col flex-grow">

                {/* Badge */}
                <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full self-start mb-2">
                  {course.category || 'Course'}
                </span>

                <h3 className="font-bold text-[var(--text-primary)] mb-1 line-clamp-2">
                  {course.title}
                </h3>

                <p className="text-sm text-[var(--text-secondary)] mb-1">
                  👨‍🏫 {typeof course.instructor === 'object'
                    ? course.instructor?.name
                    : course.instructor}
                </p>

                {course.duration && (
                  <p className="text-sm text-[var(--text-muted)] mb-4 flex items-center gap-1">
                    <Clock size={14} />
                    {course.duration}
                  </p>
                )}

                <div className="mt-auto space-y-2">

                  {/* Enrolled badge */}
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium">
                    <CheckCircle size={16} />
                    Enrolled
                  </div>

                  <Link
                    to={`/courses/${course._id}`}
                    className="block text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
                  >
                    Continue Learning →
                  </Link>

                  <button
                    onClick={() => handleUnenroll(course._id, course.title)}
                    disabled={unenrolling === course._id}
                    className="w-full flex items-center justify-center gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={13} />
                    {unenrolling === course._id
                      ? 'Unenrolling...'
                      : 'Unenroll from course'}
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
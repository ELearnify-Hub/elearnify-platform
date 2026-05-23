// pages/CourseDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseAPI, enrollmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const CourseDetailPage = () => {
  const { id }       = useParams();       // Gets :id from the URL
  const navigate     = useNavigate();
  const { isLoggedIn, isAdmin, user } = useAuth();

  const [course,     setCourse]     = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [enrolling,  setEnrolling]  = useState(false);
  const [enrolled,   setEnrolled]   = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);
  const [message,    setMessage]    = useState('');

  // ── Fetch course details ───────────────────────────────────────────────────
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data } = await courseAPI.getById(id);
        setCourse(data.course);

        // Set first video as active by default
        if (data.course.videos?.length > 0) {
          setActiveVideo(data.course.videos[0]);
        }

        // Check if current user is already enrolled
        if (user && data.course.enrolledStudents) {
          const isEnrolled = data.course.enrolledStudents.includes(user._id);
          setEnrolled(isEnrolled);
        }
      } catch (err) {
        setError('Course not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, user]);

  // ── Handle Enroll ──────────────────────────────────────────────────────────
  const handleEnroll = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    setEnrolling(true);
    setMessage('');

    try {
      const { data } = await enrollmentAPI.enroll(id);
      setEnrolled(true);
      setMessage(data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Enrollment failed.');
    } finally {
      setEnrolling(false);
    }
  };

  // ── Handle PDF Download ────────────────────────────────────────────────────
  const handleDownload = (filePath, title) => {
    // Create a temporary <a> tag and click it to trigger download
    const link = document.createElement('a');
    link.href = `http://localhost:5000/${filePath}`;
    link.download = title;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <Loader text="Loading course..." />;
  if (error)   return (
    <div className="text-center py-20 text-red-500">
      <div className="text-5xl mb-4">😕</div>
      <p>{error}</p>
    </div>
  );

  // Can the user access video/pdf content?
  const canAccessContent = enrolled || isAdmin;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── LEFT: Main Content ───────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Course Header */}
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
                {course.category}
              </span>
              <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                {course.level}
              </span>
              {course.isPublished
                ? <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">Published</span>
                : <span className="bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full">Draft</span>
              }
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-3">{course.title}</h1>
            <p className="text-gray-600 leading-relaxed">{course.description}</p>

            <div className="flex flex-wrap gap-5 mt-4 text-sm text-gray-500">
              <span>👨‍🏫 <strong>{course.instructor}</strong></span>
              {course.duration && <span>⏱ {course.duration}</span>}
              <span>👥 {course.enrolledStudents?.length || 0} students</span>
              <span>🎥 {course.videos?.length || 0} lessons</span>
              <span>📄 {course.pdfs?.length || 0} materials</span>
            </div>
          </div>

          {/* ── Video Player ─────────────────────────────────────── */}
          {course.videos?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gray-900 p-4 flex items-center justify-between">
                <h2 className="text-white font-semibold text-sm">
                  🎥 {activeVideo?.title || 'Video Lessons'}
                </h2>
                {!canAccessContent && (
                  <span className="text-yellow-400 text-xs">🔒 Enroll to watch</span>
                )}
              </div>

              {canAccessContent ? (
                <div>
                  {/* Video player */}
                  <video
                    key={activeVideo?._id}
                    controls
                    className="w-full bg-black"
                    style={{ maxHeight: '400px' }}>
                    <source
                      src={`http://localhost:5000/${activeVideo?.filePath}`}
                      type="video/mp4"
                    />
                    Your browser does not support the video tag.
                  </video>

                  {/* Lesson list */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">
                      All Lessons
                    </h3>
                    <div className="space-y-2">
                      {course.videos.map((video, index) => (
                        <button
                          key={video._id}
                          onClick={() => setActiveVideo(video)}
                          className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm
                            ${activeVideo?._id === video._id
                              ? 'bg-blue-50 border border-blue-200 text-blue-700'
                              : 'hover:bg-gray-50 text-gray-700'
                            }`}>
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                            ${activeVideo?._id === video._id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-600'
                            }`}>
                            {index + 1}
                          </span>
                          <span className="flex-grow">{video.title}</span>
                          {video.duration && (
                            <span className="text-gray-400 text-xs">{video.duration}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Locked state */
                <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-gray-50">
                  <div className="text-6xl mb-4">🔒</div>
                  <p className="font-medium text-gray-600">Enroll to access video lessons</p>
                  <p className="text-sm mt-1">{course.videos.length} lessons available</p>
                </div>
              )}
            </div>
          )}

          {/* ── PDF Materials ─────────────────────────────────────── */}
          {course.pdfs?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gray-800 p-4">
                <h2 className="text-white font-semibold text-sm">
                  📄 Study Materials ({course.pdfs.length})
                </h2>
              </div>

              <div className="p-4 space-y-3">
                {course.pdfs.map((pdf, index) => (
                  <div key={pdf._id}
                    className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-red-600 text-xs font-bold">PDF</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">{pdf.title}</p>
                        <p className="text-xs text-gray-400">Study material {index + 1}</p>
                      </div>
                    </div>

                    {canAccessContent ? (
                      <button
                        onClick={() => handleDownload(pdf.filePath, pdf.title)}
                        className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                        </svg>
                        Download
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs flex items-center gap-1">
                        🔒 Locked
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Enrollment Card ────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-6">

            {/* Thumbnail */}
            {course.thumbnail ? (
              <img
                src={`http://localhost:5000/${course.thumbnail}`}
                alt={course.title}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
                <span className="text-white text-5xl">🎓</span>
              </div>
            )}

            <div className="p-5 space-y-4">
              {/* Price */}
              <div className="text-3xl font-extrabold text-gray-900">
                {course.price === 0 ? (
                  <span className="text-green-600">Free</span>
                ) : (
                  `$${course.price}`
                )}
              </div>

              {/* Success / Info message */}
              {message && (
                <div className={`text-sm px-3 py-2 rounded-lg ${
                  enrolled
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {message}
                </div>
              )}

              {/* Enroll Button */}
              {!isAdmin && (
                enrolled ? (
                  <div className="space-y-2">
                    <div className="w-full text-center bg-green-50 border border-green-300 text-green-700 font-semibold py-3 rounded-xl text-sm">
                      ✅ You are enrolled
                    </div>
                    <button
                      onClick={() => navigate('/my-courses')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
                      Go to My Courses →
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3 rounded-xl transition-colors">
                    {enrolling ? 'Enrolling...' : isLoggedIn ? 'Enroll Now — Free' : 'Login to Enroll'}
                  </button>
                )
              )}

              {/* What you get */}
              <div className="border-t pt-4 space-y-2 text-sm text-gray-600">
                <p className="font-semibold text-gray-800 mb-2">This course includes:</p>
                {course.videos?.length > 0 && (
                  <p>🎥 {course.videos.length} video lesson(s)</p>
                )}
                {course.pdfs?.length > 0 && (
                  <p>📄 {course.pdfs.length} downloadable resource(s)</p>
                )}
                {course.duration && <p>⏱ {course.duration} total length</p>}
                <p>📱 Full lifetime access</p>
                <p>🏆 Certificate of completion</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
// pages/CourseDetailPage.jsx — Redesigned with module/lesson sidebar
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence }     from 'framer-motion';
import {
  PlayCircle, FileText, ChevronDown, ChevronRight,
  Lock, CheckCircle, Clock, Users, BookOpen,
  Download, Eye, ArrowRight
} from 'lucide-react';
import { courseAPI, enrollmentAPI, moduleAPI, quizAPI, certificateAPI } from '../services/api';
import { useAuth }     from '../context/AuthContext';
import { SERVER_URL }  from '../services/api';
import Loader          from '../components/Loader';

// ── Lesson icon by type ───────────────────────────────────────────────────────
const LessonIcon = ({ type, size = 16 }) => {
  if (type === 'pdf')  return <FileText size={size} className="text-red-500"  />;
  if (type === 'text') return <FileText size={size} className="text-green-500"/>;
  return <PlayCircle size={size} className="text-blue-500" />;
};

const CourseDetailPage = () => {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { isLoggedIn, isAdmin, user } = useAuth();
  const videoRef    = useRef(null);

  const [course,       setCourse]       = useState(null);
  const [modules,      setModules]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [enrolled,     setEnrolled]     = useState(false);
  const [enrolling,    setEnrolling]    = useState(false);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completed,    setCompleted]    = useState(new Set());
  const [expandedMods,  setExpandedMods]  = useState(new Set());
  const [moduleQuizzes, setModuleQuizzes] = useState({});
  const [message,       setMessage]       = useState('');
  const [certificate, setCertificate] = useState(null);

  // ── Fetch course + modules ────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        const { data } = await courseAPI.getById(id);
        const courseData = data.course;

        if (!mounted) return;
        setCourse(courseData);

        if (user && courseData.enrolledStudents) {
          setEnrolled(
            courseData.enrolledStudents
              .map(s => s.toString())
              .includes(user._id?.toString())
          );
        } else {
          setEnrolled(false);
        }

        let mods = [];
        try {
          const modRes = await moduleAPI.getModules(id);
          mods = modRes.data.modules || [];
        } catch {
          mods = [];
        }

        if (!mounted) return;
        setModules(mods);
        setExpandedMods(new Set(mods.map(m => m._id)));

        if (mods.length > 0 && mods[0].lessons?.length > 0) {
          setActiveLesson({
            lesson: mods[0].lessons[0],
            moduleId: mods[0]._id
          });
        } else {
          setActiveLesson(null);
        }

        try {
          const quizRes = await quizAPI.getByCourse(id);
          const quizMap = {};
          quizRes.data.quizzes?.forEach(quiz => {
            if (quiz.moduleId) quizMap[quiz.moduleId.toString()] = quiz;
          });
          if (mounted) setModuleQuizzes(quizMap);
        } catch {
          if (mounted) setModuleQuizzes({});
        }
      } catch {
        if (mounted) setError('Course not found or failed to load.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [id, user]);

  useEffect(() => {
    if (isLoggedIn && id) {
      fetchCertificate();
    } else {
      setCertificate(null);
    }
  }, [id, isLoggedIn]);
  
  // ── Toggle module expand ──────────────────────────────────────────────────
  const toggleModule = (moduleId) => {
    setExpandedMods(prev => {
      const next = new Set(prev);
      next.has(moduleId) ? next.delete(moduleId) : next.add(moduleId);
      return next;
    });
  };

  // ── Handle lesson click ───────────────────────────────────────────────────
  const handleLessonClick = (lesson, moduleId) => {
    const canAccess = enrolled || isAdmin || lesson.isFreePreview;
    if (!canAccess) {
      setMessage('Enroll in this course to access this lesson.');
      return;
    }
    setActiveLesson({ lesson, moduleId });
    setMessage('');
    // Scroll to top on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Mark lesson complete ──────────────────────────────────────────────────
  const handleMarkComplete = async (lessonId, moduleId) => {
    if (!enrolled) return;
    try {
      const { data } = await moduleAPI.markComplete(id, lessonId, moduleId);
      setCompleted(prev => new Set([...prev, lessonId]));

      if (data.certificate) {
        setCertificate(data.certificate);
        setMessage('🎉 Course completed! Your certificate is ready.');
      }
    } catch {
      console.error('Failed to mark complete');
    }
  };

  const fetchCertificate = async () => {
    try {
      const { data } = await certificateAPI.getMyForCourse(id);
      setCertificate(data.certificate);
    } catch (error) {
      setCertificate(null);
    }
  };

  const downloadCertificate = async () => {
    try {
      const response = await certificateAPI.downloadFile(certificate.certificateId);

      const blob = new Blob([response.data], {
      type: 'application/pdf'
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = `${certificate.certificateId}.pdf`;
      link.click();

      window.URL.revokeObjectURL(url);

    } catch (error) {
      alert('Failed to download certificate');
    }
  };

  // ── Enroll ────────────────────────────────────────────────────────────────
  const handleEnroll = async () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    setEnrolling(true);
    try {
      const { data } = await enrollmentAPI.enroll(id);
      console.log('Enrollment response:', data);
      setEnrolled(true);
      setMessage(data.message);
      // Navigate to dashboard with refresh signal
      setTimeout(() => {
        navigate('/dashboard', { state: { refresh: true } });
      }, 1000);
    } catch (err) {
      console.error('Enrollment error:', err);
      setMessage(err.response?.data?.message || 'Enrollment failed.');
    } finally {
      setEnrolling(false);
    }
  };

  // ── PDF Download ──────────────────────────────────────────────────────────
  const handleDownload = (filePath, title) => {
    const link    = document.createElement('a');
    link.href     = `${SERVER_URL}/${filePath}`;
    link.download = title;
    link.target   = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Progress calc ─────────────────────────────────────────────────────────
  const totalLessons = modules.reduce(
    (sum, m) => sum + (m.lessons?.length || 0), 0
  );
  const progressPct = totalLessons > 0
    ? Math.round((completed.size / totalLessons) * 100)
    : 0;

  if (loading) return <Loader text="Loading course..." />;
  if (error)   return (
    <div className="text-center py-20 text-red-500">
      <div className="text-5xl mb-4">😕</div>
      <p>{error}</p>
    </div>
  );

  const canAccessContent = enrolled || isAdmin;
  const hasModules       = modules.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT: Main Content ─────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Course Header */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0  }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm
                border border-gray-100 dark:border-gray-800">

              <div className="flex flex-wrap gap-2 mb-3">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700
                  dark:text-blue-400 text-xs px-3 py-1 rounded-full font-medium">
                  {course.category}
                </span>
                <span className="bg-gray-100 dark:bg-gray-800 text-gray-600
                  dark:text-gray-400 text-xs px-3 py-1 rounded-full">
                  {course.level}
                </span>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 dark:text-white
                mb-3">
                {course.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm
                leading-relaxed mb-4">
                {course.description}
              </p>

              <div className="flex flex-wrap gap-4 text-sm text-gray-500
                dark:text-gray-400">
                <span>👨‍🏫 {course.instructor}</span>
                {course.duration && <span>⏱ {course.duration}</span>}
                <span className="flex items-center gap-1">
                  <Users size={14} />
                  {course.enrolledStudents?.length || 0} students
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen size={14} />
                  {totalLessons} lessons
                </span>
              </div>
            </motion.div>

            {certificate && (
              <div className="mt-6 p-5 rounded-2xl border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                <h3 className="font-bold text-green-700 dark:text-green-400">
                  🎉 Certificate Earned!
                </h3>

                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Certificate ID: {certificate.certificateId}
                </p>

                <button
                  onClick={downloadCertificate}
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium"
                > 
                Download Certificate
                </button>
              </div>
            )}

            {/* ── Active Lesson Viewer ─────────────────────────── */}
            {activeLesson && (
              <motion.div
                key={activeLesson.lesson._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden
                  shadow-sm border border-gray-100 dark:border-gray-800">

                {/* Lesson header */}
                <div className="flex items-center justify-between p-4
                  bg-gray-800 dark:bg-gray-950">
                  <div className="flex items-center gap-2">
                    <LessonIcon type={activeLesson.lesson.type} size={18} />
                    <h2 className="text-white font-semibold text-sm">
                      {activeLesson.lesson.title}
                    </h2>
                  </div>
                  {activeLesson.lesson.duration && (
                    <span className="text-gray-400 text-xs flex items-center gap-1">
                      <Clock size={12} />
                      {activeLesson.lesson.duration}
                    </span>
                  )}
                </div>

                {/* Lesson content */}
                {activeLesson.lesson.type === 'video' && activeLesson.lesson.filePath && (
                  <div>
                    <video
                      ref={videoRef}
                      key={activeLesson.lesson.filePath}
                      controls
                      className="w-full bg-black"
                      style={{ maxHeight: '420px' }}
                      onEnded={() => handleMarkComplete(
                        activeLesson.lesson._id,
                        activeLesson.moduleId
                      )}>
                      <source
                        src={`${SERVER_URL}/${activeLesson.lesson.filePath}`}
                        type="video/mp4"
                      />
                    </video>
                  </div>
                )}

                {activeLesson.lesson.type === 'pdf' && activeLesson.lesson.filePath && (
                  <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20
                      rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FileText size={28} className="text-red-600
                        dark:text-red-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white
                      mb-2">
                      {activeLesson.lesson.title}
                    </h3>
                    <button
                      onClick={() => handleDownload(
                        activeLesson.lesson.filePath,
                        activeLesson.lesson.title
                      )}
                      className="inline-flex items-center gap-2 bg-blue-600
                        hover:bg-blue-700 text-white font-medium px-6 py-3
                        rounded-xl transition-colors text-sm">
                      <Download size={16} /> Download PDF
                    </button>
                  </div>
                )}

                {activeLesson.lesson.type === 'text' && (
                  <div className="p-6 prose dark:prose-invert max-w-none
                    text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {activeLesson.lesson.content || 'No content available.'}
                  </div>
                )}

                {/* Mark complete button */}
                {canAccessContent && (
                  <div className="p-4 border-t border-gray-100 dark:border-gray-800
                    flex justify-end">
                    <button
                      onClick={() => handleMarkComplete(
                        activeLesson.lesson._id,
                        activeLesson.moduleId
                      )}
                      className={`flex items-center gap-2 text-sm font-medium
                        px-4 py-2 rounded-xl transition-colors
                        ${completed.has(activeLesson.lesson._id)
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-green-100 dark:hover:bg-green-900/20 hover:text-green-700'
                        }`}>
                      <CheckCircle size={16} />
                      {completed.has(activeLesson.lesson._id)
                        ? 'Completed!'
                        : 'Mark as Complete'
                      }
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Progress Bar (enrolled students) ────────────── */}
            {enrolled && totalLessons > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-5
                shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900
                    dark:text-white">
                    Your Progress
                  </span>
                  <span className="text-sm font-bold text-blue-600
                    dark:text-blue-400">
                    {progressPct}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800
                  rounded-full h-2.5">
                  <motion.div
                    className="bg-blue-600 h-2.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {completed.size} of {totalLessons} lessons completed
                </p>
              </div>
            )}

            {/* No modules yet message */}
            {!hasModules && canAccessContent && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-10
                text-center border border-gray-100 dark:border-gray-800">
                <div className="text-5xl mb-3">🚧</div>
                <p className="text-gray-500 dark:text-gray-400">
                  Course content is being prepared. Check back soon!
                </p>
              </div>
            )}
          </div>

          {/* ── RIGHT: Sidebar ──────────────────────────────────── */}
          <div className="lg:col-span-1 space-y-4">

            {/* Enrollment Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm
              overflow-hidden border border-gray-100 dark:border-gray-800
              sticky top-4">

              {/* Thumbnail */}
              {course.thumbnail ? (
                <img src={`${SERVER_URL}/${course.thumbnail}`} alt={course.title}
                  className="w-full h-44 object-cover" />
              ) : (
                <div className="w-full h-44 bg-gradient-to-br from-blue-500
                  to-indigo-600 flex items-center justify-center">
                  <BookOpen size={48} className="text-white opacity-70" />
                </div>
              )}

              <div className="p-5 space-y-4">
                <div className="text-3xl font-extrabold text-gray-900
                  dark:text-white">
                  {course.price === 0
                    ? <span className="text-green-600">Free</span>
                    : `$${course.price}`
                  }
                </div>

                {message && (
                  <div className={`text-sm px-3 py-2.5 rounded-xl
                    ${enrolled
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                    }`}>
                    {message}
                  </div>
                )}

                {!isAdmin && (
                  enrolled ? (
                    <div className="space-y-3">
                      <div className="w-full text-center bg-green-50
                        dark:bg-green-900/20 border border-green-200
                        dark:border-green-800 text-green-700 dark:text-green-400
                        font-semibold py-3 rounded-xl text-sm">
                        ✅ Enrolled
                      </div>
                      <Link to="/dashboard"
                        className="w-full flex items-center justify-center gap-2
                          bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200
                          dark:hover:bg-blue-900/30 text-blue-700 
                          dark:text-blue-400 font-semibold py-2 rounded-xl
                          transition-colors text-sm">
                        View in My Dashboard
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  ) : (
                    <button onClick={handleEnroll} disabled={enrolling}
                      className="w-full bg-blue-600 hover:bg-blue-700
                        disabled:bg-blue-300 text-white font-bold py-3
                        rounded-xl transition-colors">
                      {enrolling
                        ? 'Enrolling...'
                        : isLoggedIn ? 'Enroll Now' : 'Login to Enroll'
                      }
                    </button>
                  )
                )}

                {/* Course stats */}
                <div className="border-t border-gray-100 dark:border-gray-800
                  pt-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between
                    text-gray-600 dark:text-gray-400">
                    <span>📚 Modules</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {modules.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between
                    text-gray-600 dark:text-gray-400">
                    <span>🎬 Lessons</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {totalLessons}
                    </span>
                  </div>
                  {course.duration && (
                    <div className="flex items-center justify-between
                      text-gray-600 dark:text-gray-400">
                      <span>⏱ Duration</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {course.duration}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between
                    text-gray-600 dark:text-gray-400">
                    <span>👥 Students</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {course.enrolledStudents?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Curriculum Sidebar ───────────────────────────── */}
            {hasModules && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm
                border border-gray-100 dark:border-gray-800 overflow-hidden">

                <div className="px-4 py-3 border-b border-gray-100
                  dark:border-gray-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white
                    text-sm">
                    Course Content
                  </h3>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {modules.map(mod => (
                    <div key={mod._id}>
                      {/* Module header */}
                      <button
                        onClick={() => toggleModule(mod._id)}
                        className="w-full flex items-center gap-2 px-4 py-3
                          bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100
                          dark:hover:bg-gray-800 transition-colors text-left">
                        {expandedMods.has(mod._id)
                          ? <ChevronDown size={14} className="text-gray-500 flex-shrink-0" />
                          : <ChevronRight size={14} className="text-gray-500 flex-shrink-0" />
                        }
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800
                            dark:text-white truncate">
                            {mod.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {mod.lessons?.length || 0} lessons
                          </p>
                        </div>
                      </button>

                      {/* Lessons */}
                      <AnimatePresence>
                        {expandedMods.has(mod._id) && (
                          <motion.div
                            initial={{ height: 0    }}
                            animate={{ height: 'auto' }}
                            exit={{    height: 0    }}
                            className="overflow-hidden">
                            {mod.lessons?.map((lesson) => {
                              const canAccess = canAccessContent || lesson.isFreePreview;
                              const isActive  = activeLesson?.lesson._id === lesson._id;
                              const isDone    = completed.has(lesson._id);

                              return (                            

                                <button
                                  key={lesson._id}
                                  onClick={() => handleLessonClick(lesson, mod._id)}
                                  className={`w-full flex items-center gap-3
                                    px-4 py-3 text-left transition-colors
                                    border-b border-gray-50 dark:border-gray-800/50
                                    ${isActive
                                      ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-l-blue-600'
                                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'
                                    }
                                    ${!canAccess ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>

                                  {/* Status icon */}
                                  <div className="flex-shrink-0">
                                    {isDone ? (
                                      <CheckCircle size={14} className="text-green-500" />
                                    ) : !canAccess ? (
                                      <Lock size={14} className="text-gray-400" />
                                    ) : (
                                      <LessonIcon type={lesson.type} size={14} />
                                    )}
                                  </div>

                                  {/* Lesson info */}
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-xs truncate font-medium
                                      ${isActive
                                        ? 'text-blue-700 dark:text-blue-400'
                                        : 'text-gray-700 dark:text-gray-300'
                                      }`}>
                                      {lesson.title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      {lesson.duration && (
                                        <span className="text-xs text-gray-400">
                                          {lesson.duration}
                                        </span>
                                      )}
                                      {lesson.isFreePreview && !enrolled && (
                                        <span className="text-xs text-green-600
                                          dark:text-green-400 flex items-center gap-0.5">
                                          <Eye size={9} /> Preview
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Quiz button — appears after lessons in sidebar */}
                      {moduleQuizzes[mod._id] && canAccessContent && (
                        <button
                          onClick={() => navigate(`/quiz/${moduleQuizzes[mod._id]._id}`)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left
                          bg-purple-50 dark:bg-purple-900/10 hover:bg-purple-100
                          dark:hover:bg-purple-900/20 transition-colors border-t
                          border-purple-100 dark:border-purple-800/30">
                          <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center
                            justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">?</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-purple-700
                              dark:text-purple-400">
                              Module Quiz
                            </p>
                            <p className="text-xs text-purple-500 dark:text-purple-500">
                              Pass with {moduleQuizzes[mod._id].passingScore}%
                            </p>
                          </div>
                        </button>
                      )}
                    </div>                    
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
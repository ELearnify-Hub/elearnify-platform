// pages/InstructorDashboard.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate }   from 'react-router-dom';
import { motion }              from 'framer-motion';
import {
  BookOpen, Users, BarChart3, PlusCircle,
  Eye, Pencil, Trash2, CheckCircle,
  XCircle, TrendingUp, Award, Clock,
  ArrowRight, GraduationCap, Star
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { instructorAPI, courseAPI } from '../services/api';
import { useAuth }         from '../context/AuthContext';
import DashboardLayout     from '../layouts/DashboardLayout';
import StatCard            from '../components/StatCard';
import Loader              from '../components/Loader';
import { SERVER_URL }      from '../services/api';

// ── Fake trend data (replace with real data in production) ────────────────────
const enrollmentTrend = [
  { month: 'Jan', students: 4  },
  { month: 'Feb', students: 8  },
  { month: 'Mar', students: 6  },
  { month: 'Apr', students: 15 },
  { month: 'May', students: 22 },
  { month: 'Jun', students: 18 },
];

const InstructorDashboard = () => {
  const { user }                        = useAuth();
  const navigate                        = useNavigate();
  const [data,        setData]          = useState(null);
  const [loading,     setLoading]       = useState(true);
  const [activeTab,   setActiveTab]     = useState('overview');
  const [deleting,    setDeleting]      = useState(null);
  const [publishing,  setPublishing]    = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: res } = await instructorAPI.getDashboard();
        setData(res);
      } catch (err) {
        console.error('Instructor dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (courseId, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(courseId);
    try {
      await courseAPI.delete(courseId);
      setData(prev => ({
        ...prev,
        courseStats: prev.courseStats.filter(c => c._id !== courseId),
        stats: {
          ...prev.stats,
          totalCourses: prev.stats.totalCourses - 1
        }
      }));
    } catch { alert('Delete failed.'); }
    finally { setDeleting(null); }
  };

  const handleTogglePublish = async (courseId) => {
    setPublishing(courseId);
    try {
      const { data: res } = await courseAPI.togglePublish(courseId);
      setData(prev => ({
        ...prev,
        courseStats: prev.courseStats.map(c =>
          c._id === courseId
            ? { ...c, isPublished: res.isPublished }
            : c
        )
      }));
    } catch { alert('Failed to update.'); }
    finally { setPublishing(null); }
  };

  if (loading) return (
    <DashboardLayout title="Instructor Dashboard">
      <Loader text="Loading your dashboard..." />
    </DashboardLayout>
  );

  const { stats, courseStats } = data || { stats: {}, courseStats: [] };

  const TABS = [
    { id: 'overview',  label: '📊 Overview'  },
    { id: 'courses',   label: '📚 My Courses' },
    { id: 'students',  label: '👥 Students'  },
    { id: 'profile',   label: '👤 Profile'   },
  ];

  return (
    <DashboardLayout
      title="Instructor Dashboard"
      subtitle={`Welcome back, ${user?.name?.split(' ')[0]}! 👋`}>

      {/* ── Approval Warning ───────────────────────────────────── */}
      {!user?.isApproved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0   }}
          className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200
            dark:border-amber-800 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <Clock size={20} className="text-amber-600 dark:text-amber-400
            flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-400 text-sm">
              Account Pending Approval
            </p>
            <p className="text-amber-700 dark:text-amber-500 text-xs mt-0.5">
              Your instructor account is awaiting admin approval.
              You can create courses, but they won't be visible
              to students until you're approved.
            </p>
          </div>
        </motion.div>
      )}

      {/* ── Header Row ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium
                transition-all
                ${activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}>
              {tab.label}
            </button>
          ))}
        </div>

        <Link to="/instructor/courses/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700
            text-white text-sm font-semibold px-4 py-2.5 rounded-xl
            transition-colors shadow-sm">
          <PlusCircle size={16} /> New Course
        </Link>
      </div>

      {/* ── TAB: Overview ──────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={BookOpen}   label="Total Courses"   value={stats.totalCourses   || 0} color="blue"   delay={0}   trend={8}  />
            <StatCard icon={CheckCircle}label="Published"       value={stats.publishedCount || 0} color="green"  delay={0.1} trend={5}  />
            <StatCard icon={Users}      label="Total Students"  value={stats.totalStudents  || 0} color="purple" delay={0.2} trend={15} />
            <StatCard icon={BookOpen}   label="Total Lessons"   value={stats.totalLessons   || 0} color="orange" delay={0.3} />
          </div>

          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0  }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm
              border border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              📈 Student Enrollment Trend
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={enrollmentTrend}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area
                  type="monotone" dataKey="students"
                  stroke="#3b82f6" fill="url(#colorStudents)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Top courses */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm
            border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4
              border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Your Courses
              </h3>
              <button onClick={() => setActiveTab('courses')}
                className="text-blue-600 dark:text-blue-400 text-sm
                  hover:underline flex items-center gap-1">
                View all <ArrowRight size={14} />
              </button>
            </div>

            {courseStats.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen size={36} className="mx-auto text-gray-300
                  dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 mb-3">
                  No courses yet
                </p>
                <Link to="/instructor/courses/new"
                  className="inline-flex items-center gap-2 bg-blue-600
                    hover:bg-blue-700 text-white text-sm px-4 py-2
                    rounded-xl transition-colors">
                  <PlusCircle size={14} /> Create First Course
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50">
                      {['Course', 'Students', 'Lessons', 'Status'].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-xs
                          font-semibold text-gray-500 dark:text-gray-400
                          uppercase tracking-wide">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {courseStats.slice(0, 5).map(course => (
                      <tr key={course._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl overflow-hidden
                              bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
                              {course.thumbnail ? (
                                <img src={`${SERVER_URL}/${course.thumbnail}`}
                                  alt="" className="w-full h-full object-cover" />
                              ) : (
                                <BookOpen size={18} className="m-auto mt-1.5
                                  text-blue-500" />
                              )}
                            </div>
                            <span className="font-medium text-gray-900
                              dark:text-white truncate max-w-xs">
                              {course.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-gray-500 dark:text-gray-400">
                          {course.enrollments}
                        </td>
                        <td className="px-5 py-3 text-gray-500 dark:text-gray-400">
                          {course.lessons}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1
                            px-2.5 py-1 rounded-full text-xs font-medium
                            ${course.isPublished
                              ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                            }`}>
                            {course.isPublished
                              ? <><CheckCircle size={10}/> Published</>
                              : <><XCircle size={10}/> Draft</>
                            }
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: My Courses ────────────────────────────────────── */}
      {activeTab === 'courses' && (
        <div className="space-y-3">
          {courseStats.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-900
              rounded-2xl border border-dashed border-gray-200
              dark:border-gray-700">
              <BookOpen size={40} className="mx-auto text-gray-300
                dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                You haven't created any courses yet.
              </p>
              <Link to="/instructor/courses/new"
                className="inline-flex items-center gap-2 bg-blue-600
                  hover:bg-blue-700 text-white text-sm font-medium
                  px-5 py-2.5 rounded-xl transition-colors">
                <PlusCircle size={14} /> Create Your First Course
              </Link>
            </div>
          ) : (
            courseStats.map((course, i) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0  }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border
                  border-gray-100 dark:border-gray-800 p-4 flex
                  flex-col md:flex-row gap-4 hover:shadow-md
                  transition-shadow">

                {/* Thumbnail */}
                <div className="flex-shrink-0">
                  {course.thumbnail ? (
                    <img src={`${SERVER_URL}/${course.thumbnail}`}
                      alt={course.title}
                      className="w-20 h-14 object-cover rounded-xl" />
                  ) : (
                    <div className="w-20 h-14 bg-blue-100 dark:bg-blue-900/30
                      rounded-xl flex items-center justify-center">
                      <BookOpen size={20} className="text-blue-500" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white
                      text-sm truncate">
                      {course.title}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full
                      ${course.isPublished
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                      {course.isPublished ? '✅ Published' : '⏳ Draft'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {course.category} • {course.level} •
                    👥 {course.enrollments} students •
                    📚 {course.modules} modules •
                    🎬 {course.lessons} lessons
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 items-center flex-shrink-0">
                  <button
                    onClick={() => handleTogglePublish(course._id)}
                    disabled={publishing === course._id}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium
                      transition-colors disabled:opacity-50
                      ${course.isPublished
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400'
                      }`}>
                    {publishing === course._id
                      ? '...'
                      : course.isPublished ? '⬇ Unpublish' : '⬆ Publish'
                    }
                  </button>

                  <Link to={`/courses/${course._id}`}
                    className="text-xs px-3 py-1.5 bg-gray-100
                      dark:bg-gray-800 text-gray-700 dark:text-gray-400
                      hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg
                      font-medium transition-colors flex items-center gap-1">
                    <Eye size={12} /> Preview
                  </Link>

                  <Link to={`/instructor/courses/${course._id}/edit`}
                    className="text-xs px-3 py-1.5 bg-blue-100
                      dark:bg-blue-900/20 text-blue-700 dark:text-blue-400
                      hover:bg-blue-200 rounded-lg font-medium
                      transition-colors flex items-center gap-1">
                    <Pencil size={12} /> Edit
                  </Link>

                  <button
                    onClick={() => handleDelete(course._id, course.title)}
                    disabled={deleting === course._id}
                    className="text-xs px-3 py-1.5 bg-red-100
                      dark:bg-red-900/20 text-red-700 dark:text-red-400
                      hover:bg-red-200 rounded-lg font-medium transition-colors
                      disabled:opacity-50 flex items-center gap-1">
                    <Trash2 size={12} />
                    {deleting === course._id ? '...' : 'Delete'}
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* ── TAB: Students ──────────────────────────────────────── */}
      {activeTab === 'students' && (
        <InstructorStudentsTab />
      )}

      {/* ── TAB: Profile ───────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <InstructorProfileTab user={user} />
      )}
    </DashboardLayout>
  );
};

// ── Students Sub-Tab ──────────────────────────────────────────────────────────
const InstructorStudentsTab = () => {
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    instructorAPI.getMyStudents()
      .then(({ data }) => setStudents(data.students || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Loading students..." />;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm
      border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Your Students ({students.length})
        </h3>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-600">
          <Users size={36} className="mx-auto mb-3" />
          <p>No students enrolled yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                {['Student', 'Email', 'Enrolled In', 'Joined'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs
                    font-semibold text-gray-500 dark:text-gray-400
                    uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {students.map(student => (
                <tr key={student._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600
                        flex items-center justify-center text-white
                        text-sm font-bold flex-shrink-0">
                        {student.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900
                        dark:text-white">
                        {student.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500 dark:text-gray-400">
                    {student.email}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {student.enrolledIn?.map(({ courseTitle }, idx) => (
                        <span key={idx}
                          className="text-xs bg-blue-50 dark:bg-blue-900/20
                            text-blue-700 dark:text-blue-400 px-2 py-0.5
                            rounded-full">
                          {courseTitle}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-400 dark:text-gray-500">
                    {new Date(student.joinedAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ── Profile Sub-Tab ───────────────────────────────────────────────────────────
const InstructorProfileTab = ({ user }) => {
  const [form,    setForm]    = useState({
    bio:       user?.instructorProfile?.bio       || '',
    website:   user?.instructorProfile?.website   || '',
    expertise: user?.instructorProfile?.expertise?.join(', ') || ''
  });
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await instructorAPI.updateProfile({
        bio:       form.bio,
        website:   form.website,
        expertise: form.expertise.split(',').map(s => s.trim()).filter(Boolean)
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch { alert('Failed to save profile'); }
    finally { setSaving(false); }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm
      border border-gray-100 dark:border-gray-800 p-6 max-w-2xl">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-5">
        Instructor Profile
      </h3>

      <div className="space-y-4">
        {/* Name (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1.5">
            Full Name
          </label>
          <input value={user?.name} readOnly
            className="w-full border border-gray-200 dark:border-gray-700
              bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400
              rounded-xl px-4 py-2.5 text-sm cursor-not-allowed"
          />
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1.5">
            Email
          </label>
          <input value={user?.email} readOnly
            className="w-full border border-gray-200 dark:border-gray-700
              bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400
              rounded-xl px-4 py-2.5 text-sm cursor-not-allowed"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1.5">
            Bio
          </label>
          <textarea
            value={form.bio}
            onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
            placeholder="Tell students about yourself..."
            rows={4}
            className="w-full border border-gray-300 dark:border-gray-700
              bg-white dark:bg-gray-800 text-gray-900 dark:text-white
              rounded-xl px-4 py-2.5 text-sm focus:outline-none
              focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Expertise */}
        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1.5">
            Areas of Expertise (comma-separated)
          </label>
          <input
            type="text"
            value={form.expertise}
            onChange={e => setForm(p => ({ ...p, expertise: e.target.value }))}
            placeholder="e.g. React, Node.js, Python, Data Science"
            className="w-full border border-gray-300 dark:border-gray-700
              bg-white dark:bg-gray-800 text-gray-900 dark:text-white
              rounded-xl px-4 py-2.5 text-sm focus:outline-none
              focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium text-gray-700
            dark:text-gray-300 mb-1.5">
            Website / Portfolio
          </label>
          <input
            type="url"
            value={form.website}
            onChange={e => setForm(p => ({ ...p, website: e.target.value }))}
            placeholder="https://yourwebsite.com"
            className="w-full border border-gray-300 dark:border-gray-700
              bg-white dark:bg-gray-800 text-gray-900 dark:text-white
              rounded-xl px-4 py-2.5 text-sm focus:outline-none
              focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0  }}
            className="flex items-center gap-2 text-green-600
              dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/20
              border border-green-200 dark:border-green-800 px-4 py-3
              rounded-xl">
            <CheckCircle size={16} /> Profile updated successfully!
          </motion.div>
        )}

        <button onClick={handleSave} disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300
            text-white font-semibold px-6 py-2.5 rounded-xl text-sm
            transition-colors">
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
};

export default InstructorDashboard;
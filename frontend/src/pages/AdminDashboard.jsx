// pages/AdminDashboard.jsx — Professional Admin Dashboard
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Users, TrendingUp, Eye,
  PlusCircle, Pencil, Trash2, Upload,
  CheckCircle, XCircle, BarChart3, ArrowRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { courseAPI, authAPI } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import StatCard        from '../components/StatCard';
import Loader          from '../components/Loader';
import { SERVER_URL }  from '../services/api';
import ModuleBuilder   from '../components/ModuleBuilder';
import { quizAPI } from '../services/api';
import AdminCertificates from '../components/AdminCertificates';
import { instructorAPI } from '../services/api';
import { GraduationCap } from 'lucide-react';

// ── Reusable Course Form Modal ─────────────────────────────────────────────────
const CourseFormModal = ({ editCourse, onClose, onSaved }) => {
  const isEdit = !!editCourse;
  const [formData, setFormData] = useState({
    title:       editCourse?.title       || '',
    description: editCourse?.description || '',
    instructor:  editCourse?.instructor  || '',
    category:    editCourse?.category    || 'Web Development',
    level:       editCourse?.level       || 'Beginner',
    price:       editCourse?.price       || 0,
    duration:    editCourse?.duration    || ''
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => data.append(k, v));
      if (thumbnail) data.append('thumbnail', thumbnail);
      isEdit
        ? await courseAPI.update(editCourse._id, data)
        : await courseAPI.create(data);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save.');
    } finally {
      setLoading(false);
    }
  };

  const CATEGORIES = ['Web Development','Mobile Development','Data Science',
    'Machine Learning','Design','Business','Other'];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex
      items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1   }}
        className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl
          max-h-[90vh] overflow-y-auto shadow-2xl border
          border-gray-200 dark:border-gray-700">

        <div className="flex items-center justify-between p-6 border-b
          border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {isEdit ? '✏️ Edit Course' : '➕ Add New Course'}
          </h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center
              text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 text-xl">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200
              dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl
              px-4 py-3 text-sm">
              ⚠️ {error}
            </div>
          )}

          {[
            { name:'title',      label:'Course Title *',  type:'text',   placeholder:'e.g. Complete React Bootcamp' },
            { name:'instructor', label:'Instructor *',    type:'text',   placeholder:'e.g. Jane Smith' },
            { name:'duration',   label:'Duration',        type:'text',   placeholder:'e.g. 12 hours' },
          ].map(field => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700
                dark:text-gray-300 mb-1">{field.label}</label>
              <input type={field.type} name={field.name}
                value={formData[field.name]} placeholder={field.placeholder}
                required={field.label.includes('*')}
                onChange={e => setFormData(p => ({...p, [e.target.name]: e.target.value}))}
                className="w-full border border-gray-300 dark:border-gray-700
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                  rounded-xl px-4 py-2.5 text-sm focus:outline-none
                  focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700
              dark:text-gray-300 mb-1">Description *</label>
            <textarea name="description" rows={3} required
              value={formData.description} placeholder="What will students learn?"
              onChange={e => setFormData(p => ({...p, description: e.target.value}))}
              className="w-full border border-gray-300 dark:border-gray-700
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                rounded-xl px-4 py-2.5 text-sm focus:outline-none
                focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700
                dark:text-gray-300 mb-1">Category *</label>
              <select name="category" value={formData.category}
                onChange={e => setFormData(p => ({...p, category: e.target.value}))}
                className="w-full border border-gray-300 dark:border-gray-700
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                  rounded-xl px-3 py-2.5 text-sm focus:outline-none
                  focus:ring-2 focus:ring-blue-500">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700
                dark:text-gray-300 mb-1">Level</label>
              <select name="level" value={formData.level}
                onChange={e => setFormData(p => ({...p, level: e.target.value}))}
                className="w-full border border-gray-300 dark:border-gray-700
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                  rounded-xl px-3 py-2.5 text-sm focus:outline-none
                  focus:ring-2 focus:ring-blue-500">
                {['Beginner','Intermediate','Advanced'].map(l =>
                  <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700
                dark:text-gray-300 mb-1">Price ($)</label>
              <input type="number" min="0" name="price"
                value={formData.price}
                onChange={e => setFormData(p => ({...p, price: e.target.value}))}
                className="w-full border border-gray-300 dark:border-gray-700
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                  rounded-xl px-4 py-2.5 text-sm focus:outline-none
                  focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700
              dark:text-gray-300 mb-1">Thumbnail Image</label>
            <input type="file" accept="image/*"
              onChange={e => setThumbnail(e.target.files[0])}
              className="w-full text-sm text-gray-500 border border-gray-300
                dark:border-gray-700 rounded-xl px-3 py-2
                file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0
                file:bg-blue-50 dark:file:bg-blue-900/20 file:text-blue-600
                dark:file:text-blue-400 hover:file:bg-blue-100"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-300 dark:border-gray-700
                text-gray-700 dark:text-gray-300 py-2.5 rounded-xl
                hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium
                transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700
                disabled:bg-blue-300 text-white py-2.5 rounded-xl
                text-sm font-medium transition-colors">
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Course'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ── Upload Modal ───────────────────────────────────────────────────────────────
const UploadModal = ({ course, type, onClose, onUploaded }) => {
  const [file, setFile]   = useState(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please select a file');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append(type, file);
      fd.append('title', title || file.name);
      type === 'video'
        ? await courseAPI.uploadVideo(course._id, fd)
        : await courseAPI.uploadPDF(course._id, fd);
      onUploaded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex
      items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1   }}
        className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md
          shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-5 border-b
          border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 dark:text-white">
            {type === 'video' ? '🎥' : '📄'} Upload {type === 'video' ? 'Video' : 'PDF'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <form onSubmit={handleUpload} className="p-5 space-y-4">
          {error && (
            <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20
              px-3 py-2 rounded-xl">⚠️ {error}</p>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700
              dark:text-gray-300 mb-1">File *</label>
            <input type="file" required
              accept={type === 'video' ? 'video/*' : 'application/pdf'}
              onChange={e => setFile(e.target.files[0])}
              className="w-full text-sm border border-gray-300 dark:border-gray-700
                rounded-xl px-3 py-2 file:mr-3 file:py-1 file:px-3
                file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700
              dark:text-gray-300 mb-1">Title</label>
            <input type="text" value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={type === 'video' ? 'e.g. Intro to React' : 'e.g. Chapter 1 Notes'}
              className="w-full border border-gray-300 dark:border-gray-700
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                rounded-xl px-4 py-2.5 text-sm focus:outline-none
                focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-300 dark:border-gray-700
                text-gray-700 dark:text-gray-300 py-2.5 rounded-xl text-sm
                hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white
                py-2.5 rounded-xl text-sm font-medium transition-colors
                disabled:bg-blue-300">
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ── Fake chart data (replace with real data later) ────────────────────────────
const enrollmentData = [
  { month: 'Jan', enrollments: 12 },
  { month: 'Feb', enrollments: 19 },
  { month: 'Mar', enrollments: 15 },
  { month: 'Apr', enrollments: 27 },
  { month: 'May', enrollments: 32 },
  { month: 'Jun', enrollments: 24 },
];

const categoryData = [
  { name: 'Web Dev',  courses: 5 },
  { name: 'Design',   courses: 3 },
  { name: 'Data Sci', courses: 2 },
  { name: 'Mobile',   courses: 2 },
];

// ── Main Component ─────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [courses,          setCourses]          = useState([]);
  const [students,         setStudents]         = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [activeTab,        setActiveTab]        = useState('overview');
  const [showCourseForm, setShowCourseForm]     = useState(false);
  const [editCourse,       setEditCourse]       = useState(null);
  const [uploadModal,      setUploadModal]      = useState(null);
  const [curriculumCourse, setCurriculumCourse] = useState(null); 
  const [totalQuizCount, setTotalQuizCount]     = useState(0);
  const [instructors, setInstructors]           = useState([]);

  const fetchData = async () => {
  setLoading(true);

  try {
    // 1. Fetch courses first
    const cRes = await courseAPI.getAll({ limit: 100 });
    const courseList = cRes.data.courses || [];

    setCourses(courseList);

    // 2. Fetch students separately
    try {
      const sRes = await authAPI.getAllStudents();
      setStudents(sRes.data.students || sRes.data.users || []);
    } catch (err) {
      console.error('Students fetch error:', err);
      setStudents([]);
    }

    // 3. Fetch instructors separately
    try {
      const instrRes = await instructorAPI.getAll();
      setInstructors(instrRes.data.instructors || []);
    } catch (err) {
      console.error('Instructors fetch error:', err);
      setInstructors([]);
    }

    // 4. Fetch quiz count separately
    try {
      const quizCounts = await Promise.all(
        courseList.map(c => quizAPI.getByCourse(c._id))
      );

      const totalQuizzes = quizCounts.reduce(
        (sum, r) => sum + (r.data.quizzes?.length || 0),
        0
      );

      setTotalQuizCount(totalQuizzes);
    } catch (err) {
      console.error('Quiz count fetch error:', err);
      setTotalQuizCount(0);
    }

  } catch (err) {
    console.error('Courses fetch error:', err);
    setCourses([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await courseAPI.delete(id);
      setCourses(p => p.filter(c => c._id !== id));
    } catch { alert('Delete failed.'); }
  };

  const handleTogglePublish = async (id) => {
    try {
      const { data } = await courseAPI.togglePublish(id);
      setCourses(p => p.map(c =>
        c._id === id ? { ...c, isPublished: data.isPublished } : c
      ));
    } catch { alert('Failed to update.'); }
  };

  if (loading) return (
    <DashboardLayout title="Admin Dashboard">
      <Loader text="Loading dashboard..." />
    </DashboardLayout>
  );

  const totalEnrollments = courses.reduce(
    (sum, c) => sum + (c.enrolledStudents?.length || 0), 0
  );
  const publishedCount = courses.filter(c => c.isPublished).length;

  const TABS = [
    { id: 'overview',  label: '📊 Overview'  },
    { id: 'courses',   label: '📚 Courses'   },
    { id: 'students',  label: '👥 Students'  },
    { id: 'instructors', label: '🎓 Instructors' },
    { id: 'analytics', label: '📈 Analytics' },
    { id: 'certificates', label: '🏆 Certificates' },
  ];

  return (
    <DashboardLayout title="Admin Dashboard" subtitle="Manage your platform">

      {/* ── Header Row ────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}>
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setEditCourse(null); setShowCourseForm(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700
            text-white text-sm font-semibold px-4 py-2.5 rounded-xl
            transition-colors shadow-sm">
          <PlusCircle size={16} /> New Course
        </button>
      </div>

      {/* ── TAB: Overview ─────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={BookOpen}    label="Total Courses"     value={courses.length}      color="blue"   delay={0}   trend={5}  />
            <StatCard icon={CheckCircle} label="Published"         value={publishedCount}      color="green"  delay={0.1} trend={12} />
            <StatCard icon={Users}       label="Total Students"    value={students.length}     color="purple" delay={0.2} trend={18} />
            <StatCard icon={TrendingUp}  label="Total Enrollments" value={totalEnrollments}    color="orange" delay={0.3} trend={8}  />
            <StatCard
              icon={BookOpen}
              label="Total Quizzes"
              value={totalQuizCount}
              color="purple"
              delay={0.4}
            />
          </div>

          {/* Recent courses table */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm
            border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4
              border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Recent Courses
              </h3>
              <button onClick={() => setActiveTab('courses')}
                className="text-blue-600 dark:text-blue-400 text-sm
                  hover:underline flex items-center gap-1">
                View all <ArrowRight size={14} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    {['Course','Category','Students','Status','Actions'].map(h => (
                      <th key={h} className="text-left px-6 py-3 text-xs font-semibold
                        text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {courses.slice(0,5).map(course => (
                    <tr key={course._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-blue-100
                            dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                            <BookOpen size={16} className="text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="font-medium text-gray-900
                            dark:text-white truncate max-w-xs">
                            {course.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {course.category}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {course.enrolledStudents?.length || 0}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1
                          rounded-full text-xs font-medium
                          ${course.isPublished
                            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                          }`}>
                          {course.isPublished ? <CheckCircle size={10}/> : <XCircle size={10}/>}
                          {course.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setEditCourse(course); setShowCourseForm(true); }}
                            className="p-1.5 text-gray-400 hover:text-blue-600
                              hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(course._id, course.title)}
                            className="p-1.5 text-gray-400 hover:text-red-600
                              hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Courses ──────────────────────────────────────── */}
      {activeTab === 'courses' && (
        <div className="space-y-3">
          {courses.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-900
              rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
              <BookOpen size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500">No courses yet.</p>
            </div>
          ) : (
            courses.map((course, i) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y:  0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border
                  border-gray-100 dark:border-gray-800 p-4 flex flex-col
                  md:flex-row gap-4 hover:shadow-md transition-shadow">

                {/* Thumbnail */}
                <div className="flex-shrink-0">
                  {course.thumbnail ? (
                    <img src={`${SERVER_URL}/${course.thumbnail}`}
                      alt={course.title}
                      className="w-20 h-14 object-cover rounded-xl" />
                  ) : (
                    <div className="w-20 h-14 bg-blue-100 dark:bg-blue-900/30
                      rounded-xl flex items-center justify-center">
                      <BookOpen size={22} className="text-blue-500" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                      {course.title}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                      ${course.isPublished
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                      {course.isPublished ? '✅ Published' : '⏳ Draft'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {course.category} • {course.level} •
                    👥 {course.enrolledStudents?.length || 0} students •
                    🎥 {course.videos?.length || 0} videos •
                    📄 {course.pdfs?.length || 0} PDFs
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 items-center flex-shrink-0">
                  <button onClick={() => setCurriculumCourse(course)}
                    className="text-xs px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/20
                      text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200
                      rounded-lg font-medium transition-colors">
                    📚 Curriculum
                  </button>
                  <button onClick={() => handleTogglePublish(course._id)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors
                      ${course.isPublished
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400'
                      }`}>
                    {course.isPublished ? '⬇ Unpublish' : '⬆ Publish'}
                  </button>
                  <button onClick={() => setUploadModal({ course, type: 'video' })}
                    className="text-xs px-3 py-1.5 bg-purple-100 dark:bg-purple-900/20
                      text-purple-700 dark:text-purple-400 hover:bg-purple-200
                      rounded-lg font-medium transition-colors">
                    🎥 Video
                  </button>
                  <button onClick={() => setUploadModal({ course, type: 'pdf' })}
                    className="text-xs px-3 py-1.5 bg-orange-100 dark:bg-orange-900/20
                      text-orange-700 dark:text-orange-400 hover:bg-orange-200
                      rounded-lg font-medium transition-colors">
                    📄 PDF
                  </button>
                  <button onClick={() => { setEditCourse(course); setShowCourseForm(true); }}
                    className="text-xs px-3 py-1.5 bg-blue-100 dark:bg-blue-900/20
                      text-blue-700 dark:text-blue-400 hover:bg-blue-200
                      rounded-lg font-medium transition-colors">
                    ✏️ Edit
                  </button>
                  <button onClick={() => handleDelete(course._id, course.title)}
                    className="text-xs px-3 py-1.5 bg-red-100 dark:bg-red-900/20
                      text-red-700 dark:text-red-400 hover:bg-red-200
                      rounded-lg font-medium transition-colors">
                    🗑 Delete
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* ── TAB: Students ─────────────────────────────────────── */}
      {activeTab === 'students' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm
          border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              All Students ({students.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  {['Student', 'Email', 'Enrolled', 'Joined'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold
                      text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {students.map(s => (
                  <tr key={s._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600
                          flex items-center justify-center text-white text-sm font-bold">
                          {s.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {s.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{s.email}</td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-700
                        dark:text-blue-400 text-xs px-2 py-1 rounded-full font-medium">
                        {s.enrolledCourses?.length || 0} courses
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 dark:text-gray-500">
                      {new Date(s.createdAt).toLocaleDateString('en-US',
                        { year:'numeric', month:'short', day:'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB: Instructors ─────────────────────────────────── */}
      {activeTab === 'instructors' && (
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm
        border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            All Instructors ({instructors.length})
          </h3>
        </div>

        {instructors.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <GraduationCap size={36} className="mx-auto mb-3" />
            <p>No instructors yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  {['Instructor', 'Email', 'Courses', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs
                      font-semibold text-gray-500 dark:text-gray-400
                      uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {instructors.map(inst => (
                  <tr key={inst._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-600
                          flex items-center justify-center text-white
                          text-sm font-bold flex-shrink-0">
                          {inst.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {inst.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400">
                      {inst.email}
                    </td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400">
                      {inst.courseCount}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full
                        font-medium
                        ${inst.isApproved
                          ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                        }`}>
                        {inst.isApproved
                          ? '✅ Approved'
                          : '⏳ Pending'
                        }
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={async () => {
                         await instructorAPI.toggleApproval(inst._id);
                          fetchData();
                        }}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium
                          transition-colors
                          ${inst.isApproved
                            ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400'
                            : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400'
                          }`}>
                        {inst.isApproved
                          ? 'Revoke'
                          : 'Approve'
                        }
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>
      )}

      {/* ── TAB: Analytics ────────────────────────────────────── */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Enrollment trend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0  }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm
                border border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                📈 Enrollment Trend
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={enrollmentData}>
                  <defs>
                    <linearGradient id="colorEnroll" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="enrollments"
                    stroke="#3b82f6" fill="url(#colorEnroll)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Courses by category */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0  }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm
                border border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                📊 Courses by Category
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="courses" fill="#3b82f6" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={BarChart3}   label="Avg Enrollments/Course" value={courses.length ? Math.round(totalEnrollments/courses.length) : 0} color="blue"   delay={0}   />
            <StatCard icon={BookOpen}    label="Draft Courses"          value={courses.length - publishedCount} color="orange" delay={0.1} />
            <StatCard icon={Users}       label="Active Students"        value={students.length} color="purple" delay={0.2} />
            <StatCard icon={TrendingUp}  label="Published Rate"         value={courses.length ? `${Math.round(publishedCount/courses.length*100)}%` : '0%'} color="green" delay={0.3} />
          </div>
        </div>
      )}

      {/* ── TAB: Certificates ─────────────────────────────────── */}
      {activeTab === 'certificates' && (
        <AdminCertificates />
      )}

      {/* ── Modals ────────────────────────────────────────────── */}
      {showCourseForm && (
        <CourseFormModal
          editCourse={editCourse}
          onClose={() => { setShowCourseForm(false); setEditCourse(null); }}
          onSaved={fetchData}
        />
      )}
      {uploadModal && (
        <UploadModal
          course={uploadModal.course}
          type={uploadModal.type}
          onClose={() => setUploadModal(null)}
          onUploaded={fetchData}
        />
      )}
      {curriculumCourse && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm
          flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1   }}
            className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-3xl
              max-h-[90vh] overflow-y-auto shadow-2xl border
              border-gray-200 dark:border-gray-700">
            {/* Modal header */}
            <div className="sticky top-0 flex items-center justify-between
              p-5 border-b border-gray-200 dark:border-gray-700
              bg-white dark:bg-gray-900 z-10">
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white">
                  📚 Curriculum Builder
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {curriculumCourse.title}
                </p>
              </div>
              <button
                onClick={() => setCurriculumCourse(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center
                  text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800
                  transition-colors text-xl">
                ×
              </button>
            </div>
            {/* Module builder */}
            <div className="p-5">
              <ModuleBuilder courseId={curriculumCourse._id} />
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;
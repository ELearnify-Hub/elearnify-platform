// pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { courseAPI, authAPI }   from '../services/api';
import Loader from '../components/Loader';

// ─── Sub-components defined in this file ──────────────────────────────────────
// We keep them here to avoid too many small files at this stage

// ── Stats Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color }) => (
  <div className={`bg-white rounded-xl p-5 shadow-sm border-l-4 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
      <span className="text-4xl">{icon}</span>
    </div>
  </div>
);

// ── Course Form Modal ──────────────────────────────────────────────────────────
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
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Use FormData because we might have a file (thumbnail)
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => data.append(key, val));
      if (thumbnail) data.append('thumbnail', thumbnail);

      if (isEdit) {
        await courseAPI.update(editCourse._id, data);
      } else {
        await courseAPI.create(data);
      }

      onSaved(); // Refresh course list in parent
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save course.');
    } finally {
      setLoading(false);
    }
  };

  const CATEGORIES = [
    'Web Development', 'Mobile Development', 'Data Science',
    'Machine Learning', 'Design', 'Business', 'Other'
  ];

  return (
    /* Modal Backdrop */
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {isEdit ? '✏️ Edit Course' : '➕ Add New Course'}
          </h2>
          <button onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Title *
            </label>
            <input
              type="text" name="title"
              value={formData.title} onChange={handleChange}
              placeholder="e.g. Complete React.js Bootcamp"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description} onChange={handleChange}
              placeholder="Describe what students will learn..."
              required rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Instructor + Duration (side by side) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instructor *
              </label>
              <input
                type="text" name="instructor"
                value={formData.instructor} onChange={handleChange}
                placeholder="e.g. John Doe"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration
              </label>
              <input
                type="text" name="duration"
                value={formData.duration} onChange={handleChange}
                placeholder="e.g. 12 hours"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Category + Level + Price */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select name="category" value={formData.category} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <select name="level" value={formData.level} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {['Beginner', 'Intermediate', 'Advanced'].map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input
                type="number" name="price" min="0"
                value={formData.price} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Thumbnail Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thumbnail Image
            </label>
            <input
              type="file" accept="image/*"
              onChange={(e) => setThumbnail(e.target.files[0])}
              className="w-full text-sm text-gray-500 border border-gray-300 rounded-lg px-3 py-2 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {isEdit && editCourse.thumbnail && !thumbnail && (
              <p className="text-xs text-gray-400 mt-1">
                Current thumbnail will be kept if no new file is selected.
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2.5 rounded-xl transition-colors text-sm font-medium">
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Upload Modal (for videos and PDFs) ────────────────────────────────────────
const UploadModal = ({ course, type, onClose, onUploaded }) => {
  // type = 'video' or 'pdf'
  const [file,    setFile]    = useState(null);
  const [title,   setTitle]   = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please select a file');

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append(type, file);    // field name must match multer: 'video' or 'pdf'
      formData.append('title', title || file.name);
      if (type === 'video' && duration) {
        formData.append('duration', duration);
      }

      if (type === 'video') {
        await courseAPI.uploadVideo(course._id, formData);
      } else {
        await courseAPI.uploadPDF(course._id, formData);
      }

      onUploaded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  const accept = type === 'video' ? 'video/mp4,video/mpeg,video/webm' : 'application/pdf';
  const icon   = type === 'video' ? '🎥' : '📄';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold text-gray-800">
            {icon} Upload {type === 'video' ? 'Video' : 'PDF'} — {course.title}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        <form onSubmit={handleUpload} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
              ⚠️ {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {type === 'video' ? 'Video' : 'PDF'} File *
            </label>
            <input type="file" accept={accept}
              onChange={(e) => setFile(e.target.files[0])} required
              className="w-full text-sm text-gray-500 border border-gray-300 rounded-lg px-3 py-2 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder={type === 'video' ? 'e.g. Introduction to React' : 'e.g. Chapter 1 Notes'}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {type === 'video' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (optional)
              </label>
              <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 12:34"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl hover:bg-gray-50 text-sm font-medium">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2.5 rounded-xl text-sm font-medium">
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main AdminDashboard Component ────────────────────────────────────────────
const AdminDashboard = () => {
  const [activeTab,      setActiveTab]      = useState('overview');
  const [courses,        setCourses]        = useState([]);
  const [students,       setStudents]       = useState([]);
  const [loading,        setLoading]        = useState(true);

  // Modal states
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editCourse,     setEditCourse]     = useState(null);
  const [uploadModal,    setUploadModal]    = useState(null);
  // uploadModal = { course: {...}, type: 'video'|'pdf' }

  // ── Fetch all data ───────────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all courses (admin sees unpublished too)
      // We'll call without isPublished filter — backend returns all for admin
      const [coursesRes, studentsRes] = await Promise.all([
        courseAPI.getAll({ limit: 100 }),
        authAPI.getAllStudents()
      ]);
      setCourses(coursesRes.data.courses);
      setStudents(studentsRes.data.students);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Delete course ────────────────────────────────────────────────────────
  const handleDelete = async (courseId, courseTitle) => {
    const confirmed = window.confirm(
      `Permanently delete "${courseTitle}"?\n\nThis will also delete all uploaded videos and PDFs.`
    );
    if (!confirmed) return;

    try {
      await courseAPI.delete(courseId);
      setCourses(prev => prev.filter(c => c._id !== courseId));
    } catch (err) {
      alert('Failed to delete course.');
    }
  };

  // ── Toggle publish ───────────────────────────────────────────────────────
  const handleTogglePublish = async (courseId) => {
    try {
      const { data } = await courseAPI.togglePublish(courseId);
      setCourses(prev =>
        prev.map(c =>
          c._id === courseId ? { ...c, isPublished: data.isPublished } : c
        )
      );
    } catch (err) {
      alert('Failed to update publish status.');
    }
  };

  if (loading) return <Loader text="Loading dashboard..." />;

  // ── Stats ────────────────────────────────────────────────────────────────
  const totalEnrollments = courses.reduce(
    (sum, c) => sum + (c.enrolledStudents?.length || 0), 0
  );
  const publishedCount = courses.filter(c => c.isPublished).length;

  // ── Tab Nav config ───────────────────────────────────────────────────────
  const TABS = [
    { id: 'overview', label: '📊 Overview'  },
    { id: 'courses',  label: '📚 Courses'   },
    { id: 'students', label: '👥 Students'  }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your e-learning platform</p>
        </div>
        <button
          onClick={() => { setEditCourse(null); setShowCourseForm(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors shadow-sm">
          <span className="text-lg">+</span> New Course
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-8 w-fit">
        {TABS.map(tab => (
          <button key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all
              ${activeTab === tab.id
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
              }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB: Overview ─────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard icon="📚" label="Total Courses"   value={courses.length}      color="border-blue-500"  />
            <StatCard icon="✅" label="Published"       value={publishedCount}      color="border-green-500" />
            <StatCard icon="👥" label="Total Students"  value={students.length}     color="border-purple-500"/>
            <StatCard icon="🎓" label="Total Enrollments" value={totalEnrollments}  color="border-yellow-500"/>
          </div>

          {/* Recent Courses Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Recent Courses</h2>
              <button onClick={() => setActiveTab('courses')}
                className="text-blue-600 text-sm hover:underline">
                View all →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Title', 'Category', 'Students', 'Status'].map(h => (
                      <th key={h} className="text-left px-6 py-3 text-gray-500 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {courses.slice(0, 5).map(course => (
                    <tr key={course._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-800 max-w-xs truncate">
                        {course.title}
                      </td>
                      <td className="px-6 py-4 text-gray-500">{course.category}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {course.enrolledStudents?.length || 0}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                          ${course.isPublished
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                          }`}>
                          {course.isPublished ? 'Published' : 'Draft'}
                        </span>
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
        <div className="space-y-4">
          {courses.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-gray-500">No courses yet. Create your first course!</p>
            </div>
          ) : (
            courses.map(course => (
              <div key={course._id}
                className="bg-white rounded-xl shadow-sm p-5 flex flex-col md:flex-row gap-4 hover:shadow-md transition-shadow">

                {/* Thumbnail */}
                <div className="flex-shrink-0">
                  {course.thumbnail ? (
                    <img src={`http://localhost:5000/${course.thumbnail}`}
                      alt={course.title}
                      className="w-24 h-16 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-24 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📚</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-grow min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-800 truncate">{course.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      course.isPublished
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {course.category} • {course.level} •
                    {course.enrolledStudents?.length || 0} students •
                    {course.videos?.length || 0} videos •
                    {course.pdfs?.length || 0} PDFs
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 items-start flex-shrink-0">
                  {/* Publish toggle */}
                  <button
                    onClick={() => handleTogglePublish(course._id)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      course.isPublished
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}>
                    {course.isPublished ? '⬇ Unpublish' : '⬆ Publish'}
                  </button>

                  {/* Upload Video */}
                  <button
                    onClick={() => setUploadModal({ course, type: 'video' })}
                    className="text-xs px-3 py-1.5 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg font-medium transition-colors">
                    🎥 Video
                  </button>

                  {/* Upload PDF */}
                  <button
                    onClick={() => setUploadModal({ course, type: 'pdf' })}
                    className="text-xs px-3 py-1.5 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg font-medium transition-colors">
                    📄 PDF
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => { setEditCourse(course); setShowCourseForm(true); }}
                    className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-medium transition-colors">
                    ✏️ Edit
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(course._id, course.title)}
                    className="text-xs px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium transition-colors">
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── TAB: Students ─────────────────────────────────────── */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold text-gray-800">
              Registered Students ({students.length})
            </h2>
          </div>

          {students.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">👥</div>
              <p>No students registered yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Student', 'Email', 'Enrolled Courses', 'Joined'].map(h => (
                      <th key={h} className="text-left px-6 py-3 text-gray-500 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map(student => (
                    <tr key={student._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                            {student.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-800">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{student.email}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {student.enrolledCourses?.length || 0} course(s)
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {new Date(student.createdAt).toLocaleDateString('en-US', {
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
    </div>
  );
};

export default AdminDashboard;